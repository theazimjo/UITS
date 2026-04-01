import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Users, Clock, MapPin, Calendar,
  BookOpen, Plus, Trash2, Search, UserPlus,
  Info, Edit2, CreditCard, Download, ArrowRight,
  History, CheckCircle, XCircle, Flag, UserMinus, UserCheck,
  RefreshCw, ArrowRightCircle
} from 'lucide-react';
import {
  getGroupById, enrollStudent, unenrollStudent, getStudents,
  updateGroup, getPaymentsByGroup, updateEnrollmentStatus, completeGroup,
  transferGroup
} from '../services/api';
import Modal from '../components/common/Modal';

const GroupDetail = ({
  students, getStudents: refreshStudents, fetchGroups,
  fields = [], courses = [], rooms = [], staffList = []
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editFormData, setEditFormData] = useState({
    name: '', sohaId: '', courseId: '', roomId: '', teacherId: '', days: [], startTime: '', endTime: '', startDate: '', endDate: '', monthlyPrice: '', status: ''
  });
  
  const [completeFormData, setCompleteFormData] = useState({
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [transferFormData, setTransferFormData] = useState({
    teacherId: '',
    sohaId: '',
    courseId: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const getGroupStatusDetails = (status) => {
    switch (status) {
      case 'WAITING': return { label: "Yig'ilmoqda", color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'ACTIVE': return { label: "Faol", color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'COMPLETED': return { label: "Tugatilgan", color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'CANCELLED': return { label: "Bekor qilingan", color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      default: return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const getEnrollmentStatusDetails = (status) => {
    switch (status) {
      case 'ACTIVE': return { label: "O'qimoqda", color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'DROPPED': return { label: "Tark etdi", color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'GRADUATED': return { label: "Guruhni bitirdi", color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default: return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchPayments();
  }, [id]);

  const fetchPayments = async () => {
    try {
      const res = await getPaymentsByGroup(id);
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const handlePrevMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(date.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(date.toISOString().substring(0, 7));
  };

  // Sync End date with duration in Edit Modal
  useEffect(() => {
    if (editFormData.startDate && editFormData.courseId) {
      const course = courses.find(c => c.id === parseInt(editFormData.courseId));
      if (course) {
        const start = new Date(editFormData.startDate);
        const end = new Date(start.setMonth(start.getMonth() + parseInt(course.duration)));
        setEditFormData(prev => ({
          ...prev,
          endDate: end.toISOString().split('T')[0],
          monthlyPrice: course.monthlyPrice
        }));
      }
    }
  }, [editFormData.startDate, editFormData.courseId, courses]);

  const fetchGroup = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await getGroupById(id);
      const g = res.data;
      setGroup(g);
      
      setEditFormData({
        name: g.name,
        sohaId: g.course?.field?.id || '',
        courseId: g.course?.id || '',
        roomId: g.room?.id || '',
        teacherId: g.teacher?.id || '',
        days: g.days || [],
        startTime: g.startTime,
        endTime: g.endTime,
        startDate: g.startDate,
        endDate: g.endDate,
        monthlyPrice: g.monthlyPrice,
        status: g.status
      });

      setTransferFormData({
        teacherId: g.teacher?.id || '',
        sohaId: g.course?.field?.id || '',
        courseId: g.course?.id || '',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error fetching group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editFormData,
        courseId: parseInt(editFormData.courseId),
        roomId: parseInt(editFormData.roomId),
        teacherId: parseInt(editFormData.teacherId)
      };
      await updateGroup(id, payload);
      await fetchGroup();
      if (fetchGroups) fetchGroups();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleCompleteGroup = async (e) => {
    e.preventDefault();
    try {
      await completeGroup(id, completeFormData);
      await fetchGroup();
      if (fetchGroups) fetchGroups();
      setIsCompleteModalOpen(false);
    } catch (err) {
      console.error('Complete error:', err);
    }
  };

  const handleTransferGroup = async (e) => {
    e.preventDefault();
    try {
      await transferGroup(id, {
        teacherId: parseInt(transferFormData.teacherId),
        courseId: parseInt(transferFormData.courseId),
        startDate: transferFormData.startDate
      });
      await fetchGroup();
      if (fetchGroups) fetchGroups();
      setIsTransferModalOpen(false);
    } catch (err) {
      console.error('Transfer error:', err);
    }
  };

  const handleEnroll = async (studentId) => {
    try {
      await enrollStudent(id, studentId);
      await fetchGroup(true);
      if (refreshStudents) refreshStudents();
      if (fetchGroups) fetchGroups();
      setIsEnrollModalOpen(false);
    } catch (err) {
      console.error('Enroll error:', err);
    }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      await updateEnrollmentStatus(id, studentId, status);
      await fetchGroup(true);
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const handleUnenroll = async (studentId) => {
    if (!window.confirm("O'quvchini guruhdan chiqarmoqchimisiz?")) return;
    try {
      await unenrollStudent(id, studentId);
      await fetchGroup(true);
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
    <div className="p-10 text-center text-white font-black text-xl">Guruh topilmadi</div>
  );

  const currentStudentIds = group.enrollments?.map(en => en.student?.id).filter(Boolean) || [];
  const availableStudents = students.filter(s =>
    !currentStudentIds.includes(s.id) &&
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Breadcrumbs */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Guruhlar ro'yxatiga qaytish</span>
        </button>
      </div>

      {/* Header */}
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
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getGroupStatusDetails(group.status).color}`}>
                  {getGroupStatusDetails(group.status).label}
                </span>
              </div>
              <p className="text-indigo-400 font-medium flex items-center gap-2">
                {group.course?.field?.name} <span className="text-gray-600">/</span> {group.course?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {group.status !== 'COMPLETED' && (
              <button
                onClick={() => setIsCompleteModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl text-sm font-semibold border border-purple-500/20 shadow-lg shadow-purple-500/5 transition-all outline-none"
              >
                <Clock size={18} /> Guruhni tugatish
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all outline-none"
            >
              <Edit2 size={18} /> Tahrirlash
            </button>
            {group.status !== 'COMPLETED' && (
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-600 text-amber-500 hover:text-white rounded-xl text-sm font-semibold border border-amber-500/20 shadow-lg shadow-amber-500/5 transition-all outline-none"
              >
                <RefreshCw size={18} /> O'tkazish
              </button>
            )}
            <button
              onClick={() => setActiveTab('students')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all outline-none"
            >
              <UserPlus size={18} /> O'quvchi qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-1 bg-[#131520] p-1.5 rounded-2xl border border-white/10 w-fit mb-8 shadow-xl">
        <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Info size={18} /> Umumiy ma'lumot
        </button>
        <button onClick={() => setActiveTab('students')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Users size={18} /> O'quvchilar
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <History size={18} /> Tarix
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#131520] border border-white/10 p-8 rounded-3xl shadow-xl">
               <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center"><Clock size={24} /></div>
                <h3 className="text-xl font-bold text-white">Dars jadvali</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5 text-sm uppercase tracking-widest font-mono">
                  <span className="text-gray-500">Vaqti</span>
                  <span className="text-white font-bold">{group.startTime} - {group.endTime}</span>
                </div>
                <div className="flex flex-col gap-3 py-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Kunlari</span>
                  <div className="flex flex-wrap gap-2">
                    {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(d => (
                       <span key={d} className={`px-3 py-1.5 rounded-lg text-xs font-black border ${group.days.includes(d) ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-gray-600 border-transparent'}`}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#131520] border border-white/10 p-8 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center"><Users size={24} /></div>
                <h3 className="text-xl font-bold text-white">Mas'ullar</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white">{group.teacher?.name?.substring(0,1)}</div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">O'qituvchi</p>
                    <p className="text-sm font-bold text-white">{group.teacher?.name || '---'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/10 text-orange-400 flex items-center justify-center"><MapPin size={20}/></div>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Xona</p>
                    <p className="text-sm font-bold text-white">{group.room?.name || '---'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#131520] border border-white/10 p-8 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><CreditCard size={24} /></div>
                <h3 className="text-xl font-bold text-white">Moliya va Davomiy</h3>
              </div>
              <div className="space-y-4 text-sm font-mono tracking-tighter">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-500">Boshlanish</span>
                  <span className="text-white font-bold">{group.startDate}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-gray-500">Tugash</span>
                  <span className="text-white font-bold">{group.endDate}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-500">Narxi (oy)</span>
                  <span className="text-xl font-black text-emerald-400">{parseInt(group.monthlyPrice || 0).toLocaleString()} UZS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-[#131520] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.01]">
                <div className="flex items-center gap-6">
                   <h3 className="text-xl font-bold text-white">Talabalar ruyxati</h3>
                   <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
                      <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all"><ChevronLeft size={16}/></button>
                      <span className="px-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] min-w-[140px] text-center">
                        {new Date(selectedMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all"><ArrowRight size={16}/></button>
                   </div>
                </div>
                <button onClick={() => setIsEnrollModalOpen(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-widest">O'quvchi biriktirish</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white/[0.01] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 font-mono">
                      <th className="px-8 py-5">Ism-sharif</th>
                      <th className="px-8 py-5">Guruh holati</th>
                      <th className="px-8 py-5">To'lov Statusi ({selectedMonth})</th>
                      <th className="px-8 py-5 text-right">Boshqaruv</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {group.enrollments?.map(en => {
                      const s = en.student; if (!s) return null;
                      const stPayments = payments.filter(p => p.student?.id === s.id && p.month === selectedMonth);
                      const paid = stPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                      const full = parseFloat(group.monthlyPrice || 0);

                      return (
                        <tr key={en.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-indigo-400 shadow-inner">{s.name?.substring(0,1)}</div>
                              <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{s.name}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <select value={en.status} onChange={(e) => handleStatusChange(s.id, e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-400 outline-none focus:ring-1 focus:ring-indigo-500">
                              <option value="ACTIVE">O'qimoqda</option>
                              <option value="DROPPED">Tark etdi</option>
                              <option value="GRADUATED">Bitirdi</option>
                            </select>
                          </td>
                          <td className="px-8 py-5">
                             {paid >= full ? (
                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black border border-emerald-500/20 uppercase">To'langan</span>
                             ) : paid > 0 ? (
                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black border border-amber-500/20 uppercase">Qisman ({paid.toLocaleString()})</span>
                             ) : (
                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[9px] font-black border border-rose-500/20 uppercase">To'lanmagan</span>
                             )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => handleUnenroll(s.id)} className="p-2 text-gray-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      );
                    })}
                    {(!group.enrollments || group.enrollments.length === 0) && (
                      <tr><td colSpan="4" className="py-20 text-center text-gray-600 font-bold italic">Guruhda hali talabalar yo'q.</td></tr>
                    )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-[#131520] border border-white/10 rounded-3xl p-10 shadow-2xl">
             <div className="max-w-3xl mx-auto space-y-8">
                {(() => {
                  const events = [];
                  if (group.createdAt) events.push({ id:'c', date:new Date(group.createdAt), title:'Guruh yaratildi', desc:`"${group.name}" guruhi ochilib, ish boshladi.`, icon:<Flag size={18} className="text-blue-400"/>});
                  group.enrollments?.forEach(en => {
                    if (en.joinedDate) events.push({ id:'j-'+en.id, date:new Date(en.joinedDate), title:"Loyiha a'zosi qo'shildi", desc:`${en.student?.name} guruhga qabul qilindi.`, icon:<UserPlus size={18} className="text-emerald-400"/>});
                    if (en.status !== 'ACTIVE') events.push({ id:'s-'+en.id, date:new Date(en.updatedAt || new Date()), title: en.status === 'DROPPED' ? "Tark etish" : "Muvaffaqiyatli bitirish", desc:`${en.student?.name} holati "${en.status}" qilib belgilandi.`, icon: en.status === 'DROPPED' ? <XCircle size={18} className="text-rose-400"/> : <CheckCircle size={18} className="text-purple-400"/>});
                  });
                  group.phases?.forEach(ph => {
                    events.push({ id:'p-'+ph.id, date:new Date(ph.startDate), title: ph.endDate ? "O'tkazilgan bosqich" : "Joriy bosqich", desc:`${ph.startDate} dan boshlab ${ph.teacher?.name} tomonidan ${ph.course?.name} darsi olib borilgan.`, icon:<ArrowRightCircle size={18} className={ph.endDate ? "text-amber-500":"text-indigo-400"}/>});
                  });

                  const sorted = events.sort((a,b) => b.date - a.date);
                  if (sorted.length === 0) return <p className="text-center text-gray-600 py-10 italic">Tarix bo'sh</p>;

                  return sorted.map((ev, i) => (
                    <div key={ev.id} className="relative pl-12 pb-10 group last:pb-0">
                      {i !== sorted.length - 1 && <div className="absolute left-[19px] top-8 bottom-0 w-[2px] bg-white/5 group-hover:bg-indigo-500/10 transition-colors"></div>}
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center z-10 group-hover:border-indigo-500/50 transition-all shadow-inner">{ev.icon}</div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="font-black text-white uppercase text-xs tracking-widest">{ev.title}</h4>
                           <span className="text-[9px] font-black text-gray-600 bg-black p-1.5 rounded-lg tracking-widest">{ev.date.toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">{ev.desc}</p>
                      </div>
                    </div>
                  ));
                })()}
             </div>
          </div>
        )}
      </div>

      {/* Full Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Guruh parametrlarini tahrirlash">
         <form onSubmit={handleUpdateGroup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Guruh nomi</label>
                <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Soha (Field)</label>
                <select value={editFormData.sohaId} onChange={e => setEditFormData({ ...editFormData, sohaId: e.target.value, courseId: '' })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Soha tanlang</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Yo'nalish (Course)</label>
                <select value={editFormData.courseId} onChange={e => setEditFormData({ ...editFormData, courseId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" required disabled={!editFormData.sohaId}>
                  {/* Debug log to help identify why products might be hidden */}
                  {(() => {
                    const filtered = courses.filter(c => {
                      const fId = c.field?.id || c.fieldId || (c.field && typeof c.field === 'number' ? c.field : null);
                      return Number(fId) === Number(editFormData.sohaId);
                    });
                    if (editFormData.sohaId && filtered.length === 0) {
                      console.warn(`No courses found for field ID: ${editFormData.sohaId}`, courses);
                    }
                    return filtered.map(c => <option key={c.id} value={c.id}>{c.name}</option>);
                  })()}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Xona</label>
                <select value={editFormData.roomId} onChange={e => setEditFormData({ ...editFormData, roomId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" required>
                  <option value="">Xona tanlang</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">O'qituvchi</label>
                <select value={editFormData.teacherId} onChange={e => setEditFormData({ ...editFormData, teacherId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" required>
                   <option value="">O'qituvchi tanlang</option>
                   {staffList.filter(s => {
                    const r = s.role?.name?.toLowerCase() || '';
                    return r.includes('teacher') || r.includes('o\'qituvchi') || r.includes('ustoz');
                   }).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Boshlash sanasi</label>
                <input type="date" value={editFormData.startDate} onChange={e => setEditFormData({ ...editFormData, startDate: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Tugash sanasi (Vaqtinchalik)</label>
                <input type="date" value={editFormData.endDate} readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-gray-500 font-bold" />
              </div>

              <div className="md:col-span-2">
                 <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Dars kunlari</label>
                 <div className="flex flex-wrap gap-2">
                   {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(day => (
                     <button type="button" key={day} onClick={() => {
                        const d = editFormData.days.includes(day) ? editFormData.days.filter(item => item !== day) : [...editFormData.days, day];
                        setEditFormData({ ...editFormData, days: d });
                     }} className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${editFormData.days.includes(day) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}>{day}</button>
                   ))}
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Status</label>
                <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="WAITING">Yig'ilmoqda</option>
                  <option value="ACTIVE">Faol</option>
                  <option value="COMPLETED">Tugatilgan</option>
                  <option value="CANCELLED">Bekor qilingan</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
               <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-[10px]">Bekor qilish</button>
               <button type="submit" className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-500/40 uppercase tracking-widest active:scale-95 transition-all">O'zgarishlarni saqlash</button>
            </div>
         </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Guruhni boshqa o'qituvchi / yo'nalishga o'tkazish">
         <form onSubmit={handleTransferGroup} className="space-y-6">
            <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl mb-4">
               <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Info size={16}/> Diqqat: Guruhning joriy o'qish tarixi (Phase) arxivlanadi.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Yangi Soha</label>
                <select value={transferFormData.sohaId} onChange={e => setTransferFormData({ ...transferFormData, sohaId: e.target.value, courseId: '' })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-amber-500" required>
                  <option value="">Soha tanlang</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Yangi Yo'nalish</label>
                <select value={transferFormData.courseId} onChange={e => setTransferFormData({ ...transferFormData, courseId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold" required disabled={!transferFormData.sohaId}>
                  <option value="">Yo'nalish tanlang</option>
                  {courses.filter(c => {
                  const fId = c.field?.id || c.fieldId || (c.field && typeof c.field === 'number' ? c.field : null);
                  return Number(fId) === Number(transferFormData.sohaId);
                }).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Yangi O'qituvchi</label>
                <select value={transferFormData.teacherId} onChange={e => setTransferFormData({ ...transferFormData, teacherId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-amber-500" required>
                   <option value="">O'qituvchi tanlang</option>
                   {staffList.filter(s => {
                    const r = s.role?.name?.toLowerCase() || '';
                    return r.includes('teacher') || r.includes('o\'qituvchi') || r.includes('ustoz');
                   }).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">O'tkazish sanasi</label>
                <input type="date" value={transferFormData.startDate} onChange={e => setTransferFormData({ ...transferFormData, startDate: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
               <button type="button" onClick={() => setIsTransferModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-[10px]">Bekor qilish</button>
               <button type="submit" className="px-10 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-black shadow-xl shadow-amber-500/40 uppercase tracking-widest active:scale-95 transition-all">O'tkazishni yakunlash</button>
            </div>
         </form>
      </Modal>

      {/* Enroll Modal */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title="Guruhga talaba qo'shish">
         <div className="space-y-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="text" placeholder="Ism yoki ID bo'yicha qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#131520] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {availableStudents.map(s => (
                 <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-all group/item">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">{s.name.substring(0,1)}</div>
                       <div>
                          <p className="font-bold text-white text-sm">{s.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">ID: {s.externalId || 'S-'+s.id}</p>
                       </div>
                    </div>
                    <button onClick={() => handleEnroll(s.id)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/10">Qo'shish</button>
                 </div>
               ))}
               {availableStudents.length === 0 && <p className="text-center py-10 text-gray-600 font-bold italic">Topilmadi</p>}
            </div>
         </div>
      </Modal>

      {/* Complete Modal */}
      <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title="Guruhni tugatish (Arxiv)">
         <form onSubmit={handleCompleteGroup} className="space-y-6">
           <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 px-1 tracking-widest">Tugash sanasi</label>
              <input type="date" value={completeFormData.endDate} onChange={e => setCompleteFormData({ endDate: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3.5 text-white" required />
           </div>
           <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-purple-600/20 active:scale-[0.98] transition-all">Guruh faoliyatini yakunlash</button>
         </form>
      </Modal>

    </div>
  );
};

export default GroupDetail;
