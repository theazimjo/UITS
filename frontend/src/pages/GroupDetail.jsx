import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Users, Clock, MapPin, Calendar,
  BookOpen, Plus, Trash2, Search, UserPlus,
  Info, Edit2, CreditCard, Download, ArrowRight,
  History, CheckCircle, XCircle, Flag, UserMinus, UserCheck
} from 'lucide-react';
import {
  getGroupById, enrollStudent, unenrollStudent, getStudents,
  updateGroup, getPaymentsByGroup, updateEnrollmentStatus, completeGroup
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
  const [searchQuery, setSearchQuery] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '', sohaId: '', courseId: '', roomId: '', teacherId: '', days: [], startTime: '', endTime: '', startDate: '', endDate: '', monthlyPrice: '', status: ''
  });
  const [completeFormData, setCompleteFormData] = useState({
    endDate: new Date().toISOString().split('T')[0]
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
    if (!group?.startDate) return;
    const minMonth = group.startDate.substring(0, 7);
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    const newMonth = date.toISOString().substring(0, 7);
    if (newMonth >= minMonth) {
      setSelectedMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    if (!group?.endDate) return;
    const maxMonth = group.endDate.substring(0, 7);
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    const newMonth = date.toISOString().substring(0, 7);
    if (newMonth <= maxMonth) {
      setSelectedMonth(newMonth);
    }
  };

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
      // Initialize edit form when group is fetched
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
        course: { id: parseInt(editFormData.courseId) },
        room: { id: parseInt(editFormData.roomId) },
        teacher: { id: parseInt(editFormData.teacherId) }
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


  const handleEnroll = async (studentId) => {
    try {
      await enrollStudent(id, studentId);
      await fetchGroup(true); // Silent update
      setIsEnrollModalOpen(false); // Close modal
      if (refreshStudents) refreshStudents();
      if (fetchGroups) fetchGroups();
    } catch (err) {
      console.error('Enroll error:', err);
    }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      await updateEnrollmentStatus(id, studentId, status);
      await fetchGroup(true); // Silent update
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const handleUnenroll = async (studentId) => {
    if (!window.confirm("O'quvchini guruhdan butunlay chiqarmoqchimisiz? (Statusni 'Tark etdi' qilish tavsiya etiladi)")) return;
    try {
      await unenrollStudent(id, studentId);
      await fetchGroup(true); // Silent update
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

  const currentStudentIds = group.enrollments?.map(en => en.student?.id).filter(Boolean) || [];
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
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getGroupStatusDetails(group.status).color}`}>
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
                <Clock size={18} />
                Guruhni tugatish
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all outline-none"
            >
              <Edit2 size={18} />
              Guruhni tahrirlash
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all outline-none"
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
          O'quvchilar
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <History size={18} />
          Tarix
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' && (
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
        )}

        {activeTab === 'students' && (
          <div className="bg-[#131520] border border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/20 border-t-0 rounded-t-none">
            <div className="p-8 border-b border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/[0.02] gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  Guruh o'quvchilari
                  <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-black">
                    {group.enrollments?.length || 0}
                  </span>
                </h3>

                {/* Month Switcher */}
                <div className="flex items-center gap-1 bg-[#0b0d17] p-1 rounded-xl border border-white/5 shadow-inner">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-4 py-1.5 min-w-[140px] text-center">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest whitespace-nowrap">
                      {new Date(selectedMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="flex-1 lg:flex-none min-w-[120px] bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Kutilmoqda</p>
                  <p className="text-sm font-black text-white whitespace-nowrap">
                    {((group.enrollments?.filter(en => en.status !== 'DROPPED').length || 0) * (group.monthlyPrice || 0)).toLocaleString()} <span className="text-[10px] text-gray-500">UZS</span>
                  </p>
                </div>
                <div className="flex-1 lg:flex-none min-w-[120px] bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Tushdi</p>
                  <p className="text-sm font-black text-emerald-400 whitespace-nowrap">
                    {payments.filter(p => p.month === selectedMonth).reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()} <span className="text-[10px] text-emerald-500/50">UZS</span>
                  </p>
                </div>
                <div className="flex-1 lg:flex-none min-w-[120px] bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl">
                  <p className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest mb-1">Qoldi</p>
                  <p className="text-sm font-black text-amber-400 whitespace-nowrap">
                    {(((group.enrollments?.filter(en => en.status !== 'DROPPED').length || 0) * (group.monthlyPrice || 0)) - payments.filter(p => p.month === selectedMonth).reduce((sum, p) => sum + parseFloat(p.amount), 0)).toLocaleString()} <span className="text-[10px] text-amber-500/50">UZS</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
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
                    <th className="px-8 py-5">ID / Ma'lumot</th>
                    <th className="px-8 py-5">To'lov Holati</th>
                    <th className="px-8 py-5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {group.enrollments && group.enrollments.length > 0 ? group.enrollments.map(en => {
                    const s = en.student;
                    if (!s) return null;
                    const hasPaid = payments.some(p => p.student?.id === s.id && p.month === selectedMonth);
                    return (
                      <tr key={en.id} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 font-bold border border-white/10 shadow-inner">
                              {s.name.substring(0, 1)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-200 group-hover:text-white transition-colors">{s.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getEnrollmentStatusDetails(en.status).color}`}>
                                  {getEnrollmentStatusDetails(en.status).label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1.5">
                            <div className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded w-fit">
                              {s.externalId || 'S-' + s.id}
                            </div>
                            <select 
                              value={en.status} 
                              onChange={(e) => handleStatusChange(s.id, e.target.value)}
                              className="bg-[#0b0d17] border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-fit"
                            >
                              <option value="ACTIVE">O'qimoqda</option>
                              <option value="DROPPED">Tark etdi</option>
                              <option value="GRADUATED">Guruhni bitirdi</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {(() => {
                            const studentPayments = payments.filter(p => p.student?.id === s.id && p.month === selectedMonth);
                            const paidAmount = studentPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                            const monthlyPrice = parseFloat(group.monthlyPrice || 0);

                            if (paidAmount >= monthlyPrice) {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  To'langan
                                </span>
                              );
                            } else if (paidAmount > 0) {
                              return (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black border border-amber-500/20 w-fit">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Qisman ({paidAmount.toLocaleString()})
                                  </span>
                                  <p className="text-[9px] text-gray-500 font-bold ml-1">Qarz: {(monthlyPrice - paidAmount).toLocaleString()} UZS</p>
                                </div>
                              );
                            } else {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-black border border-rose-500/20">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                  To'lanmagan
                                </span>
                              );
                            }
                          })()}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUnenroll(s.id)}
                              className="p-2 text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
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

        {activeTab === 'history' && (
          <div className="bg-[#131520] border border-white/10 rounded-3xl p-8 shadow-xl shadow-black/20 border-t-0 rounded-t-none">
            <div className="max-w-4xl mx-auto">
              {(() => {
                const events = [];
                
                // Group Created
                if (group.createdAt) {
                  events.push({
                    id: 'group-created',
                    type: 'GROUP_CREATED',
                    date: new Date(group.createdAt),
                    title: 'Guruh yaratildi',
                    description: `"${group.name}" guruhi tizimga kiritildi.`,
                    icon: <Flag size={20} className="text-blue-400" />
                  });
                }
                
                // Enrollments
                if (group.enrollments) {
                  group.enrollments.forEach(en => {
                    // Joined
                    if (en.joinedDate) {
                      events.push({
                        id: `joined-${en.id}`,
                        type: 'STUDENT_JOINED',
                        date: new Date(en.joinedDate),
                        title: "O'quvchi qo'shildi",
                        description: `${en.student?.name} guruhga a'zo bo'ldi.`,
                        icon: <UserPlus size={20} className="text-emerald-400" />
                      });
                    }
                    
                    // Left/Graduated
                    if (en.status !== 'ACTIVE' && (en.updatedAt || en.joinedDate)) {
                      const isDropped = en.status === 'DROPPED';
                      events.push({
                        id: `status-${en.id}`,
                        type: 'STUDENT_STATUS_CHANGE',
                        date: new Date(en.updatedAt || en.joinedDate),
                        title: isDropped ? "O'quvchi guruhdan chiqdi / chiqarildi" : "Guruhni bitirdi",
                        description: `${en.student?.name} holati "${getEnrollmentStatusDetails(en.status).label}" ga o'zgardi.`,
                        icon: isDropped ? <XCircle size={20} className="text-rose-400" /> : <CheckCircle size={20} className="text-purple-400" />
                      });
                    }
                  });
                }
                
                // Sort descending
                const sortedEvents = events.sort((a, b) => b.date - a.date);
                
                if (sortedEvents.length === 0) {
                  return (
                    <div className="py-20 text-center text-gray-500 italic">
                      Hech qanday tarixiy ma'lumot topilmadi
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {sortedEvents.map((ev, idx) => (
                      <div key={ev.id} className="relative pl-12 pb-8 group last:pb-0">
                        {idx !== sortedEvents.length - 1 && (
                          <div className="absolute left-[22px] top-10 bottom-0 w-[2px] bg-white/5 group-hover:bg-indigo-500/20 transition-colors"></div>
                        )}
                        <div className="absolute left-0 top-0 w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner z-10 group-hover:border-indigo-500/30 transition-all">
                          {ev.icon}
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="font-bold text-white tracking-tight">{ev.title}</h4>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                              {ev.date.toLocaleString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Edit Group Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Guruhni tahrirlash"
      >
        <form onSubmit={handleUpdateGroup} className="space-y-5 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guruh nomi</label>
              <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Soha (Ota)</label>
              <select value={editFormData.sohaId} onChange={e => setEditFormData({ ...editFormData, sohaId: e.target.value, courseId: '' })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">Soha tanlang</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yo'nalish</label>
              <select value={editFormData.courseId} onChange={e => setEditFormData({ ...editFormData, courseId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required disabled={!editFormData.sohaId}>
                <option value="">Yo'nalish tanlang</option>
                {courses.filter(c => c.fieldId === parseInt(editFormData.sohaId)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Xona</label>
              <select value={editFormData.roomId} onChange={e => setEditFormData({ ...editFormData, roomId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">Xona tanlang</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} kishi)</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">O'qituvchi</label>
              <select value={editFormData.teacherId} onChange={e => setEditFormData({ ...editFormData, teacherId: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">O'qituvchi tanlang</option>
                {staffList.filter(s => {
                  const roleName = s.role?.name?.toLowerCase() || '';
                  return roleName.includes('teacher') || roleName.includes("o'qituvchi") || roleName.includes("o’qituvchi") || roleName.includes("o‘qituvchi") || roleName.includes("ustoz");
                }).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Boshlanish sanasi</label>
              <input type="date" value={editFormData.startDate} onChange={e => setEditFormData({ ...editFormData, startDate: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tugash sanasi (Avto)</label>
              <input type="date" value={editFormData.endDate} readOnly className="w-full bg-[#131520]/50 border border-white/10 rounded-xl px-4 py-3 text-gray-400 outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dars kunlari</label>
              <div className="flex flex-wrap gap-2">
                {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan', 'Yak'].map(day => (
                  <button key={day} type="button" onClick={() => {
                    const days = editFormData.days.includes(day) ? editFormData.days.filter(d => d !== day) : [...editFormData.days, day];
                    setEditFormData({ ...editFormData, days });
                  }} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${editFormData.days.includes(day) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-[#131520] border-white/10 text-gray-400 hover:border-white/20'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Boshlanish vaqti</label>
              <input type="time" value={editFormData.startTime} onChange={e => setEditFormData({ ...editFormData, startTime: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tugash vaqti</label>
              <input type="time" value={editFormData.endTime} onChange={e => setEditFormData({ ...editFormData, endTime: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guruh Statusi</label>
              <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="WAITING">Yig'ilmoqda</option>
                <option value="ACTIVE">Faol</option>
                <option value="COMPLETED">Tugatilgan</option>
                <option value="CANCELLED">Bekor qilingan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Oylik to'lov (UZS)</label>
              <input type="number" value={editFormData.monthlyPrice} onChange={e => setEditFormData({ ...editFormData, monthlyPrice: e.target.value })} className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-black text-emerald-400" required />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all">Bekor qilish</button>
            <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all">Saqlash</button>
          </div>
        </form>
      </Modal>


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

      {/* Complete Group Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Guruhni tugatish"
      >
        <form onSubmit={handleCompleteGroup} className="space-y-6 p-1">
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 mb-2">
            <p className="text-purple-400 text-sm font-medium leading-relaxed">
              Guruhni tugatish orqali uning holati <span className="font-bold underline">Tugatilgan</span> qilib belgilanadi. O'quvchilar holatini kerak bo'lsa qo'lda o'zgartirishingiz mumkin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Boshlanish sanasi</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 font-bold cursor-not-allowed">
                {group.startDate}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tugash sanasi (Bugun)</label>
              <input 
                type="date" 
                value={completeFormData.endDate} 
                onChange={e => setCompleteFormData({ ...completeFormData, endDate: e.target.value })} 
                className="w-full bg-[#131520] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold" 
                required 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all">Bekor qilish</button>
            <button type="submit" className="flex-1 px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/20 transition-all active:scale-95">Tugatishni tasdiqlash</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GroupDetail;
