import React, { useState, useEffect } from 'react';
import {
  getDashboardAttendanceStats,
  getDashboardGeneralStats,
  clearAllData
} from '../services/api';
import toast from 'react-hot-toast';
import {
  Users, Wallet, UserCheck, Banknote, TrendingUp,
  Trash2, ShieldAlert, AlertCircle, ExternalLink,
  Activity, UserPlus, BookOpen, Clock, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import Modal from '../components/common/Modal';

const Dashboard = ({ studentsCount, staffCount, groupsCount }) => {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Attendance Stats
  const [attStats, setAttStats] = useState({
    expected: 0,
    arrived: 0,
    percentage: 0,
    students: [],
    expectedMonthlyRevenue: 0,
    todayRevenue: 0
  });
  const [loadingAtt, setLoadingAtt] = useState(true);

  // General Analytics Stats
  const [genStats, setGenStats] = useState({
    studentGrowth: [],
    groupStatus: [],
    activity: [],
    totalStudents: 0,
    activeGroups: 0
  });
  const [loadingGen, setLoadingGen] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingAtt(true);
      setLoadingGen(true);

      const [attRes, genRes] = await Promise.all([
        getDashboardAttendanceStats(),
        getDashboardGeneralStats()
      ]);

      setAttStats(attRes.data);
      setGenStats(genRes.data);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
      toast.error('Statistikalarni yuklashda xatolik!');
    } finally {
      setLoadingAtt(false);
      setLoadingGen(false);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0 UZS';
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(num) + ' UZS';
  };

  const stats = [
    {
      label: 'Bugun kutilgan',
      value: loadingAtt ? '...' : `${attStats.arrived} / ${attStats.expected}`,
      icon: <UserCheck size={24} />,
      color: 'blue',
      sub: `${attStats.percentage}% davomat ko'rsatkichi`,
      trend: attStats.percentage >= 80 ? 'up' : 'neutral',
      onClick: () => setIsStatsModalOpen(true)
    },
    {
      label: 'Xodimlar soni',
      value: staffCount || 0,
      icon: <Users size={24} />,
      color: 'indigo',
      sub: "Barcha faol ustoz va xodimlar",
      trend: 'neutral'
    },
    {
      label: 'Kutilayotgan tushum (oylik)',
      value: loadingAtt ? '...' : formatCurrency(attStats.expectedMonthlyRevenue),
      icon: <Wallet size={24} />,
      color: 'purple',
      sub: `Shu oy uchun kutilmoqda`,
      trend: 'neutral'
    },
    {
      label: 'Bugun tushgan tushum',
      value: loadingAtt ? '...' : formatCurrency(attStats.todayRevenue),
      icon: <Banknote size={24} />,
      color: 'emerald',
      sub: 'Bugungi kassa',
      trend: 'up'
    },
  ];

  const colorStyles = {
    blue: { bg: 'bg-[#007aff]/10', text: 'text-[#007aff]', border: 'group-hover:border-[#007aff]/30' },
    indigo: { bg: 'bg-[#5856d6]/10', text: 'text-[#5856d6]', border: 'group-hover:border-[#5856d6]/30' },
    emerald: { bg: 'bg-[#34c759]/10', text: 'text-[#34c759]', border: 'group-hover:border-[#34c759]/30' },
    purple: { bg: 'bg-[#af52de]/10', text: 'text-[#af52de]', border: 'group-hover:border-[#af52de]/30' },
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      toast.success('Barcha ma\'lumotlar muvaffaqiyatli o\'chirildi!');
      window.location.reload();
    } catch (err) {
      toast.error('Xatolik yuz berdi!');
      setIsClearing(false);
    }
  };

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full">

      {/* Header Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Asosiy panel</h2>
        <p className="text-[13px] text-gray-500 mt-1">UITS o'quv markazining umumiy statistikasi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={stat.onClick}
            className={`bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 transition-all duration-300 group hover:-translate-y-1 shadow-sm ${colorStyles[stat.color].border} ${stat.onClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-3xl font-bold text-black dark:text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorStyles[stat.color].bg} ${colorStyles[stat.color].text}`}>
                {stat.icon}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-white/5">
              <div className="flex items-center gap-2">
                {stat.trend === 'up' ? (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#34c759]/10 text-[#34c759]">
                    <TrendingUp size={12} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500/10 text-gray-400">
                    <TrendingUp size={12} strokeWidth={3} />
                  </div>
                )}
                <span className="text-[11px] font-medium text-gray-500">
                  {stat.sub}
                </span>
              </div>
              {stat.onClick && <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Student Growth Chart */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity size={20} className="text-[#007aff]" />
                Talabalar o'sishi
              </h3>
              <p className="text-[12px] text-gray-500 mt-1">Oxirgi 6 oylik statistik ko'rinish</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#007aff]" />
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tighter">Yangi talabalar</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={genStats.studentGrowth}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007aff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#007aff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#007aff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGrowth)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Group Distribution & Recent Activity */}
        <div className="flex flex-col gap-8">
          {/* Groups Health */}
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm">
            <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-[#af52de]" />
              Guruhlar taqsimoti
            </h3>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genStats.groupStatus}
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genStats.groupStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#007aff', '#ffcc00', '#34c759'][index % 3]} cornerRadius={4} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {genStats.groupStatus.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1">{s.name}</p>
                  <p className="text-sm font-bold text-black dark:text-white uppercase">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="flex-1 bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-[15px] font-bold mb-6 flex items-center gap-2">
              <Clock size={18} className="text-[#34c759]" />
              So'nggi harakatlar
            </h3>
            <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {genStats.activity.length > 0 ? genStats.activity.map((act, i) => (
                <div key={i} className="flex gap-4 group cursor-default">
                  <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${act.type === 'PAYMENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {act.type === 'PAYMENT' ? <Banknote size={18} /> : <UserPlus size={18} />}
                  </div>
                  <div className="flex-1 border-b border-gray-100 dark:border-white/5 pb-4 group-last:border-0">
                    <p className="text-[13px] font-bold text-black dark:text-white group-hover:text-[#007aff] transition-colors">{act.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[11px] text-gray-500 font-medium">{act.subtitle}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{new Date(act.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-center text-gray-400 italic text-[13px] py-10">
                  Mavjud emas...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Maintenance Section */}
      <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-white/10">
        <div className="bg-[#ff3b30]/5 border border-[#ff3b30]/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff3b30]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex items-center gap-5 text-center md:text-left relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#ff3b30]/10 flex items-center justify-center text-[#ff3b30] shadow-sm transition-transform hover:scale-105">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-black dark:text-white mb-1">Tizimni Tozalash</h3>
              <p className="text-gray-500 text-[13px] max-w-md">Barcha talabalar, guruhlar, to'lovlar va xodimlarni butunlay o'chirib tashlaydi. Faqat testlash uchun!</p>
            </div>
          </div>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="w-full md:w-auto px-6 py-2.5 bg-[#ff3b30] hover:bg-[#ff453a] text-white rounded-lg text-[13px] font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10 shadow-sm"
          >
            <Trash2 size={16} />
            Ma'lumotlarni o'chirish
          </button>
        </div>
      </div>

      {/* Stats Detail Modal */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title="Bugungi kutilgan davomat (to'liq ro'yxat)"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div>
              <p className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">Umumiy ko'rsatkich</p>
              <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">{attStats.arrived} / {attStats.expected} <span className="text-sm font-medium ml-1">({attStats.percentage}%)</span></h3>
            </div>
            <UserCheck className="text-blue-500" size={32} />
          </div>

          <div className="space-y-2">
            {attStats.students && attStats.students.length > 0 ? (
              attStats.students
                .sort((a, b) => (a.status === 'present' ? -1 : 1))
                .map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-white/20">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">{s.name}</p>
                        <p className="text-[11px] text-gray-500">{s.groupName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === 'present'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                          {s.status_display}
                        </span>
                        {(s.arrivedAt || s.leftAt) && (
                          <div className="flex flex-col items-end mr-1">
                            {s.arrivedAt && <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">K: {s.arrivedAt}</span>}
                            {s.leftAt && <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Ch: {s.leftAt}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                O'quvchilar ro'yxati bo'sh
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => !isClearing && setIsClearModalOpen(false)}
        title="Tizimni Tozalash"
      >
        <div className="space-y-6">
          <div className="p-4 bg-[#ffcc00]/10 border border-[#ffcc00]/20 rounded-xl flex gap-3">
            <AlertCircle className="text-[#ffcc00] shrink-0" size={20} />
            <p className="text-[#ffcc00] text-[13px] font-medium leading-relaxed mt-0.5">
              Bu amalni ortga qaytarib bo'lmaydi. Tizimdagi barcha ma'lumotlar (talabalar, guruhlar, to'lovlar) o'chib ketadi. Admin akkauntingiz saqlanib qoladi.
            </p>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-[14px]">
            Haqiqatdan ham hamma narsani o'chirib yubormoqchimisiz?
          </p>

          <div className="flex gap-3 justify-end pt-2">
            <button
              disabled={isClearing}
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg text-[13px] font-medium transition-all disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              disabled={isClearing}
              onClick={handleClearData}
              className="px-4 py-2 bg-[#ff3b30] hover:bg-[#ff453a] text-white rounded-lg text-[13px] font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isClearing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />}
              O'chirish
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;