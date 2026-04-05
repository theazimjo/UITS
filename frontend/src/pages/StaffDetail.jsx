import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, BookOpen,
  ChevronLeft, Calendar, Clock, MapPin, Trash2,
  Users, Search, CheckCircle2, AlertCircle,
  ChevronRight, CreditCard, Percent, Briefcase, Edit
} from 'lucide-react';
import { getStaffById, deleteStaff, updateStaff, getRoles, getStaffSalary, addStaffPayment } from '../services/api';
import Modal from '../components/common/Modal';

const StaffDetail = ({ fetchStaff }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, students, salary
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryData, setSalaryData] = useState({ total: 0, revenue: 0, kpi: 0, fixed: 0, breakdown: [] });

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [editFormData, setEditFormData] = useState({
    name: '',
    roleId: '',
    phone: '',
    salaryType: 'FIXED',
    fixedAmount: '0',
    kpiPercentage: '0',
    username: '',
    password: ''
  });

  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    month: currentMonth,
    type: 'SALARY', // SALARY, BONUS, HOLIDAY
    paymentType: 'Naqd',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  // Calendar & Detail states
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // format: YYYY-MM-DD

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [staffRes, rolesRes, salaryRes] = await Promise.all([
          getStaffById(id),
          getRoles(),
          getStaffSalary(id, currentMonth)
        ]);
        setStaff(staffRes.data);
        setRoles(rolesRes.data);
        setSalaryData(salaryRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentMonth]);

  const handleEditClick = () => {
    setEditFormData({
      name: staff.name,
      roleId: staff.role?.id?.toString() || '',
      phone: staff.phone || '',
      salaryType: staff.salaryType || 'FIXED',
      fixedAmount: staff.fixedAmount?.toString() || '0',
      kpiPercentage: staff.kpiPercentage?.toString() || '0',
      username: staff.username || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editFormData,
        role: { id: parseInt(editFormData.roleId) },
        fixedAmount: parseFloat(editFormData.fixedAmount || 0),
        kpiPercentage: parseFloat(editFormData.kpiPercentage || 0),
        username: editFormData.username || null,
        password: editFormData.password || undefined
      };
      await updateStaff(id, payload);

      // Refresh data
      const staffRes = await getStaffById(id);
      setStaff(staffRes.data);
      setIsEditModalOpen(false);
      if (fetchStaff) fetchStaff();
    } catch (err) {
      console.error('Error updating staff:', err);
      alert("Xatolik: Ma'lumotlarni saqlashda xatolik yuzaga keldi.");
    }
  };

  const handleMonthChange = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + direction);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  const getCalendarDays = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0-6 (Sun-Sat)
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Adjust firstDay to start from Monday (1=Mon, 2=Tue, ..., 0=Sun)
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    // Padding for early days
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Real days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${currentMonth}-${String(i).padStart(2, '0')}`;
      days.push(dayStr);
    }
    return days;
  };

  const currentMonthPayments = salaryData.payments || [];

  const getDayPayments = (dayStr) => {
    return currentMonthPayments.filter(p => {
      // payment date might be YYYY-MM-DD
      const pDate = p.date.split('T')[0];
      return pDate === dayStr;
    });
  };

  const handleDayClick = (dayStr) => {
    if (!dayStr) return;
    setSelectedDay(dayStr);
    setIsDayDetailModalOpen(true);
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await addStaffPayment(id, {
        ...paymentFormData,
        amount: parseFloat(paymentFormData.amount)
      });
      setIsPaymentModalOpen(false);
      setPaymentFormData({
        amount: '',
        month: currentMonth,
        type: 'SALARY',
        paymentType: 'Naqd',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
      // Refresh salary data
      const salaryRes = await getStaffSalary(id, currentMonth);
      setSalaryData(salaryRes.data);
    } catch (err) {
      console.error('Error adding payment:', err);
      alert("Xatolik: To'lovni saqlashda xato yuzaga keldi.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Haqiqatdan ham bu xodimni o'chirmoqchimisiz?")) {
      await deleteStaff(id);
      if (fetchStaff) fetchStaff();
      navigate('/staff');
    }
  };

  // Faol guruhlarni filtrlash
  const activeGroups = staff?.groups?.filter(group => {
    if (staff.role?.name === 'TEACHER') {
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const mStart = new Date(year, monthNum - 1, 1);
      const mEnd = new Date(year, monthNum, 0);

      return group.phases?.some(p => {
        if (p.teacher?.id !== staff.id) return false;
        const pStart = new Date(p.startDate);
        const effectiveEndDate = p.endDate || group.endDate;
        const pEnd = effectiveEndDate ? new Date(effectiveEndDate) : new Date(8640000000000000);
        return pStart <= mEnd && pEnd >= mStart;
      });
    }
    return true;
  }) || [];

  // O'quvchilarni yig'ish (Guruhlar ichidan)
  const allStudents = activeGroups.flatMap(group =>
    group.enrollments?.filter(enrollment => {
      const joinedDate = new Date(enrollment.joinedDate);
      const joinedMonth = joinedDate.toISOString().substring(0, 7);
      if (joinedMonth > currentMonth) return false;

      const teacherPhases = group.phases?.filter(p => p.teacher?.id === staff.id) || [];
      if (teacherPhases.length > 0) {
        const taughtThisStudent = teacherPhases.some(phase => {
          const pEnd = phase.endDate ? new Date(phase.endDate) : new Date(8640000000000000);
          return joinedDate <= pEnd;
        });
        if (!taughtThisStudent) return false;
      }
      if (enrollment.status !== 'ACTIVE' && enrollment.updatedAt) {
        const leftMonth = new Date(enrollment.updatedAt).toISOString().substring(0, 7);
        if (currentMonth > leftMonth) return false;
      }
      if (group.endDate) {
        const endMonth = group.endDate.substring(0, 7);
        if (currentMonth > endMonth) return false;
      }
      return true;
    }).map(enrollment => ({
      ...enrollment.student,
      groupName: group.name,
      enrollmentStatus: enrollment.status,
      ...(() => {
        const fullPrice = group.monthlyPrice || 0;
        const payments = group.payments?.filter(p => p.student?.id === enrollment.student?.id) || [];
        const monthlyPayments = payments.filter(p => p.month === currentMonth);
        const paidThisMonth = monthlyPayments.reduce((sum, p) => sum + (parseFloat(p.amount || 0) - parseFloat(p.discount || 0) + parseFloat(p.penalty || 0)), 0) || 0;
        const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount || 0)), 0) || 0; // Total value covered (Gross) stays for isPaid check
        const collectedByMe = monthlyPayments.some(p => p.teacher?.id === staff.id);

        // QARZDORLIK VA OYLAR MANTIG'I (TUG'RILANDI)
        const joinD = new Date(enrollment.joinedDate);
        const curD = new Date(currentMonth + "-01");

        // Farqni aniq hisoblash (Agar 1-kunidan bo'lsa, o'sha oyni hisoblaydi, agar tugash sanasi bo'lsa 1 oylikni 2 oy deb yubormaydi)
        let monthsOfStudy = (curD.getFullYear() - joinD.getFullYear()) * 12 + (curD.getMonth() - joinD.getMonth());

        // Agar o'sha oyda qo'shilgan bo'lsa yoki joriy oyda o'qiyotgan bo'lsa, kamida 1 oy hisoblanadi
        if (monthsOfStudy <= 0) monthsOfStudy = 1;
        else monthsOfStudy += 1;

        // Agar guruh tugagan bo'lsa va joriy oy tugash oyidan o'tib ketgan bo'lsa, kurs muddatini saqlab qolish
        const courseDuration = group.course?.duration || 1;
        const expectedMonths = Math.min(monthsOfStudy, courseDuration); // Kurs muddatidan oshib ketmasligi kerak

        const totalExpected = expectedMonths * fullPrice;
        const isPaid = totalPaid >= totalExpected;
        const isPaidDirectly = paidThisMonth >= fullPrice;
        const startDay = joinD.getDate();

        return {
          isPaid: paidThisMonth > 0,
          collectedByMe,
          statusLabel: paidThisMonth > 0 
            ? `To'langan (${paidThisMonth.toLocaleString()} UZS)`
            : "To'lanmagan",
          startInfo: startDay !== 1 ? `${startDay}-sanada boshlagan` : ""
        };
      })(),
      lastPayment: group.payments?.filter(p => p.student?.id === enrollment.student?.id)
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]
    }))
  ).filter(Boolean) || [];

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStudentsCount = allStudents.filter(s => s.enrollmentStatus === 'ACTIVE').length;

  // ===============================================
  // TUSHUM VA MAOSH HISOBLAGICH MANTIG'I
  // ===============================================
  // Salary data is now fetched from backend via salaryData state

  // YUKLANISH VA TOPILMASLIK HOLATLARI
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000]">
      <div className="w-8 h-8 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!staff) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Xodim topilmadi</h2>
        <button onClick={() => navigate('/staff')} className="text-[#007aff] hover:underline">Orqaga qaytish</button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      <div className="flex-1 w-full h-full flex flex-col bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl">

        {/* macOS Title Bar */}
        <div className="h-12 bg-white/40 dark:bg-black/20 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 flex items-center px-4 justify-between shrink-0 z-20">
          <div className="w-32">
            <button onClick={() => navigate('/staff')} className="flex items-center gap-1 text-gray-500 hover:text-[#1d1d1f] dark:hover:text-white transition-colors text-[12px] font-medium">
              <ChevronLeft size={16} /> <span>Ortga</span>
            </button>
          </div>
          <div className="flex-1 text-center font-medium text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate px-4">
            {staff.name} — Ma'lumotlar
          </div>
          <div className="flex justify-end w-32 gap-3 items-center">
            <button onClick={handleEditClick} className="text-gray-500 hover:text-[#007aff] dark:text-gray-400 dark:hover:text-[#0a84ff] transition-colors" title="Tahrirlash">
              <Edit size={16} />
            </button>
            <button onClick={handleDelete} className="text-gray-500 hover:text-[#ff3b30] dark:text-gray-400 dark:hover:text-[#ff453a] transition-colors" title="O'chirish">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Toolbar / Header */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#007aff] to-[#005bb5] border border-[#004a94] flex items-center justify-center text-white shadow-sm font-semibold text-lg">
              {staff.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">{staff.name}</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <Briefcase size={12} /> {staff.role?.name || 'Lavozim belgilanmagan'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner w-full sm:w-auto overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: "Asosiy", icon: <BookOpen size={14} /> },
                { id: 'students', label: "O'quvchilar", count: allStudents.length, icon: <Users size={14} /> },
                { id: 'salary', label: "Maosh va Tushum", icon: <CreditCard size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none relative px-4 py-1.5 text-[12px] font-medium rounded-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                >
                  <span className={activeTab === tab.id ? 'text-[#007aff]' : 'opacity-70'}>{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-[#007aff]/10 text-[#007aff] dark:bg-white/20 dark:text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-white/60 dark:bg-black/40 rounded-md border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md w-full sm:w-auto">
              <button onClick={() => handleMonthChange(-1)} className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 border-r border-gray-200/50 dark:border-white/10 transition-colors"><ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" /></button>
              <span className="px-4 text-[12px] font-medium text-center min-w-[120px] text-[#1d1d1f] dark:text-white">{getMonthName(currentMonth)}</span>
              <button onClick={() => handleMonthChange(1)} className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 border-l border-gray-200/50 dark:border-white/10 transition-colors"><ChevronRight size={16} className="text-gray-600 dark:text-gray-400" /></button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6 relative">
          <div className="max-w-[1000px] mx-auto h-full">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                    <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Shaxsiy ma'lumotlar</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#007aff]/10 text-[#007aff] rounded-md"><Phone size={14} /></div>
                        <div>
                          <p className="text-[10px] text-gray-500">Telefon</p>
                          <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{staff.phone || '---'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#34c759]/10 text-[#34c759] rounded-md"><CreditCard size={14} /></div>
                        <div>
                          <p className="text-[10px] text-gray-500">Maosh turi</p>
                          <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">
                            {staff.salaryType === 'FIXED' ? 'Fiks (Oylik)' : staff.salaryType === 'KPI' ? 'KPI (%)' : 'Aralash'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-white/10 space-y-2 text-[13px]">
                      {(staff.salaryType === 'FIXED' || staff.salaryType === 'MIXED') && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Asosiy maosh:</span>
                          <span className="font-semibold text-[#1d1d1f] dark:text-white">{parseInt(staff.fixedAmount || 0).toLocaleString()} UZS</span>
                        </div>
                      )}
                      {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">KPI foizi:</span>
                          <span className="font-semibold text-[#007aff]">{staff.kpiPercentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-white/10 shadow-sm text-center">
                      <p className="text-[11px] text-gray-500 mb-1">Guruhlar</p>
                      <p className="text-xl font-semibold text-[#1d1d1f] dark:text-white">{activeGroups.length}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-white/10 shadow-sm text-center">
                      <p className="text-[11px] text-gray-500 mb-1">O'quvchilar</p>
                      <p className="text-xl font-semibold text-[#1d1d1f] dark:text-white">{activeStudentsCount}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm min-h-full">
                    <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white mb-4">Ushbu oydagi faol guruhlar</h3>

                    {activeGroups.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeGroups.map(g => (
                          <div
                            key={g.id}
                            onClick={() => navigate(`/groups/${g.id}`)}
                            className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-[14px] text-[#007aff]">{g.name}</h4>
                              <div className={`w-2 h-2 rounded-full ${g.status === 'ACTIVE' ? 'bg-[#34c759]' : g.status === 'WAITING' ? 'bg-[#ffcc00]' : 'bg-gray-400'}`} />
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">{g.course?.name || 'Umumiy'}</p>

                            <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-2"><Calendar size={12} className="opacity-50" /> <span>{g.days.join(', ')}</span></div>
                              <div className="flex items-center gap-2"><Clock size={12} className="opacity-50" /> <span>{g.startTime} — {g.endTime}</span></div>
                              <div className="flex items-center gap-2"><MapPin size={12} className="opacity-50" /> <span>{g.room?.name || 'Belgilanmagan'}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <BookOpen size={32} className="mb-3 opacity-40" />
                        <p className="text-[13px]">Ushbu oy uchun guruhlar topilmadi</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STUDENTS */}
            {activeTab === 'students' && (
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[400px] animate-fade-in">
                <div className="p-4 border-b border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="O'quvchi yoki guruh izlash..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 shadow-inner text-[#1d1d1f] dark:text-[#f5f5f7]"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl z-10">
                      <tr>
                        <th className="px-5 py-2.5 font-medium">O'quvchi</th>
                        <th className="px-5 py-2.5 font-medium">Guruhi</th>
                        <th className="px-5 py-2.5 font-medium">Holat</th>
                        <th className="px-5 py-2.5 font-medium">To'lov ({getMonthName(currentMonth).split(' ')[0]})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                      {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                        <tr key={`${s.id}-${idx}`} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors cursor-default">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-medium text-[11px] text-[#1d1d1f] dark:text-white shadow-sm">{s.name?.substring(0, 1)}</div>
                              <div>
                                <div className="font-medium text-[#1d1d1f] dark:text-white">{s.name}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">{s.phone || '---'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-600 dark:text-gray-300 font-medium">{s.groupName}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${s.enrollmentStatus === 'ACTIVE' ? 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20' : 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20'}`}>
                              {s.enrollmentStatus === 'ACTIVE' ? "O'qimoqda" : "Ketgan"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <div className={`flex items-center gap-1.5 text-[12px] font-medium ${s.isPaid ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                                {s.isPaid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {s.statusLabel}
                                {s.collectedByMe && (
                                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff] text-[9px] font-bold border border-[#007aff]/20">
                                    Sizdan
                                  </span>
                                )}
                              </div>
                              {s.startInfo && <span className="text-[10px] text-gray-500 ml-5 mt-0.5">{s.startInfo}</span>}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="py-20 text-center text-gray-500">
                            <Users size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-[14px]">Ushbu oyda qidiruvga mos o'quvchilar yo'q.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: SALARY (MAOSH HISOBLAGICH VA TUSHUM) */}
            {activeTab === 'salary' && (
              <div className="space-y-6 animate-fade-in">
                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Asosiy Tushum */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-3 -top-3 text-[#ff9500] opacity-[0.08] group-hover:opacity-20 transition-opacity"><CreditCard size={80} /></div>
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Jami Tushum (Guruhlar)</p>
                    <h3 className="text-2xl font-bold text-[#1d1d1f] dark:text-white">
                      {salaryData.revenue.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-2">Shu oyda o'quvchilardan tushgan pul</p>
                  </div>

                  {/* KPI Qismi */}
                  {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && (
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group">
                      <div className="absolute -right-3 -top-3 text-[#007aff] opacity-[0.08] group-hover:opacity-20 transition-opacity"><Percent size={80} /></div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">KPI Ulushi ({staff.kpiPercentage}%)</p>
                      <h3 className="text-2xl font-bold text-[#007aff]">
                        {salaryData.kpi.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-2">Jami tushumdan o'qituvchi foizi</p>
                    </div>
                  )}

                  {/* Fiks Qismi */}
                  {(staff.salaryType === 'FIXED' || staff.salaryType === 'MIXED') && (
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group">
                      <div className="absolute -right-3 -top-3 text-[#34c759] opacity-[0.08] group-hover:opacity-20 transition-opacity"><BookOpen size={80} /></div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Fiks Maosh</p>
                      <h3 className="text-2xl font-bold text-[#34c759]">
                        {salaryData.fixed.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-2">Kafolatlangan oylik maosh</p>
                    </div>
                  )}

                  {/* Yakuniy summa */}
                  <div className="bg-gradient-to-br from-[#007aff] to-[#005bb5] rounded-xl p-5 shadow-md border border-[#004a94] relative overflow-hidden flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-blue-200 mb-1.5 uppercase tracking-wider">Hisoblangan Oylik (JAMI)</p>
                    <h3 className="text-3xl font-bold text-white">
                      {salaryData.total.toLocaleString()} <span className="text-[12px] text-blue-200 font-normal">UZS</span>
                    </h3>
                    <p className="text-[10px] text-blue-100 mt-2 opacity-80">Fiks + KPI foizi</p>
                  </div>

                  {/* To'lab berildi */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-3 -top-3 text-[#34c759] opacity-[0.08] group-hover:opacity-20 transition-opacity"><CheckCircle2 size={80} /></div>
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">To'lab berildi</p>
                    <h3 className="text-2xl font-bold text-[#34c759]">
                      {salaryData.paid.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-2">Joriy oy uchun to'langan oylik</p>
                  </div>

                  {/* Qoldi (Qarz) */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-3 -top-3 text-[#ff3b30] opacity-[0.08] group-hover:opacity-20 transition-opacity"><AlertCircle size={80} /></div>
                    <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Qoldi (Qarz)</p>
                    <h3 className="text-2xl font-bold text-[#ff3b30]">
                      {salaryData.remaining.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-2">To'lanishi kerak bo'lgan qoldiq</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 items-center">
                  {(salaryData.bonus > 0 || salaryData.holiday > 0) && (
                    <div className="text-[11px] flex gap-3 text-gray-500 mr-auto font-medium">
                      {salaryData.bonus > 0 && <span className="bg-[#af52de]/10 text-[#af52de] px-2 py-1 rounded-md border border-[#af52de]/20">Bonus: {salaryData.bonus.toLocaleString()} UZS</span>}
                      {salaryData.holiday > 0 && <span className="bg-[#ff9500]/10 text-[#ff9500] px-2 py-1 rounded-md border border-[#ff9500]/20">Bayram: {salaryData.holiday.toLocaleString()} UZS</span>}
                    </div>
                  )}
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#007aff] hover:bg-[#0062cc] text-white rounded-lg text-[13px] font-medium transition-all shadow-sm border border-[#005bb5]"
                  >
                    <CreditCard size={16} />
                    Oylik to'lash
                  </button>
                </div>

                {/* CALENDAR SECTION */}
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden p-6 mt-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                      <Calendar size={18} className="text-[#007aff]" />
                      To'lovlar kalendari — {getMonthName(currentMonth)}
                    </h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#34c759]"></div> Oylik
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#af52de]"></div> Bonus/Bayram
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-gray-200/50 dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-xl overflow-hidden">
                    {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'].map(d => (
                      <div key={d} className="bg-gray-50 dark:bg-black/40 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                    ))}
                    {getCalendarDays().map((day, idx) => {
                      const dayPayments = day ? getDayPayments(day) : [];
                      const dayTotal = dayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                      const isToday = day === new Date().toISOString().split('T')[0];

                      return (
                        <div 
                          key={idx} 
                          onClick={() => handleDayClick(day)}
                          className={`min-h-[85px] p-2 bg-white dark:bg-black/20 transition-all ${day ? 'cursor-pointer hover:bg-[#007aff]/5 dark:hover:bg-[#007aff]/10 group' : 'bg-gray-50/50 dark:bg-black/40'}`}
                        >
                          {day && (
                            <div className="h-full flex flex-col justify-between">
                              <span className={`text-[12px] font-semibold ${isToday ? 'h-6 w-6 flex items-center justify-center bg-[#007aff] text-white rounded-full' : 'text-gray-500 dark:text-gray-400'}`}>
                                {day.split('-')[2]}
                              </span>
                              {dayTotal > 0 && (
                                <div className="space-y-1 mt-auto">
                                  {dayPayments.map((p, i) => (
                                    <div 
                                      key={i} 
                                      className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium ${
                                        p.type === 'SALARY' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#af52de]/10 text-[#af52de]'
                                      }`}
                                    >
                                      {p.amount.toLocaleString()}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SEQUENTIAL LIST SECTION */}
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden mt-6">
                  <div className="px-5 py-4 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/10">
                    <h3 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">To'lovlar tarixi (Linear)</h3>
                  </div>
                  <div className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {currentMonthPayments.length > 0 ? (
                      [...currentMonthPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p, idx) => (
                        <div key={idx} className="px-5 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                              p.type === 'SALARY' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#af52de]/10 text-[#af52de]'
                            }`}>
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-white">
                                {p.type === 'SALARY' ? "Maosh to'lovi" : p.type === 'BONUS' ? 'Bonus' : 'Bayram puli'} 
                                <span className="ml-2 text-[11px] font-normal text-gray-400">{new Date(p.date).toLocaleDateString('uz-UZ')}</span>
                              </p>
                              {p.comment && <p className="text-[11px] text-gray-500 mt-1 italic">"{p.comment}"</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-[15px] font-bold ${p.type === 'SALARY' ? 'text-[#34c759]' : 'text-[#af52de]'}`}>
                              {p.amount.toLocaleString()} <span className="text-[11px] font-normal opacity-60">UZS</span>
                            </p>
                            <p className="text-[10px] text-gray-400">Tranzaksiya: #{p.id}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <Clock size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-[13px]">Ushbu oyda hali to'lovlar mavjud emas.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PAYMENT MODAL */}
                <Modal 
                  isOpen={isPaymentModalOpen} 
                  onClose={() => setIsPaymentModalOpen(false)} 
                  title={`${staff?.name} — Maosh to'lash`}
                >
                  <form onSubmit={handleAddPayment} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TO'LOV SUMMASI (UZS)</label>
                        <input
                          type="number" required
                          value={paymentFormData.amount}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[14px] font-semibold text-[#007aff] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                          placeholder="0"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">OY (QAYSI OY UCHUN)</label>
                          <input
                            type="month" required
                            value={paymentFormData.month}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, month: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SANA</label>
                          <input
                            type="date" required
                            value={paymentFormData.date}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, date: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">TO'LOV USULI</label>
                        <select 
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                          value={paymentFormData.paymentType}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentType: e.target.value })}
                        >
                          <option value="Naqd">Naqd</option>
                          <option value="Karta">Plastik (Karta)</option>
                          <option value="O'tkazma">O'tkazma</option>
                          <option value="Click/Payme">Click/Payme</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">TO'LOV TURI (MANTIQIY)</label>
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg border border-black/5 dark:border-white/10">
                          {[
                            { id: 'SALARY', name: 'Oylik' },
                            { id: 'BONUS', name: 'Bonus' },
                            { id: 'HOLIDAY', name: 'Bayram' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setPaymentFormData({ ...paymentFormData, type: t.id })}
                              className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${paymentFormData.type === t.id
                                ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                        <p className="mt-1.5 text-[10px] text-gray-400">
                          {paymentFormData.type === 'SALARY' 
                            ? "* Bu to'lov hisoblangan oylik maoshdan (qarzdorlikdan) ayiriladi." 
                            : "* Bu to'lov qo'shimcha rag'batlantirish bo'lib, oylik maosh qarzdorligiga ta'sir qilmaydi."}
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">IZOH</label>
                        <textarea
                          value={paymentFormData.comment}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, comment: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner min-h-[60px]"
                          placeholder="To'lov haqida qo'shimcha ma'lumot..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 text-[13px] font-medium bg-[#007aff] hover:bg-[#0062cc] text-white rounded-md shadow-sm border border-[#005bb5] transition-colors"
                      >
                        To'lovni tasdiqlash
                      </button>
                    </div>
                  </form>
                </Modal>

                {/* DAY DETAIL MODAL */}
                <Modal 
                  isOpen={isDayDetailModalOpen} 
                  onClose={() => setIsDayDetailModalOpen(false)} 
                  title={`${selectedDay ? new Date(selectedDay).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} — To'lovlar`}
                >
                  <div className="space-y-4">
                    {selectedDay && getDayPayments(selectedDay).length > 0 ? (
                      getDayPayments(selectedDay).map((p, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-xl p-4 shadow-sm border-l-4 border-l-[#007aff]">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.type === 'SALARY' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#af52de]/10 text-[#af52de]'
                            }`}>
                              {p.type === 'SALARY' ? "Oylik" : p.type === 'BONUS' ? 'Bonus' : 'Bayram'}
                            </span>
                            <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">{Number(p.amount).toLocaleString()} UZS</span>
                          </div>
                          {p.comment && (
                            <div className="mt-3 p-2.5 bg-white dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 italic text-[12px] text-gray-600 dark:text-gray-400">
                              "{p.comment}"
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-gray-500">
                        <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-[14px]">Ushbu kunda to'lovlar mavjud emas.</p>
                      </div>
                    )}
                    <button
                      onClick={() => setIsDayDetailModalOpen(false)}
                      className="w-full py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-xl text-[13px] font-bold transition-all mt-4"
                    >
                      Yopish
                    </button>
                  </div>
                </Modal>
              </div>
            )}

          </div>
        </div>

        {/* EDIT MODAL */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Xodimni tahrirlash">
          <form onSubmit={handleUpdateStaff} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">F.I.SH</label>
                <input
                  type="text" required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">LAVOZIM</label>
                  <select
                    required
                    value={editFormData.roleId}
                    onChange={(e) => setEditFormData({ ...editFormData, roleId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  >
                    <option value="" disabled>Tanlang...</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TELEFON</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">MAOSH SOZLAMALARI</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg border border-black/5 dark:border-white/10">
                    {['FIXED', 'KPI', 'MIXED'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, salaryType: type })}
                        className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${editFormData.salaryType === type
                          ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                          }`}
                      >
                        {type === 'FIXED' ? 'Fiks' : type === 'KPI' ? 'KPI' : 'Aralash'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(editFormData.salaryType === 'FIXED' || editFormData.salaryType === 'MIXED') && (
                      <div>
                        <label className="block text-[10px] font-medium text-gray-400 mb-1">FIKS SUMMA</label>
                        <input
                          type="number"
                          value={editFormData.fixedAmount}
                          onChange={(e) => setEditFormData({ ...editFormData, fixedAmount: e.target.value })}
                          className="w-full bg-[#007aff]/5 dark:bg-[#007aff]/10 border border-[#007aff]/10 rounded-md px-3 py-2 text-[13px] font-medium text-[#007aff] outline-none"
                        />
                      </div>
                    )}
                    {(editFormData.salaryType === 'KPI' || editFormData.salaryType === 'MIXED') && (
                      <div>
                        <label className="block text-[10px] font-medium text-gray-400 mb-1">KPI (%)</label>
                        <input
                          type="number"
                          value={editFormData.kpiPercentage}
                          onChange={(e) => setEditFormData({ ...editFormData, kpiPercentage: e.target.value })}
                          className="w-full bg-[#af52de]/5 dark:bg-[#af52de]/10 border border-[#af52de]/10 rounded-md px-3 py-2 text-[13px] font-medium text-[#af52de] outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">LOGIN MA'LUMOTLARI (SHAXSIY KABINET)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 mb-1">LOGIN</label>
                    <input
                      type="text"
                      placeholder="teacher_login"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 mb-1">YANGI PAROL</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-[13px] font-medium bg-[#007aff] hover:bg-[#0062cc] text-white rounded-md shadow-sm border border-[#005bb5] transition-colors"
              >
                Saqlash
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default StaffDetail;