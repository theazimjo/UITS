import React, { useState, useEffect, useMemo } from 'react';
import {
  getParentChildren,
  getChildAttendance,
  getChildExams,
  getChildPayments,
  getParentNotifications,
  markNotificationRead
} from '../../services/api';
import {
  Award, TrendingUp, CheckCircle2, Clock, LogOut, User as UserIcon,
  CreditCard, BarChart3, MessageSquare, BookOpen, Calendar, Bell, History, CheckCheck
} from 'lucide-react';
import Skeleton from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import useStore from '../../store/useStore';

// Modular Components
import { StatCard, SectionHeader, ChildSelector } from './components/CommonItems';
import { ExamCard, ProgressReportCard, EducationCard } from './components/AcademicCards';
import { AttendanceCalendar, PaymentOverview } from './components/AttendancePayments';

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
  const { notifications, fetchNotifications, markAsRead } = useStore();

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchChildren();
    fetchNotifications();
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

  const handleMarkRead = async (id) => {
    await markAsRead(id);
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

  const selectedChild = useMemo(() => {
    return children.find(c => c.id === selectedChildId);
  }, [children, selectedChildId]);

  const { avgGrade, todayGrade, todayArrived, todayDeparted } = useMemo(() => {
    const grades = attendanceData?.grades || [];
    if (grades.length === 0) return { avgGrade: 0, todayGrade: null };

    const sum = grades.reduce((acc, curr) => acc + Number(curr.score), 0);
    const avg = sum / grades.length;

    const todayDateStr = new Date().toISOString().split('T')[0];
    const today = grades.find(g => {
      const gDate = new Date(g.date).toISOString().split('T')[0];
      return gDate === todayDateStr;
    });

    const todayAtt = attendanceData?.recent_attendance?.find(a => {
      const aDate = new Date(a.date).toISOString().split('T')[0];
      return aDate === todayDateStr;
    });

    return {
      avgGrade: avg.toFixed(1),
      todayGrade: today ? Number(today.score) : null,
      todayArrived: todayAtt?.arrived || null,
      todayDeparted: todayAtt?.departed || null
    };
  }, [attendanceData]);

  const reports = useMemo(() => {
    return (attendanceData?.grades || []).filter(g => g.comment);
  }, [attendanceData]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatCurrency = (val) => new Intl.NumberFormat('uz-UZ').format(val) + ' UZS';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000] p-6 space-y-8 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[12px]">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-[#1d1d1f] dark:text-[#f5f5f7] pb-24 relative overflow-hidden">

      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-3xl border-b border-gray-200/50 dark:border-white/10 px-4 md:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00bfff] to-[#007aff] rounded-2xl flex items-center justify-center shadow-xl shadow-[#007aff]/30 group-hover:rotate-6 transition-transform">
              <Award size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-black tracking-tighter leading-none italic">UITS CRM</h1>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Parent Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative group">
              <div className={`p-2 rounded-xl transition-all ${notifications.filter(n => !n.isRead).length > 0
                  ? 'bg-red-50 text-red-500 animate-pulse'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                }`}>
                <Bell size={20} />
              </div>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow-lg">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-[13px] font-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 md:space-y-20 relative z-10 transition-opacity duration-700" style={{ opacity: loadingDetails ? 0.7 : 1 }}>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <ChildSelector children={children} selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
          </div>
        )}

        {/* Overhauled Hero Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white dark:bg-white/5 rounded-[3.5rem] p-8 md:p-14 border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:bg-blue-500/20 transition-all duration-1000"></div>

            <div className="flex flex-col xl:flex-row items-center gap-12 relative z-10">
              {/* Profile Side */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3.5rem] border-8 border-white dark:border-black shadow-2xl overflow-hidden bg-gray-200 relative z-10">
                  {selectedChild?.photo ? (
                    <img src={selectedChild.photo} alt={selectedChild.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#007aff] bg-blue-50">
                      <UserIcon size={80} strokeWidth={1} />
                    </div>
                  )}
                </div>
              </div>

              {/* Info & Stats Side */}
              <div className="text-center xl:text-left flex-1 space-y-10">
                <div>
                  <h2 className="text-[32px] md:text-[56px] font-black tracking-tighter leading-[0.95] mb-6 drop-shadow-sm">
                    {selectedChild?.name}
                  </h2>
                  <div className="flex flex-wrap justify-center xl:justify-start gap-4">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-white/5 rounded-2xl text-[14px] font-black text-gray-500 border border-gray-100 dark:border-white/10 shadow-sm">
                      <CreditCard size={16} className="text-blue-500" />
                      ID: {selectedChild?.externalId}
                    </div>
                  </div>
                </div>

                {/* The Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard
                    icon={TrendingUp}
                    label="O'rtacha Baxo"
                    value={avgGrade}
                    colorClass="bg-emerald-500"
                    borderClass="border-emerald-100 dark:border-emerald-500/20"
                    subValue="GPA"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Bugungi Baxo"
                    value={todayGrade !== null ? todayGrade : '—'}
                    colorClass="bg-blue-500"
                    borderClass="border-blue-100 dark:border-blue-500/20"
                    subValue="DAILY"
                  />
                  <StatCard
                    icon={Clock}
                    label="Kirish Vaqti"
                    value={todayArrived}
                    colorClass="bg-indigo-500"
                    borderClass="border-indigo-100 dark:border-indigo-500/20"
                    subValue="IN"
                  />
                  <StatCard
                    icon={LogOut}
                    label="Chiqish Vaqti"
                    value={todayDeparted}
                    colorClass="bg-purple-500"
                    borderClass="border-purple-100 dark:border-purple-500/20"
                    subValue="OUT"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Directions */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="px-2 mb-8">
            <h3 className="text-[20px] font-black uppercase tracking-tighter text-blue-500">Faol o'quv dasturlari</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {selectedChild?.enrollments?.filter(e => e.status === 'ACTIVE').map((e, idx) => (
              <EducationCard key={idx} enrollment={e} />
            ))}
          </div>
        </section>

        {/* Detailed Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16">

          {/* Left Column: Interactive Attendance */}
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
            <AttendanceCalendar
              records={attendanceData?.recent_attendance || []}
              currentViewDate={currentViewDate}
              onMonthChange={setCurrentViewDate}
            />
          </div>

          {/* Right Columns: Payments, Exams, Reports */}
          <div className="lg:col-span-2 space-y-20 md:space-y-24 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">

            <PaymentOverview payments={payments} formatCurrency={formatCurrency} />

            {/* Notifications Section */}
            <section>
              <SectionHeader icon={Bell} title="Bildirishnomalar" count={notifications.filter(n => !n.isRead).length} colorClass="bg-red-500" />
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-6 rounded-3xl border transition-all flex items-start gap-5 group relative overflow-hidden ${n.isRead
                          ? 'bg-white/40 dark:bg-white/5 border-gray-100 dark:border-white/5 opacity-70'
                          : 'bg-white dark:bg-white/10 border-blue-100 dark:border-blue-500/30 shadow-xl shadow-blue-500/5'
                        }`}
                    >
                      {!n.isRead && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>}

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-100 dark:bg-white/5 text-gray-400' : 'bg-blue-500 text-white'
                        }`}>
                        <Bell size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-[16px] truncate pr-4">{n.title}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                          {n.message}
                        </p>
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="w-10 h-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/20 flex items-center justify-center text-blue-500 transition-colors"
                          title="O'qilgan deb belgilash"
                        >
                          <CheckCheck size={18} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-16 bg-white/40 dark:bg-white/5 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center px-12">
                    <Bell size={48} className="text-gray-200 mb-4" />
                    <p className="text-[15px] text-gray-400 font-black tracking-tight">Hozircha xabarlar yo'q</p>
                  </div>
                )}
              </div>
            </section>

            {/* Exams Overhaul */}
            <section>
              <SectionHeader icon={BarChart3} title="Imtihon Natijalari" count={exams.length} colorClass="bg-emerald-500" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {exams.length > 0 ? exams.map((e, idx) => (
                  <ExamCard key={idx} exam={e} />
                )) : (
                  <div className="col-span-2 py-24 bg-white dark:bg-white/5 rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center px-12">
                    <Award size={64} className="text-gray-200 mb-6" />
                    <p className="text-[18px] text-gray-400 font-black tracking-tight">Hozircha natijalar e'lon qilinmagan</p>
                  </div>
                )}
              </div>
            </section>

            {/* Teacher Reports Overhaul */}
            <section>
              <SectionHeader icon={MessageSquare} title="O'qituvchi Izohlari" count={reports.length} colorClass="bg-purple-500" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reports.length > 0 ? reports.map((r, idx) => (
                  <ProgressReportCard key={idx} report={r} QuoteIcon={QuoteIcon} />
                )) : (
                  <div className="col-span-2 py-24 bg-white dark:bg-white/5 rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center px-12">
                    <MessageSquare size={64} className="text-gray-200 mb-6" />
                    <p className="text-[18px] text-gray-400 font-black tracking-tight">O'qituvchi tomonidan izohlar yuborilmagan</p>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>

        {/* Education History Overlay Header */}
        {selectedChild?.enrollments?.filter(e => e.status !== 'ACTIVE').length > 0 && (
          <section className="pt-20 border-t border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-10 pl-2">
              <History className="text-gray-400" size={28} />
              <h3 className="text-[22px] font-black uppercase tracking-tighter text-gray-400">Tamomlangan kurslar tarixi</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedChild?.enrollments?.filter(e => e.status !== 'ACTIVE').map((e, idx) => (
                <div key={idx} className="bg-white/50 dark:bg-white/5 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 flex items-center justify-between group hover:bg-white dark:hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
                      <History size={20} />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-black text-gray-700 dark:text-gray-200">{e.group?.course?.name || 'Eski yo\'nalish'}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">{e.group?.name}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${e.status === 'GRADUATED' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {e.status === 'GRADUATED' ? 'Tugatgan' : 'Tark etgan'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer info */}
        <div className="pt-24 pb-12 opacity-30 flex flex-col items-center gap-6">
          <div className="flex items-center gap-12 text-gray-500">
            <BookOpen size={24} />
            <TrendingUp size={24} />
            <Award size={24} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">&copy; 2026 UITS ACADEMY CRM SYSTEM</p>
        </div>

      </main>
    </div>
  );
};

export default ParentDashboard;
