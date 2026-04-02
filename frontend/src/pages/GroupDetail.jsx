import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Users, Clock, MapPin, Calendar,
  BookOpen, Plus, Trash2, Search, UserPlus,
  Info, Edit2, CreditCard, ArrowRight,
  History, CheckCircle, ChevronRight, UserMinus,
  RefreshCw, ArrowRightCircle, FolderKanban
} from 'lucide-react';
import {
  getGroupById, enrollStudent, enrollMultipleStudents, unenrollStudent, getStudents,
  updateGroup, getPaymentsByGroup, updateEnrollmentStatus, completeGroup,
  transferGroup, getGroupActivities
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
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollDate, setEnrollDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStudents, setSelectedStudents] = useState([]);

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
      case 'WAITING': return { label: "Yig'ilmoqda", color: 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/20' };
      case 'ACTIVE': return { label: "Faol", color: 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20' };
      case 'COMPLETED': return { label: "Tugatilgan", color: 'bg-[#af52de]/10 text-[#af52de] border-[#af52de]/20' };
      case 'CANCELLED': return { label: "Bekor qilingan", color: 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20' };
      default: return { label: status, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
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

      const actRes = await getGroupActivities(id);
      setActivities(actRes.data || []);
    } catch (err) {
      console.error('Error fetching group:', err);
    } finally {
      if (!silent) setLoading(false);
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
    } catch (err) { console.error('Update error:', err); }
  };

  const handleCompleteGroup = async (e) => {
    e.preventDefault();
    try {
      await completeGroup(id, completeFormData);
      await fetchGroup();
      if (fetchGroups) fetchGroups();
      setIsCompleteModalOpen(false);
    } catch (err) { console.error('Complete error:', err); }
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
    } catch (err) { console.error('Transfer error:', err); }
  };

  const handleEnrollMultiple = async () => {
    if (selectedStudents.length === 0) return;
    try {
      await enrollMultipleStudents(id, { studentIds: selectedStudents, joinedDate: enrollDate });
      await fetchGroup(true);
      if (refreshStudents) refreshStudents();
      if (fetchGroups) fetchGroups();
      setIsEnrollModalOpen(false);
      setSelectedStudents([]);
      setEnrollDate(new Date().toISOString().split('T')[0]);
    } catch (err) { console.error('Enroll multiple error:', err); }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      await updateEnrollmentStatus(id, studentId, status);
      await fetchGroup(true);
    } catch (err) { console.error('Status check error:', err); }
  };

  const handleUnenroll = async (studentId) => {
    if (!window.confirm("O'quvchini guruhdan chiqarmoqchimisiz?")) return;
    try {
      await unenrollStudent(id, studentId);
      await fetchGroup(true);
      if (refreshStudents) refreshStudents();
      if (fetchGroups) fetchGroups();
    } catch (err) { console.error('Unenroll error:', err); }
  };

  // ----- JAMI TUSHUM HISOBLASH (SHU GURUH BO'YICHA) -----
  // Shu guruhdagi barcha o'quvchilar tomonidan jami tanlangan oyda to'langan summa
  const calculateTotalRevenueThisMonth = () => {
    if (!payments || payments.length === 0) return 0;
    const currentMonthPayments = payments.filter(p => p.month === selectedMonth);
    return currentMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const totalRevenueThisMonth = calculateTotalRevenueThisMonth();

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000]">
      <div className="w-8 h-8 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!group) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Guruh topilmadi</h2>
        <button onClick={() => navigate('/groups')} className="text-[#007aff] hover:underline">Orqaga qaytish</button>
      </div>
    </div>
  );

  const currentStudentIds = group.enrollments?.map(en => en.student?.id).filter(Boolean) || [];
  const availableStudents = students.filter(s =>
    !currentStudentIds.includes(s.id) &&
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* macOS Title Bar Area */}
      <div className="h-12 border-b border-gray-200/50 dark:border-white/10 flex items-center px-4 justify-between shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center w-32">
          <button onClick={() => navigate('/groups')} className="flex items-center gap-1 text-gray-500 hover:text-[#1d1d1f] dark:hover:text-white transition-colors text-[12px] font-medium">
            <ChevronLeft size={16} /> <span>Guruhlar</span>
          </button>
        </div>
        <div className="flex-1 text-center font-medium text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate px-4">
          {group.name}
        </div>
        <div className="w-32 flex justify-end"></div>
      </div>

      {/* Toolbar / Header */}
      <div className="px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm">
            <FolderKanban size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">{group.name}</h1>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${getGroupStatusDetails(group.status).color}`}>
                {getGroupStatusDetails(group.status).label}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {group.course?.field?.name} / {group.course?.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {group.status !== 'COMPLETED' && (
            <button onClick={() => setIsCompleteModalOpen(true)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#af52de] bg-[#af52de]/10 hover:bg-[#af52de]/20 transition-colors border border-[#af52de]/20">
              <CheckCircle size={14} /> <span>Tugatish</span>
            </button>
          )}
          {group.status !== 'COMPLETED' && (
            <button onClick={() => setIsTransferModalOpen(true)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#ff9500] bg-[#ff9500]/10 hover:bg-[#ff9500]/20 transition-colors border border-[#ff9500]/20">
              <RefreshCw size={14} /> <span>O'tkazish</span>
            </button>
          )}
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border border-gray-200/50 dark:border-white/10 shadow-sm transition-all">
            <Edit2 size={14} /> <span>Tahrirlash</span>
          </button>
          <button onClick={() => setActiveTab('students')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all shadow-sm bg-[#007aff] hover:bg-[#0062cc] text-white border border-[#005bb5]">
            <UserPlus size={14} /> <span>O'quvchi qo'shish</span>
          </button>
        </div>
      </div>

      {/* Segmented Controls (Tabs) */}
      <div className="px-6 py-3 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0 flex justify-center sm:justify-start overflow-x-auto scrollbar-hide z-10">
        <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner">
          {[
            { id: 'info', label: 'Umumiy', icon: <Info size={14} /> },
            { id: 'students', label: "O'quvchilar", icon: <Users size={14} /> },
            { id: 'timeline', label: 'Bosqichlar', icon: <ArrowRightCircle size={14} /> },
            { id: 'history', label: 'Jurnal', icon: <History size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${activeTab === t.id
                ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
            >
              <span className={activeTab === t.id ? 'text-[#007aff]' : 'opacity-70'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6 relative">
        <div className="max-w-[1000px] mx-auto h-full">

          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#007aff]">
                  <Clock size={18} /> <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Dars jadvali</h3>
                </div>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-white/10">
                    <span className="text-gray-500">Vaqti</span>
                    <span className="font-medium text-[#1d1d1f] dark:text-white">{group.startTime} - {group.endTime}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 mb-1.5 uppercase">Kunlari</span>
                    <div className="flex flex-wrap gap-1">
                      {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(d => (
                        <span key={d} className={`px-2 py-0.5 rounded text-[11px] font-medium border ${group.days.includes(d) ? 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/20' : 'bg-transparent text-gray-400 border-transparent'}`}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#34c759]">
                  <Users size={18} /> <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Mas'ullar</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200/50 dark:border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[12px] font-medium text-[#1d1d1f] dark:text-white">{group.teacher?.name?.substring(0, 1)}</div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">O'qituvchi</p>
                      <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{group.teacher?.name || '---'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200/50 dark:border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[12px] font-medium text-gray-500"><MapPin size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Xona</p>
                      <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{group.room?.name || '---'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#ff9500]">
                  <CreditCard size={18} /> <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Moliya va Davr</h3>
                </div>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-white/10">
                    <span className="text-gray-500">Boshlanish</span>
                    <span className="font-medium text-[#1d1d1f] dark:text-white">{group.startDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-white/10">
                    <span className="text-gray-500">Tugash</span>
                    <span className="font-medium text-[#1d1d1f] dark:text-white">{group.endDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-white/10">
                    <span className="text-gray-500">Oylik narx</span>
                    <span className="font-semibold text-[#34c759]">{parseInt(group.monthlyPrice || 0).toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#ff9500] font-medium flex items-center gap-1">
                      <CreditCard size={14} /> Shu oydagi tushum
                    </span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">{totalRevenueThisMonth.toLocaleString()} UZS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[400px] animate-fade-in">
              <div className="p-4 border-b border-gray-200/50 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center bg-white dark:bg-black/40 rounded-md border border-gray-200/50 dark:border-white/10 shadow-sm">
                  <button onClick={handlePrevMonth} className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 border-r border-gray-200/50 dark:border-white/10"><ChevronLeft size={14} className="text-gray-500" /></button>
                  <span className="px-4 text-[12px] font-medium text-center min-w-[130px] text-[#1d1d1f] dark:text-white">
                    {new Date(selectedMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 border-l border-gray-200/50 dark:border-white/10"><ChevronRight size={14} className="text-gray-500" /></button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 px-3 border-r border-gray-200/50 dark:border-white/10 hidden sm:block">
                    Guruh tushumi: <span className="text-[#34c759] font-bold">{totalRevenueThisMonth.toLocaleString()} UZS</span>
                  </div>
                  <button onClick={() => setIsEnrollModalOpen(true)} className="flex-1 sm:flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#007aff] text-white shadow-sm hover:bg-[#0062cc] transition-colors justify-center">
                    <UserPlus size={14} /> Qo'shish
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl z-10">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Ism-sharif</th>
                      <th className="px-5 py-2.5 font-medium">Holat</th>
                      <th className="px-5 py-2.5 font-medium">To'lov ({selectedMonth})</th>
                      <th className="px-5 py-2.5 font-medium text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {group.enrollments?.filter(en => {
                      // 1-shart: Kelajakda qo'shiladigan o'quvchilarni yashirish
                      const joinedMonth = new Date(en.joinedDate).toISOString().substring(0, 7);
                      if (joinedMonth > selectedMonth) return false;

                      // 2-shart: Chiqib ketgan yoki bitirgan o'quvchilarni faqat o'qigan oylarida ko'rsatish
                      if (en.status !== 'ACTIVE' && en.updatedAt) {
                        const leftMonth = new Date(en.updatedAt).toISOString().substring(0, 7);
                        if (selectedMonth > leftMonth) return false;
                      }

                      // 3-shart: Guruh tugagan bo'lsa, keyingi oylarda o'quvchilarni ko'rsatmaslik
                      if (group.endDate) {
                        const endMonth = group.endDate.substring(0, 7);
                        if (selectedMonth > endMonth) return false;
                      }

                      return true;
                    }).map(en => {
                      const s = en.student; if (!s) return null;

                      // Shu oy uchun qilingan barcha to'lovlar (bir necha marta bo'lishi mumkin)
                      const stPayments = payments.filter(p => p.student?.id === s.id && p.month === selectedMonth);
                      const paidThisMonth = stPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                      const fullPrice = parseFloat(group.monthlyPrice || 0);

                      // To'lov holatini hisoblash
                      let paymentStatusHtml;
                      if (paidThisMonth >= fullPrice) {
                        paymentStatusHtml = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20">To'langan</span>;
                      } else if (paidThisMonth > 0) {
                        paymentStatusHtml = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#ffcc00]/10 text-[#d4a000] border border-[#ffcc00]/20">Qisman ({paidThisMonth.toLocaleString()})</span>;
                      } else {
                        paymentStatusHtml = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/20">To'lanmagan</span>;
                      }

                      return (
                        <tr key={en.id} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-default">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-medium text-[11px] text-[#1d1d1f] dark:text-white shadow-sm">{s.name?.substring(0, 1)}</div>
                              <p className="font-medium text-[#1d1d1f] dark:text-white">{s.name}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={en.status}
                              onChange={(e) => handleStatusChange(s.id, e.target.value)}
                              className="bg-transparent border border-gray-300 dark:border-white/20 rounded text-[11px] font-medium text-gray-600 dark:text-gray-300 px-1 py-0.5 outline-none focus:ring-1 focus:ring-[#007aff]"
                            >
                              <option value="ACTIVE">O'qimoqda</option>
                              <option value="DROPPED">Tark etdi</option>
                              <option value="GRADUATED">Bitirdi</option>
                            </select>
                          </td>
                          <td className="px-5 py-3">
                            {paymentStatusHtml}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleUnenroll(s.id)} className="p-1.5 text-gray-400 hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {(!group.enrollments || group.enrollments.length === 0) && (
                      <tr><td colSpan="4" className="py-16 text-center text-gray-500 text-[13px]">Guruhda hali talabalar yo'q.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in p-6">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white mb-6">Guruh Bosqichlari (Phases)</h3>

              {(!group.phases || group.phases.length === 0) ? (
                <p className="text-gray-500 text-[13px]">Hech qanday bosqich ma'lumoti yo'q</p>
              ) : (
                <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                  {[...group.phases].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map((ph, i) => (
                    <div key={ph.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-white dark:ring-[#1e1e1e] ${!ph.endDate ? 'bg-[#007aff]' : 'bg-gray-400 dark:bg-gray-600'}`} />
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${!ph.endDate ? 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/20' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-transparent'}`}>
                              {!ph.endDate ? 'Joriy bosqich' : `${i + 1}-bosqich`}
                            </span>
                          </div>
                          <div className="text-right text-[11px] text-gray-500 font-medium">
                            <p>{ph.startDate}</p>
                            {ph.endDate ? <p>→ {ph.endDate}</p> : <p className="text-[#007aff]">Hozirgacha</p>}
                          </div>
                        </div>
                        <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white mt-1">{ph.teacher?.name || 'Noma\'lum'}</p>
                        <p className="text-[12px] text-gray-500">{ph.course?.name || 'Belgilanmagan'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in p-6">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white mb-6">Voqealar jurnali</h3>

              {(() => {
                const events = activities.map(act => {
                  let color = 'gray', title = 'O\'zgarish', icon = '📝';
                  if (act.action === 'GROUP_CREATE') { color = 'text-[#007aff]'; title = 'Guruh yaratildi'; icon = '🏁'; }
                  else if (act.action === 'GROUP_EDIT') { color = 'text-[#ff9500]'; title = 'Guruh tahrirlandi'; icon = '✏️'; }
                  else if (act.action === 'GROUP_TRANSFER') { color = 'text-[#ff9500]'; title = 'Guruh o\'tkazildi'; icon = '🔀'; }
                  else if (act.action === 'GROUP_COMPLETE') { color = 'text-[#af52de]'; title = 'Guruh tugatildi'; icon = '✅'; }
                  else if (act.action === 'STUDENT_ENROLL' || act.action === 'STUDENT_ENROLL_MULTIPLE') { color = 'text-[#34c759]'; title = 'O\'quvchi qo\'shildi'; icon = '➕'; }
                  else if (act.action === 'STUDENT_UNENROLL') { color = 'text-[#ff3b30]'; title = 'Guruhdan o\'chirildi'; icon = '🚪'; }
                  else if (act.action === 'STUDENT_STATUS_EDIT') { color = 'text-gray-500'; title = 'Holat o\'zgardi'; icon = '🔄'; }

                  return { id: act.id, date: new Date(act.createdAt), title, desc: act.description, color, icon };
                });

                if (activities.length === 0 && group.createdAt) {
                  events.push({ id: 'legacy', date: new Date(group.createdAt), title: 'Guruh ochildi (Tizim)', desc: 'Eski ma\'lumot', color: 'text-gray-400', icon: '📅' });
                }

                const sorted = events.sort((a, b) => b.date - a.date);
                if (sorted.length === 0) return <p className="text-gray-500 text-[13px]">Jurnal bo'sh</p>;

                return (
                  <div className="space-y-4">
                    {sorted.map(ev => (
                      <div key={ev.id} className="flex gap-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-gray-200/50 dark:hover:border-white/5">
                        <div className={`text-[16px] ${ev.color} mt-0.5`}>{ev.icon}</div>
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{ev.title}</p>
                          <p className="text-[12px] text-gray-500">{ev.desc}</p>
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                          {ev.date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>

      {/* ENROLL MODAL */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => { setIsEnrollModalOpen(false); setSelectedStudents([]); }} title="O'quvchi biriktirish">
        <div className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">QO'SHILISH SANASI</label>
            <input type="date" min={group?.startDate || group?.createdAt?.substring(0, 10) || ''} value={enrollDate} onChange={e => setEnrollDate(e.target.value)} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner" required />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Ism yoki ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all shadow-inner text-[#1d1d1f] dark:text-white" />
          </div>

          {availableStudents.length > 0 && (
            <div className="flex justify-between items-center text-[11px]">
              <button
                type="button"
                onClick={() => {
                  const allFiltered = availableStudents.map(s => s.id);
                  if (allFiltered.every(sid => selectedStudents.includes(sid))) setSelectedStudents(prev => prev.filter(sid => !allFiltered.includes(sid)));
                  else setSelectedStudents(prev => [...new Set([...prev, ...allFiltered])]);
                }}
                className="text-[#007aff] hover:underline"
              >
                {availableStudents.every(s => selectedStudents.includes(s.id)) ? "Barchasini bekor qilish" : "Barchasini tanlash"}
              </button>
              <span className="text-gray-500">{selectedStudents.length} ta tanlandi</span>
            </div>
          )}

          <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
            {availableStudents.map(s => (
              <div key={s.id} onClick={() => setSelectedStudents(prev => prev.includes(s.id) ? prev.filter(sid => sid !== s.id) : [...prev, s.id])} className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors border ${selectedStudents.includes(s.id) ? 'bg-[#007aff]/10 border-[#007aff]/30' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedStudents.includes(s.id) ? 'bg-[#007aff] border-[#007aff] text-white' : 'border-gray-400 text-transparent'}`}>
                  <CheckCircle size={10} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{s.name}</p>
                  <p className="text-[10px] text-gray-500">ID: {s.externalId || s.id}</p>
                </div>
              </div>
            ))}
            {availableStudents.length === 0 && <p className="text-center py-6 text-gray-500 text-[12px]">Topilmadi</p>}
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-200/50 dark:border-white/10">
            <button type="button" onClick={() => setSelectedStudents([])} className="flex-1 py-1.5 text-[12px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors">Bekor qilish</button>
            <button type="button" onClick={handleEnrollMultiple} disabled={selectedStudents.length === 0} className="flex-1 py-1.5 text-[12px] font-medium bg-[#007aff] hover:bg-[#0062cc] text-white rounded-md shadow-sm border border-[#005bb5] transition-colors disabled:opacity-50">Qo'shish ({selectedStudents.length})</button>
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Guruhni tahrirlash">
        <form onSubmit={handleUpdateGroup} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">GURUH NOMI</label>
            <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 shadow-inner" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">O'QITUVCHI</label>
              <select value={editFormData.teacherId} onChange={e => setEditFormData({ ...editFormData, teacherId: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 shadow-inner" required>
                <option value="">Tanlang...</option>
                {staffList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">XONA</label>
              <select value={editFormData.roomId} onChange={e => setEditFormData({ ...editFormData, roomId: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 shadow-inner" required>
                <option value="">Tanlang...</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">KUNLAR</label>
            <div className="flex flex-wrap gap-1">
              {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(day => (
                <button type="button" key={day} onClick={() => setEditFormData({ ...editFormData, days: editFormData.days.includes(day) ? editFormData.days.filter(d => d !== day) : [...editFormData.days, day] })} className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${editFormData.days.includes(day) ? 'bg-[#007aff] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'}`}>{day}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">BOSHLANISH</label><input type="time" value={editFormData.startTime} onChange={e => setEditFormData({ ...editFormData, startTime: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none shadow-inner" required /></div>
            <div><label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TUGASH</label><input type="time" value={editFormData.endTime} onChange={e => setEditFormData({ ...editFormData, endTime: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none shadow-inner" required /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">STATUS</label>
              <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none shadow-inner">
                <option value="WAITING">Yig'ilmoqda</option><option value="ACTIVE">Faol</option><option value="COMPLETED">Tugatilgan</option><option value="CANCELLED">Bekor qilingan</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-200/50 dark:border-white/10 mt-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-1.5 text-[12px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors">Bekor qilish</button>
            <button type="submit" className="flex-1 py-1.5 text-[12px] font-medium bg-[#007aff] hover:bg-[#0062cc] text-white rounded-md shadow-sm border border-[#005bb5] transition-colors">Saqlash</button>
          </div>
        </form>
      </Modal>

      {/* TRANSFER MODAL */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="O'tkazish (Transfer)">
        <form onSubmit={handleTransferGroup} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div className="p-3 bg-[#ff9500]/10 border border-[#ff9500]/20 rounded-md">
            <p className="text-[11px] text-[#ff9500] font-medium">Joriy o'qish tarixi arxivlanadi.</p>
          </div>
          <div><label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">YANGI SOHA</label><select value={transferFormData.sohaId} onChange={e => setTransferFormData({ ...transferFormData, sohaId: e.target.value, courseId: '' })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#ff9500]/50" required><option value="">Tanlang...</option>{fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
          <div><label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">YANGI YO'NALISH</label><select value={transferFormData.courseId} onChange={e => setTransferFormData({ ...transferFormData, courseId: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#ff9500]/50" required disabled={!transferFormData.sohaId}><option value="">Tanlang...</option>{courses.filter(c => (c.field?.id || c.fieldId) == transferFormData.sohaId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">YANGI O'QITUVCHI</label><select value={transferFormData.teacherId} onChange={e => setTransferFormData({ ...transferFormData, teacherId: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#ff9500]/50" required><option value="">Tanlang...</option>{staffList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SANA</label><input type="date" value={transferFormData.startDate} onChange={e => setTransferFormData({ ...transferFormData, startDate: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#ff9500]/50" required /></div>

          <div className="flex gap-2 pt-3 border-t border-gray-200/50 dark:border-white/10">
            <button type="button" onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-1.5 text-[12px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors">Bekor qilish</button>
            <button type="submit" className="flex-1 py-1.5 text-[12px] font-medium bg-[#ff9500] hover:bg-[#e08200] text-white rounded-md shadow-sm transition-colors">O'tkazish</button>
          </div>
        </form>
      </Modal>

      {/* COMPLETE MODAL */}
      <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title="Guruhni tugatish">
        <form onSubmit={handleCompleteGroup} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div><label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TUGASH SANASI</label><input type="date" value={completeFormData.endDate} onChange={e => setCompleteFormData({ endDate: e.target.value })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#af52de]/50 shadow-inner" required /></div>
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="flex-1 py-1.5 text-[12px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors">Bekor qilish</button>
            <button type="submit" className="flex-1 py-1.5 text-[12px] font-medium bg-[#af52de] hover:bg-[#9d44c7] text-white rounded-md shadow-sm transition-colors">Yakunlash</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GroupDetail;