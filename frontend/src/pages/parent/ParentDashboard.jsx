import React, { useState, useEffect, useMemo } from 'react';
import {
  getParentChildren,
  getChildAttendance,
  getChildExams,
  getChildPayments
} from '../../services/api';
import {
  Layout, Users, Calendar as CalendarIcon, Banknote, BookOpen,
  ChevronRight, LogOut, User as UserIcon,
  CheckCircle2, XCircle, Clock, TrendingUp,
  Download, Bell, CreditCard, Award, ChevronLeft, Calendar,
  ArrowRight,
  MapPin,
  ArrowLeft,
  MessageSquare,
  BarChart3,
  User
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import Skeleton from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const AttendanceCalendar = ({ records, currentViewDate, onMonthChange }) => {
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
  
  const daysCount = daysInMonth(year, month);
  const startOffset = (firstDayOfMonth(year, month) + 6) % 7; // Monday start
  
  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push({ type: 'empty' });
    
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const record = records?.find(r => r.date === dateStr);
      days.push({
        day: d,
        dateStr,
        type: 'day',
        status: record ? (record.status?.toLowerCase() === 'present' ? 'present' : 'absent') : 'none',
        arrived: record?.arrived_at,
        left: record?.left_at
      });
    }
    return days;
  }, [records, year, month, daysCount, startOffset]);

  const weekLabels = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onMonthChange(newDate);
    setSelectedDayDetail(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    // Prevent navigating to future months beyond current month
    if (newDate > new Date()) return;
    onMonthChange(newDate);
    setSelectedDayDetail(null);
  };

  const isNextDisabled = new Date(year, month + 1, 1) > new Date();

  return (
    <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-5 md:p-8 border border-gray-100 dark:border-white/10 shadow-sm flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-[17px] font-bold flex items-center gap-2">
          <Calendar className="text-[#007aff]" size={20} />
          Davomat
        </h3>
        
        <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/5 min-w-[200px]">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-[13px] font-black uppercase tracking-tight">{monthNames[month]} {year}</span>
          <button
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            className={`p-2 rounded-xl transition-all ${isNextDisabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-white/10'}`}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
        {weekLabels.map(w => (
          <div key={w} className="text-center text-[10px] font-black text-gray-400 p-2 uppercase tracking-widest">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-8">
        {calendarDays.map((d, i) => (
          <div key={i} className="aspect-square relative flex items-center justify-center">
            {d.type === 'day' && (
              <button
                onClick={() => setSelectedDayDetail(d)}
                className={`w-full h-full max-w-[40px] max-h-[40px] rounded-xl md:rounded-2xl flex items-center justify-center text-[13px] font-bold transition-all relative group ${selectedDayDetail?.day === d.day ? 'ring-2 ring-offset-2 ring-[#007aff] dark:ring-offset-black' : ''
                  } ${d.status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                    d.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                      'bg-gray-100 dark:bg-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
              >
                {d.day}
                {d.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 border-2 border-white dark:border-black rounded-full"></div>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Selected Day Footer Detail */}
      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
        {selectedDayDetail ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-black uppercase tracking-widest text-[#007aff]">{selectedDayDetail.day} {monthNames[month].toLowerCase()}</p>
              <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase ${selectedDayDetail.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {selectedDayDetail.status === 'present' ? 'Kelgan' : 'Kelmagan'}
              </span>
            </div>
            {selectedDayDetail.status === 'present' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={10} /> Kirish
                  </p>
                  <p className="text-lg font-black">{selectedDayDetail.arrived || '--:--'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={10} /> Chiqish
                  </p>
                  <p className="text-lg font-black">{selectedDayDetail.left || '--:--'}</p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 text-[13px] font-medium italic">
                Ushbu kunda darslarda qatnashmagan
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 bg-gray-50/50 dark:bg-white/5 rounded-[1.5rem] border border-dashed border-gray-200 dark:border-white/10 text-gray-400 text-[12px] italic text-center">
            Batafsil ma'lumot uchun<br />kalendardagi kunni bosing
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-8 pt-4 border-t border-gray-50 dark:border-white/5 opacity-50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Kelgan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Kelmagan</span>
        </div>
      </div>
    </div>
  );
};

const PaymentOverview = ({ payments }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('uz-UZ').format(val) + ' UZS';

  return (
    <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[17px] font-bold flex items-center gap-2">
          <CreditCard className="text-blue-500" size={20} />
          To'lovlar
        </h3>
        <button className="text-[11px] font-bold text-[#007aff] px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-widest">Kvitansiyalar</button>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
              <th className="pb-4 pl-2 whitespace-nowrap">Oy</th>
              <th className="pb-4 whitespace-nowrap">Summa</th>
              <th className="pb-4 whitespace-nowrap">Chegirma</th>
              <th className="pb-4 whitespace-nowrap">Tushgan</th>
              <th className="pb-4 text-right pr-2 whitespace-nowrap">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {payments.length > 0 ? payments.map((p, i) => (
              <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                <td className="py-5 pl-2">
                  <span className="text-[14px] font-bold whitespace-nowrap">{p.month || '...'}</span>
                </td>
                <td className="py-5 font-bold text-[13px] whitespace-nowrap tracking-tight">{formatCurrency(p.amount || 0)}</td>
                <td className="py-5 font-bold text-[13px] text-emerald-500 whitespace-nowrap tracking-tight">-{formatCurrency(p.discount || 0)}</td>
                <td className="py-5 font-bold text-[13px] whitespace-nowrap tracking-tight">{formatCurrency(p.amount - (p.discount || 0))}</td>
                <td className="py-5 text-right pr-2 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.amount > 1000 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                    }`}>
                    Faol
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-400 italic text-[13px]">To'lovlar tarixi bo'sh</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ExamCard = ({ exam }) => {
  const hasScore = exam.score !== undefined && exam.score !== null;
  const scorePercent = hasScore ? exam.score : 0;
  
  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Award size={64} className="text-[#007aff]" />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${exam.date ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/40' : 'text-amber-500 bg-amber-50 dark:bg-amber-900/40'
            }`}>
            {exam.date || 'Yaqinda'}
          </span>
          <div className={`text-[20px] font-black tabular-nums ${!hasScore ? 'text-gray-400' :
              exam.score >= 80 ? 'text-emerald-500' : 'text-amber-500'
            }`}>
            {hasScore ? `${exam.score}%` : 'N/A'}
          </div>
        </div>
        <h4 className="text-[16px] font-bold mb-4 line-clamp-2 pr-10 min-h-[3rem]">
          {exam.title || 'Imtihon nomi belgilanmagan'}
        </h4>
        
        <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,122,255,0.2)] ${!hasScore ? 'bg-gray-200' :
                exam.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            style={{ width: `${scorePercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          {hasScore ? 'Natija:' : 'Holat:'}
        </p>
        <span className={`text-[13px] font-black ${!hasScore ? 'text-gray-400' :
            exam.score >= 80 ? 'text-emerald-500' : 'text-amber-500'
          }`}>
          {hasScore ? (exam.score >= 80 ? 'A+' : 'B') : 'Kutilayotgan'}
        </span>
      </div>
    </div>
  );
};

const ProgressReportCard = ({ report }) => {
  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const date = report.date ? new Date(report.date) : null;
  const dateStr = date ? `${date.getDate()}-${monthNames[date.getMonth()]}` : 'Sana yo\'q';

  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm relative group overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black text-purple-500 bg-purple-50 dark:bg-purple-900/40 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
          {dateStr}
        </span>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/10 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner">
              <User size={14} className="text-purple-400" />
           </div>
           <div className="text-left">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-0.5">O'qituvchi</p>
              <p className="text-[12px] font-black text-gray-600 dark:text-gray-300 truncate max-w-[100px]">{report.teacher?.name || 'Belgilanmagan'}</p>
           </div>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="relative">
           <QuoteIcon className="absolute -top-1 -left-1 text-purple-500/10 w-8 h-8 rotate-180" />
           <p className="text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed font-semibold italic pl-4 pb-4">
            {report.comment || 'Ushbu dars uchun o\'qituvchi tomonidan izoh qoldirilmagan.'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
         <span className="text-[11px] font-black text-[#1d1d1f] dark:text-gray-400 uppercase tracking-widest truncate">{report.group?.name || 'Umumiy dars'}</span>
      </div>
    </div>
  );
};

const QuoteIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017V21H14.017ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V12C5.017 12.5523 4.56928 13 4.017 13H2.017V21H5.017Z" />
  </svg>
);

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  
  const [attendanceData, setAttendanceData] = useState(null);
  const [exams, setExams] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchChildDetails(selectedChildId, currentViewDate);
    }
  }, [selectedChildId, currentViewDate]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await getParentChildren();
      setChildren(res.data);
      if (res.data.length > 0) {
        setSelectedChildId(res.data[0].id);
      }
    } catch (e) {
      toast.error('Ma\'mulotlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (id, viewDate) => {
    try {
      setLoadingDetails(true);
      const formattedDate = viewDate.toISOString().split('T')[0];
      
      const [attRes, examRes, payRes] = await Promise.all([
        getChildAttendance(id, formattedDate),
        getChildExams(id),
        getChildPayments(id)
      ]);
      setAttendanceData(attRes.data);
      setExams(examRes.data);
      setPayments(payRes.data);
    } catch (e) {
      toast.error('Bola ma\'lumotlarini yangilab bo\'lmadi');
    } finally {
      setLoadingDetails(false);
    }
  };

  const selectedChild = children.find(c => c.id === selectedChildId);
  const reports = useMemo(() => {
    return (attendanceData?.grades || []).filter(g => g.comment);
  }, [attendanceData]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] p-6 space-y-6">
        <Skeleton variant="rect" width="100%" height="80px" className="rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton variant="rect" width="100%" height="250px" className="rounded-[2.5rem]" />
          <Skeleton variant="rect" width="100%" height="250px" className="rounded-[2.5rem]" />
          <Skeleton variant="rect" width="100%" height="250px" className="rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[#1d1d1f] dark:text-[#f5f5f7] pb-12">

      {/* Header / Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/10 px-4 md:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00bfff] to-[#007aff] rounded-xl flex items-center justify-center shadow-lg shadow-[#007aff]/30">
              <Award size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight italic hidden sm:block">UITS CRM <span className="font-black text-blue-500">Parent</span></h1>
              <h1 className="text-[17px] font-bold tracking-tight sm:hidden">UITS</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-[13px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-10 md:space-y-12 animate-fade-in transition-opacity duration-500" style={{ opacity: loadingDetails ? 0.6 : 1 }}>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`shrink-0 flex items-center gap-3 px-6 py-4 rounded-[2.2rem] transition-all border-2 ${selectedChildId === child.id
                  ? 'bg-white dark:bg-white/10 border-[#007aff] shadow-xl shadow-blue-500/10'
                  : 'bg-white/50 dark:bg-white/5 border-transparent opacity-60'
                  }`}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-white/20 overflow-hidden bg-gray-200 shadow-sm">
                  {child.photo ? (
                    <img src={child.photo} alt={child.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#007aff]">
                      <UserIcon size={20} />
                    </div>
                  )}
                </div>
                <p className="text-[14px] font-black tracking-tight">{child.name}</p>
              </button>
            ))}
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-white dark:bg-white/5 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-[80px] group-hover:bg-blue-500/10 transition-all duration-700"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white dark:border-black shadow-2xl overflow-hidden bg-gray-200">
              {selectedChild?.photo ? (
                <img src={selectedChild.photo} alt={selectedChild.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#007aff] bg-blue-50">
                  <UserIcon size={64} strokeWidth={1} />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1 min-w-0">
              <h2 className="text-[24px] md:text-[42px] font-black tracking-tighter mb-4 leading-[1.1] break-words">
                {selectedChild?.name}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-2xl text-[13px] font-bold text-gray-500 border border-gray-100 dark:border-white/5">
                  <CreditCard size={14} className="text-[#007aff]" />
                  ID: {selectedChild?.externalId}
                </span>
                <span className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-bold border ${attendanceData?.summary?.percentage > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  <TrendingUp size={14} />
                  Natija: {attendanceData?.summary?.percentage > 80 ? 'Zo\'r' : 'Yaxshi'}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center w-40 h-40 bg-[#007aff] rounded-[2.5rem] shadow-2xl shadow-blue-500/30 text-white p-6 relative group active:scale-[0.98] transition-transform">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Umumiy Davomat</p>
              <p className="text-[42px] font-black tracking-tighter tabular-nums">{attendanceData?.summary?.percentage || 0}<span className="text-[20px] ml-0.5">%</span></p>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">

          {/* Column 1: Attendance */}
          <div className="space-y-8">
            <AttendanceCalendar
              records={attendanceData?.recent_attendance || []}
              currentViewDate={currentViewDate}
              onMonthChange={setCurrentViewDate}
            />
          </div>

          {/* Column 2 & 3: Payments, Exams, and Reports */}
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            <PaymentOverview payments={payments} />

            {/* Imtihon Natijalari Section */}
            <div>
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-[18px] font-black flex items-center gap-2">
                  <BarChart3 className="text-emerald-500" size={24} />
                   Imtihon natijalari
                </h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{exams.length} ta natija</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {exams.length > 0 ? exams.map((e, idx) => (
                  <ExamCard key={idx} exam={e} />
                )) : (
                  <div className="col-span-2 py-12 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center px-10">
                    <Clock size={32} className="text-gray-300 mb-2" />
                    <p className="text-[14px] text-gray-400 font-bold">Imtihon natijalari yo'q</p>
                  </div>
                )}
              </div>
            </div>

            {/* O'zlashtirish Reportlari Section */}
            <div>
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-[18px] font-black flex items-center gap-2">
                  <MessageSquare className="text-purple-500" size={24} />
                   O'zlashtirish reportlari
                </h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{reports.length} ta izoh</span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                {reports.length > 0 ? reports.map((r, idx) => (
                  <ProgressReportCard key={idx} report={r} />
                )) : (
                  <div className="py-16 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare size={32} className="text-gray-300" />
                    </div>
                    <p className="text-[15px] text-gray-400 font-bold mb-1">Hozircha reportlar yo'q</p>
                    <p className="text-[12px] text-gray-400/60 max-w-[240px]">O'qituvchi tomonidan yuborilgan o'zlashtirish haqidagi izohlar shu yerda ko'rinadi.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA / Help */}
        <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
          <div className="flex items-center gap-10">
            <Layout size={20} />
            <Users size={20} />
            <CalendarIcon size={20} />
          </div>
          <p className="text-[12px] font-bold text-gray-400 tracking-tight">Support: (71) 000-00-00</p>
        </div>

      </main>
    </div>
  );
};

export default ParentDashboard;
