import React, { useState, useEffect } from 'react';
import { getTeacherFinance, getStaffSalary } from '../../services/api';
import { 
  BarChart3, ChevronLeft, ChevronRight, Loader2, TrendingUp, Wallet, Users, 
  CreditCard, Calendar, Clock, CheckCircle2, AlertCircle, Percent, BookOpen
} from 'lucide-react';
import Modal from '../../components/common/Modal';

const TeacherFinance = () => {
  const [data, setData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('salary'); // 'salary' or 'payments'
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  
  // Day detail modal state
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Get teacher ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teacherId = user.id;

  useEffect(() => {
    fetchData();
  }, [currentMonth, teacherId]);

  const fetchData = async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const [financeRes, salaryRes] = await Promise.all([
        getTeacherFinance(currentMonth),
        getStaffSalary(teacherId, currentMonth)
      ]);
      setData(financeRes.data);
      setSalaryData(salaryRes.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${year}-${month}`);
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
  };

  const paymentTypeMap = {
    CASH: 'Naqd', CARD: 'Karta', TRANSFER: "O'tkazma", CLICK: 'Click', PAYME: 'Payme',
    'Naqd': 'Naqd', 'Karta': 'Karta', "O'tkazma": "O'tkazma"
  };

  // Calendar Helpers (from StaffDetail)
  const getCalendarDays = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0-6 (Sun-Sat)
    const daysInMonth = new Date(year, month, 0).getDate();
    const startingDay = firstDay === 0 ? 6 : firstDay - 1; // Mon start
    
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(`${currentMonth}-${String(i).padStart(2, '0')}`);
    }
    return days;
  };

  const getDayPayments = (dayStr) => {
    if (!salaryData?.payments) return [];
    return salaryData.payments.filter(p => p.date.split('T')[0] === dayStr);
  };

  const handleDayClick = (dayStr) => {
    if (!dayStr) return;
    setSelectedDay(dayStr);
    setIsDayDetailModalOpen(true);
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#000000]">
      {/* macOS-style Header/Toolbar */}
      <div className="min-h-[56px] flex flex-col sm:flex-row items-center justify-between px-6 py-3 sm:py-0 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#af52de] text-white rounded-md shadow-sm">
            <CreditCard size={18} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Moliya</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Maosh va To'lovlar</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-200/80 dark:bg-white/5 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'salary'
                ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <BookOpen size={14} className={activeTab === 'salary' ? 'text-[#007aff]' : 'opacity-70'} />
            Maosh
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users size={14} className={activeTab === 'payments' ? 'text-[#34c759]' : 'opacity-70'} />
            O'quvchi to'lovlari
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center bg-white/60 dark:bg-black/40 rounded-lg border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
          <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-r border-gray-200/50 dark:border-white/10">
            <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <span className="px-4 text-[12px] font-bold text-[#1d1d1f] dark:text-white min-w-[140px] text-center">{getMonthName(currentMonth)}</span>
          <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-l border-gray-200/50 dark:border-white/10">
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2 className="w-10 h-10 text-[#007aff] animate-spin" />
              <p className="text-[13px] text-gray-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SALARY */}
              {activeTab === 'salary' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group transition-all hover:bg-white/80 dark:hover:bg-white/10">
                      <div className="absolute -right-3 -top-3 text-[#ff9500] opacity-[0.08] group-hover:opacity-20 transition-opacity"><CreditCard size={80} /></div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Jami Tushum</p>
                      <h3 className="text-2xl font-bold text-[#1d1d1f] dark:text-white">
                        {(salaryData?.revenue || 0).toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-2">Guruhlaringizdan tushgan pul</p>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group transition-all hover:bg-white/80 dark:hover:bg-white/10">
                      <div className="absolute -right-3 -top-3 text-[#007aff] opacity-[0.08] group-hover:opacity-20 transition-opacity"><Percent size={80} /></div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">KPI (Foiz)</p>
                      <h3 className="text-2xl font-bold text-[#007aff]">
                        {(salaryData?.kpi || 0).toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-2">Tushumdan sizga tegishli qism</p>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group transition-all hover:bg-white/80 dark:hover:bg-white/10">
                      <div className="absolute -right-3 -top-3 text-[#34c759] opacity-[0.08] group-hover:opacity-20 transition-opacity"><BookOpen size={80} /></div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Fiks Maosh</p>
                      <h3 className="text-2xl font-bold text-[#34c759]">
                        {(salaryData?.fixed || 0).toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-2">Kafolatlangan oylik summa</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#007aff] to-[#005bb5] rounded-2xl p-5 shadow-lg border border-[#004a94] relative overflow-hidden transition-transform hover:scale-[1.02]">
                      <p className="text-[10px] font-bold text-blue-200 mb-1.5 uppercase tracking-wider">Hisoblangan Jami</p>
                      <h3 className="text-3xl font-bold text-white">
                        {(salaryData?.total || 0).toLocaleString()} <span className="text-[12px] text-blue-200 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-blue-100 mt-2 opacity-80">Fiks + KPI (+ Bonus)</p>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group transition-all hover:bg-white/80 dark:hover:bg-white/10">
                      <div className="absolute -right-3 -top-3 text-[#34c759] opacity-[0.08] group-hover:opacity-20 transition-opacity"><CheckCircle2 size={80} /></div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">To'lab berildi</p>
                      <h3 className="text-2xl font-bold text-[#34c759]">
                        {(salaryData?.paid || 0).toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-2">Shu oyda to'langan oylik</p>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm relative overflow-hidden group transition-all hover:bg-white/80 dark:hover:bg-white/10">
                      <div className="absolute -right-3 -top-3 text-[#ff3b30] opacity-[0.08] group-hover:opacity-20 transition-opacity"><AlertCircle size={80} /></div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Qoldi (Qarz)</p>
                      <h3 className="text-2xl font-bold text-[#ff3b30]">
                        {(salaryData?.remaining || 0).toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">UZS</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-2">To'lanishi kerak bo'lgan qoldiq</p>
                    </div>
                  </div>

                  {/* Calendar Section - Full Width */}
                  <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-[#007aff]" />
                        Oylik to'lovlari kalendari
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#34c759]"></div> Maosh
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#af52de]"></div> Bonus
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-gray-200/50 dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-2xl overflow-hidden shadow-inner">
                      {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'].map(d => (
                        <div key={d} className="bg-gray-100/80 dark:bg-white/5 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
                      ))}
                      {getCalendarDays().map((day, idx) => {
                        const dayPayments = day ? getDayPayments(day) : [];
                        const dayTotal = dayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                        const isToday = day === new Date().toISOString().split('T')[0];

                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleDayClick(day)}
                            className={`min-h-[100px] p-2 bg-white dark:bg-black/20 ${day ? 'cursor-pointer hover:bg-[#007aff]/5 dark:hover:bg-[#007aff]/10 transition-all' : 'bg-gray-50/50 dark:bg-white/5'}`}
                          >
                            {day && (
                              <div className="h-full flex flex-col items-center">
                                <span className={`text-[12px] font-bold ${isToday ? 'h-6 w-6 flex items-center justify-center bg-[#007aff] text-white rounded-full ring-4 ring-[#007aff]/20' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {day.split('-')[2]}
                                </span>
                                {dayTotal > 0 && (
                                  <div className="w-full space-y-1 mt-auto">
                                    {dayPayments.slice(0, 2).map((p, i) => (
                                      <div 
                                        key={i} 
                                        className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-bold text-center ${
                                          p.type === 'SALARY' ? 'bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20' : 'bg-[#af52de]/10 text-[#af52de] border border-[#af52de]/20'
                                        }`}
                                      >
                                        {Number(p.amount).toLocaleString()}
                                      </div>
                                    ))}
                                    {dayPayments.length > 2 && <div className="text-[8px] text-gray-400 text-center font-bold">+{dayPayments.length - 2} yana</div>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* History List - Moved to Bottom (Full Width) */}
                  <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/10">
                      <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white">Tranzaksiyalar tarixi</h3>
                    </div>
                    <div className="overflow-y-auto divide-y divide-gray-200/30 dark:divide-white/5 max-h-[500px] scrollbar-thin">
                      {(salaryData?.payments || []).length > 0 ? (
                        [...salaryData.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p, idx) => (
                          <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                                p.type === 'SALARY' ? 'bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/10' : 'bg-[#af52de]/10 text-[#af52de] border border-[#af52de]/10'
                              }`}>
                                <CreditCard size={20} />
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white leading-tight">
                                  {p.type === 'SALARY' ? "Maosh to'lovi" : p.type === 'BONUS' ? 'Bonus' : 'Bayram puli'} 
                                </p>
                                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
                                  <Clock size={12} className="opacity-60" /> {new Date(p.date).toLocaleDateString('uz-UZ')} {p.comment && `— "${p.comment}"`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-[16px] font-black ${p.type === 'SALARY' ? 'text-[#34c759]' : 'text-[#af52de]'}`}>
                                {Number(p.amount).toLocaleString()} <span className="text-[10px] font-bold opacity-60">UZS</span>
                              </p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{p.paymentType || 'Naqd'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                          <Clock size={48} className="opacity-10" />
                          <p className="text-[13px] font-medium">Ushbu oyda to'lovlar topilmadi</p>
                        </div>
                      )}
                    </div>
                  </div>

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

              {/* TAB 2: STUDENT PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Revenue Card */}
                  <div className="bg-gradient-to-br from-[#34c759] to-[#248a3d] rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden transition-transform hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={160} /></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3 opacity-90">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md"><TrendingUp size={20} /></div>
                        <span className="text-[13px] font-bold uppercase tracking-wider">Jami Oylik Tushum</span>
                      </div>
                      <h3 className="text-5xl font-black tracking-tight flex items-baseline gap-3">
                        {(data?.totalIncome || 0).toLocaleString()} 
                        <span className="text-xl font-medium opacity-70">UZS</span>
                      </h3>
                      <p className="text-[13px] mt-4 font-medium text-emerald-50/80">Ushbu oy uchun guruhlardan yig'ilgan jami summa</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Group Breakdown */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm p-6 h-full">
                        <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white mb-6 flex items-center gap-2">
                          <Users size={18} className="text-[#34c759]" />
                          Guruhlar bo'yicha tushum
                        </h3>
                        <div className="space-y-4">
                          {data?.groups?.map((g) => {
                            const pct = g.activeStudents > 0 ? Math.round((g.paidStudents / g.activeStudents) * 100) : 0;
                            return (
                              <div key={g.id} className="p-4 bg-gray-50/80 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-[#34c759]/30">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white truncate pr-2">{g.name}</span>
                                  <span className="text-[14px] font-black text-[#34c759] whitespace-nowrap">{Number(g.totalCollected).toLocaleString()} <span className="text-[10px] font-normal opacity-60">UZS</span></span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-3">
                                  <span className="flex items-center gap-1.5"><Users size={12} className="opacity-60" /> {g.paidStudents} / {g.activeStudents} to'lagan</span>
                                  <span className="flex items-center gap-1.5"><Wallet size={12} className="opacity-60" /> {pct}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                                  <div 
                                    className="h-full bg-gradient-to-r from-[#34c759] to-[#30d158] rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(52,199,89,0.3)]" 
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                          {(!data?.groups || data.groups.length === 0) && (
                            <div className="py-12 text-center text-gray-400">
                              <BookOpen size={40} className="mx-auto mb-3 opacity-10" />
                              <p className="text-[13px] font-medium">Guruhlar topilmadi</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transaction History Table */}
                    <div className="lg:col-span-2">
                      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                          <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white">So'nggi to'lovlar</h3>
                          <div className="px-3 py-1 bg-[#34c759]/10 text-[#34c759] text-[10px] font-black uppercase rounded-full tracking-wider border border-[#34c759]/20">
                            {data?.payments?.length || 0} ta tranzaksiya
                          </div>
                        </div>
                        <div className="overflow-x-auto flex-1 scrollbar-thin">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="bg-gray-100/50 dark:bg-white/[0.04] text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/5">
                                <th className="text-left px-6 py-4 font-bold text-[11px] uppercase tracking-widest">O'quvchi</th>
                                <th className="text-left px-4 py-4 font-bold text-[11px] uppercase tracking-widest">Guruh</th>
                                <th className="text-right px-4 py-4 font-bold text-[11px] uppercase tracking-widest">Summa</th>
                                <th className="text-center px-4 py-4 font-bold text-[11px] uppercase tracking-widest">Turi</th>
                                <th className="text-right px-6 py-4 font-bold text-[11px] uppercase tracking-widest">Sana</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                              {data?.payments?.map((p) => (
                                <tr key={p.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/20 flex items-center justify-center font-bold text-[11px] text-[#1d1d1f] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                        {p.studentName?.charAt(0)}
                                      </div>
                                      <span className="font-bold text-[#1d1d1f] dark:text-white group-hover:text-[#007aff] transition-colors">{p.studentName}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="px-2.5 py-1 bg-gray-100/80 dark:bg-white/10 rounded-lg text-[11px] font-bold text-gray-600 dark:text-gray-300">
                                      {p.groupName}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <span className="font-black text-[#34c759] text-[15px]">{Number(p.amount).toLocaleString()}</span>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                      p.paymentType === 'CASH' || p.paymentType === 'Naqd' 
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400' 
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400'
                                    }`}>
                                      {paymentTypeMap[p.paymentType] || p.paymentType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <span className="text-[12px] font-bold text-gray-400">{new Date(p.paymentDate).toLocaleDateString('uz-UZ').slice(0, 5)}</span>
                                  </td>
                                </tr>
                              ))}
                              {(!data?.payments || data.payments.length === 0) && (
                                <tr>
                                  <td colSpan={5} className="text-center text-gray-400 py-20 font-medium">
                                    <div className="flex flex-col items-center gap-2">
                                      <TrendingUp size={48} className="opacity-10 mb-2" />
                                      To'lovlar tarixi mavjud emas
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherFinance;
