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
  Download, Bell, CreditCard, Award, ChevronLeft, Calendar
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import Skeleton from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const AttendanceCalendar = ({ records }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = daysInMonth(year, month);
  const startOffset = (firstDayOfMonth(year, month) + 6) % 7; // Monday start

  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

  const calendarDays = useMemo(() => {
    const days = [];
    // Previous month padding
    for (let i = 0; i < startOffset; i++) days.push({ type: 'empty' });

    // Current month days
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const record = records?.find(r => r.date === dateStr);
      days.push({
        day: d,
        type: 'day',
        status: record ? (record.status?.toLowerCase() === 'present' ? 'present' : 'absent') : 'none'
      });
    }
    return days;
  }, [records, year, month, daysCount, startOffset]);

  const weekLabels = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  return (
    <div className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-gray-100 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[17px] font-bold flex items-center gap-2">
          <Calendar className="text-[#007aff]" size={20} />
          Davomat Kalendari
        </h3>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-full">
          <span className="px-3 py-1 text-[13px] font-bold">{monthNames[month]} {year}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekLabels.map(w => (
          <div key={w} className="text-center text-[10px] font-black text-gray-400 p-2 uppercase tracking-widest">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((d, i) => (
          <div key={i} className="aspect-square relative flex items-center justify-center">
            {d.type === 'day' && (
              <>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all ${d.status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                  d.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' :
                    'bg-gray-100 dark:bg-white/10 text-gray-400'
                  }`}>
                  {d.day}
                </div>
                {d.day === new Date().getDate() && month === new Date().getMonth() && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#007aff] rounded-full"></div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Kelgan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Kelmagan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-white/20"></div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Dars yo'q</span>
        </div>
      </div>
    </div>
  );
};

const PaymentOverview = ({ payments }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('uz-UZ').format(val) + ' UZS';

  return (
    <div className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-gray-100 dark:border-white/10 shadow-sm col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[17px] font-bold flex items-center gap-2">
          <CreditCard className="text-blue-500" size={20} />
          To'lovlar tarixi
        </h3>
        <button className="text-[12px] font-bold text-[#007aff] px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">Barcha kvitansiyalar</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
              <th className="pb-4 pl-2">Oy</th>
              <th className="pb-4">Summa</th>
              <th className="pb-4">Chegirma</th>
              <th className="pb-4">To'langan</th>
              <th className="pb-4 text-right pr-2">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {payments.length > 0 ? payments.map((p, i) => (
              <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                <td className="py-4 pl-2">
                  <span className="text-[14px] font-bold">{p.month || 'Belgilanmagan'}</span>
                </td>
                <td className="py-4 font-bold text-[13px]">{formatCurrency(p.amount || 0)}</td>
                <td className="py-4 font-bold text-[13px] text-emerald-500">-{formatCurrency(p.discount || 0)}</td>
                <td className="py-4 font-bold text-[13px]">{formatCurrency(p.amount - (p.discount || 0))}</td>
                <td className="py-4 text-right pr-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ${p.amount > 1000 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                    }`}>
                    Tashdiqlangan
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-400 italic text-[13px]">To'lov ma'lumotlari mavjud emas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ExamCard = ({ exam }) => (
  <div className="bg-white dark:bg-white/10 p-6 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Award size={64} />
    </div>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full uppercase tracking-tighter">
        {exam.date || 'Yaqinda'}
      </span>
      <div className={`text-[17px] font-black ${exam.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
        {exam.score}%
      </div>
    </div>
    <h4 className="text-[15px] font-bold mb-3 truncate pr-4">{exam.title}</h4>
    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${exam.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
        style={{ width: `${exam.score}%` }}
      ></div>
    </div>
    <p className="text-[11px] text-gray-500 mt-3 font-medium">O'zlashtirish darajasi: <span className="font-bold">{exam.score >= 80 ? 'A' : 'B'}+</span></p>
  </div>
);

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
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
      fetchChildDetails(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await getParentChildren();
      setChildren(res.data);
      if (res.data.length > 0) {
        setSelectedChildId(res.data[0].id);
      }
    } catch (e) {
      toast.error('Ma\'lumotlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const [attRes, examRes, payRes] = await Promise.all([
        getChildAttendance(id),
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
          <Skeleton variant="rect" width="100%" height="200px" className="rounded-[2.5rem]" />
          <Skeleton variant="rect" width="100%" height="200px" className="rounded-[2.5rem]" />
          <Skeleton variant="rect" width="100%" height="200px" className="rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[#1d1d1f] dark:text-[#f5f5f7] pb-12">

      {/* Header / Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007aff] rounded-xl flex items-center justify-center shadow-lg shadow-[#007aff]/30">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight italic">UITS CRM <span className="font-black text-blue-500">Parent</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-[13px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={16} />
              Chiqish
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-12 animate-fade-in">

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`shrink-0 flex items-center gap-3 px-6 py-4 rounded-[2rem] transition-all border-2 ${selectedChildId === child.id
                  ? 'bg-white dark:bg-white/10 border-[#007aff] shadow-lg shadow-blue-500/10'
                  : 'bg-white/50 dark:bg-white/5 border-transparent opacity-60'
                  }`}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-white/20 overflow-hidden bg-gray-200">
                  {child.photo ? (
                    <img src={child.photo} alt={child.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#007aff]">
                      <UserIcon size={20} />
                    </div>
                  )}
                </div>
                <p className="text-[14px] font-bold">{child.name}</p>
              </button>
            ))}
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.2rem] border-4 border-white dark:border-black shadow-2xl overflow-hidden bg-gray-200">
              {selectedChild?.photo ? (
                <img src={selectedChild.photo} alt={selectedChild.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#007aff] bg-blue-50">
                  <UserIcon size={56} strokeWidth={1} />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1 min-w-0">
              <h2 className="text-[28px] md:text-[34px] font-black tracking-tight mb-2 truncate">
                {selectedChild?.name}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1.5 text-[14px] font-bold text-gray-500">
                  <Clock size={16} className="text-[#007aff]" />
                  ID: {selectedChild?.externalId}
                </span>
                <span className="flex items-center gap-1.5 text-[14px] font-bold text-gray-500">
                  <TrendingUp size={16} className="text-emerald-500" />
                  Status: Faol
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-[1.5rem]">
              <CalendarIcon className="text-[#007aff]" size={20} />
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Markazdagi davomat</p>
                <p className="text-xl font-black">{attendanceData?.summary?.percentage || 0}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Column 1: Attendance */}
          <div className="space-y-8">
            <AttendanceCalendar records={attendanceData?.recent_attendance || []} />
          </div>

          {/* Column 2 & 3: Payments and Exams */}
          <div className="lg:col-span-2 space-y-8">
            <PaymentOverview payments={payments} />

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[17px] font-bold flex items-center gap-2">
                  <Award className="text-amber-500" size={20} />
                  Imtihon natijalari
                </h3>
                <button className="text-[12px] font-bold text-gray-400 hover:text-gray-600 transition-colors">Barchasi</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.length > 0 ? exams.map((e, idx) => (
                  <ExamCard key={idx} exam={e} />
                )) : (
                  <div className="col-span-2 py-12 bg-white dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                    <Clock size={40} className="text-gray-200 mb-2" />
                    <p className="text-[13px] text-gray-400 font-medium">Hozircha imtihon natijalari yo'q</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default ParentDashboard;
