import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Users, Clock, MapPin, Calendar, 
  BookOpen, Plus, Trash2, Search, UserPlus, 
  Info 
} from 'lucide-react';
import { getGroupById, enrollStudent, unenrollStudent, getStudents } from '../services/api';
import Modal from '../components/common/Modal';

const GroupDetail = ({ students, getStudents: refreshStudents, fetchGroups }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const res = await getGroupById(id);
      setGroup(res.data);
    } catch (err) {
      console.error('Error fetching group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (studentId) => {
    try {
      await enrollStudent(id, studentId);
      await fetchGroup();
      if (refreshStudents) refreshStudents();
      if (fetchGroups) fetchGroups();
      setIsEnrollModalOpen(false);
    } catch (err) {
      console.error('Enroll error:', err);
    }
  };

  const handleUnenroll = async (studentId) => {
    if (!window.confirm("O'quvchini guruhdan chiqarmoqchimisiz?")) return;
    try {
      await unenrollStudent(id, studentId);
      await fetchGroup();
      if (refreshStudents) refreshStudents();
      if (fetchGroups) fetchGroups();
    } catch (err) {
      console.error('Unenroll error:', err);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!group) return (
    <div className="p-10 text-center text-white">Guruh topilmadi</div>
  );

  const currentStudentIds = group.students?.map(s => s.id) || [];
  const availableStudents = students.filter(s => 
    !currentStudentIds.includes(s.id) &&
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Breadcrumbs / Back */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/groups')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Guruhlar ro'yxatiga qaytish</span>
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-[#131520] border border-white/10 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
              <BookOpen size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-bold text-white tracking-tight">{group.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${group.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                  {group.isActive ? 'Faol' : 'Yakunlangan'}
                </span>
              </div>
              <p className="text-indigo-400 font-medium flex items-center gap-2">
                {group.course?.field?.name} <span className="text-gray-600">/</span> {group.course?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all">
              <Info size={18} />
              Guruhni tahrirlash
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all"
            >
              <UserPlus size={18} />
              O'quvchi qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#131520] p-1.5 rounded-2xl border border-white/10 w-fit mb-8 shadow-xl">
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Info size={18} />
          Umumiy ma'lumot
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Users size={18} />
          O'quvchilar ro'yxati 
          <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500'}`}>
            {group.students?.length || 0}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Info Cards */}
            <div className="bg-[#131520] border border-white/10 p-8 rounded-3xl shadow-xl shadow-black/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Dars jadvali</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-500">Dars vaqti</span>
                  <span className="text-white font-bold">{group.startTime} - {group.endTime}</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-gray-500 text-sm mb-1">Dars kunlari</span>
                  <div className="flex flex-wrap gap-2">
                    {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(d => (
                      <span key={d} className={`px-4 py-2 rounded-xl text-xs font-bold ${group.days.includes(d) ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-gray-600 border border-transparent'}`}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#131520] border border-white/10 p-8 rounded-3xl shadow-xl shadow-black/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Mas'ullar</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                    {group.teacher?.name?.substring(0, 1) || 'U'}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">O'qituvchi</p>
                    <p className="text-sm font-bold text-white">{group.teacher?.name || 'Biriktirilmagan'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Xona</p>
                    <p className="text-sm font-bold text-white">{group.room?.name || 'Belgilanmagan'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#131520] border border-white/10 p-8 rounded-3xl shadow-xl shadow-black/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Sana va To'lov</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-500">Boshlanish</span>
                  <span className="text-white font-bold">{group.startDate}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-500">Tugash</span>
                  <span className="text-white font-bold">{group.endDate}</span>
                </div>
                <div className="flex justify-between items-center py-3 pt-4">
                  <span className="text-gray-500">Oylik to'lov</span>
                  <span className="text-2xl font-black text-emerald-400">{parseInt(group.monthlyPrice).toLocaleString()} UZS</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#131520] border border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/20 border-t-0 rounded-t-none">
            <div className="p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                Guruh o'quvchilari
                <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-black">
                  {group.students?.length || 0}
                </span>
              </h3>
              <button 
                onClick={() => setIsEnrollModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Plus size={18} />
                O'quvchi qo'shish
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.01] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="px-8 py-5">O'quvchi</th>
                    <th className="px-8 py-5">Telefon</th>
                    <th className="px-8 py-5">Maktab / Sinf</th>
                    <th className="px-8 py-5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {group.students && group.students.length > 0 ? group.students.map(s => (
                    <tr key={s.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 font-bold border border-white/10 shadow-inner">
                            {s.name.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{s.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">ID: {s.externalId || 'S-' + s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-gray-400 font-medium">{s.phone || '—'}</td>
                      <td className="px-8 py-5">
                        <div className="text-sm text-gray-300 font-medium">
                          {s.schoolName || '—'}
                          {s.classroom && <span className="text-gray-600 mx-2">|</span>}
                          {s.classroom}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleUnenroll(s.id)}
                          className="p-2 text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Users size={48} className="text-gray-700 mb-4 opacity-50" />
                          <p className="text-gray-500 font-medium">Bu guruhda hali o'quvchilar yo'q</p>
                          <button 
                            onClick={() => setIsEnrollModalOpen(true)}
                            className="mt-4 text-indigo-400 hover:text-indigo-300 font-bold text-sm underline underline-offset-4 decoration-2"
                          >
                            O'quvchi biriktirishni boshlash
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      <Modal 
        isOpen={isEnrollModalOpen} 
        onClose={() => setIsEnrollModalOpen(false)} 
        title="O'quvchini guruhga qo'shish"
      >
        <div className="p-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O'quvchi ismini yozing..."
              className="w-full bg-[#131520] border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {availableStudents.length > 0 ? availableStudents.map(s => (
              <div 
                key={s.id}
                className="flex items-center justify-between p-4 bg-[#1a1c2a] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 font-bold">
                    {s.name.substring(0, 1)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.phone || 'Telefon yo\'q'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleEnroll(s.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Plus size={14} />
                  Qo'shish
                </button>
              </div>
            )) : (
              <div className="py-10 text-center text-gray-500 italic text-sm">
                {searchQuery ? "O'quvchilar topilmadi" : "Guruhga qo'shish mumkin bo'lgan o'quvchilar yo'q"}
              </div>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default GroupDetail;
