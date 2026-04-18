import React, { useState, useEffect, useMemo } from 'react';
import {
  getDashboardAttendanceStats,
  getDashboardGeneralStats,
  getFinanceChart,
} from '../services/api';
import toast from 'react-hot-toast';
import {
  Users, Wallet, UserCheck, Banknote, TrendingUp,
  AlertCircle, ExternalLink,
  Activity, UserPlus, BookOpen, Clock, ChevronRight,
  RefreshCw, LayoutDashboard, Database, UserRound, UsersRound,
  ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon,
  Calendar, ChevronLeft, ChevronDown
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  AreaChart, Area
} from 'recharts';
import Modal from '../components/common/Modal';
import Skeleton from '../components/common/Skeleton';

import useStore from '../store/useStore';

const Dashboard = () => {
  const { students, staff, groups, loading: globalLoading } = useStore();
  const studentsCount = students.length;
  const staffCount = staff.length;
  const groupsCount = groups.length;
  const loading = globalLoading;

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Attendance Stats
  const [attStats, setAttStats] = useState({
    expected: 0,
    arrived: 0,
    percentage: 0,
    students: [],
    expectedMonthlyRevenue: 0,
    todayRevenue: 0,
    totalMonthRevenue: 0,
    isHistory: false,
    date: ''
  });
  const [loadingAtt, setLoadingAtt] = useState(true);

  // General Analytics Stats
  const [genStats, setGenStats] = useState({
    groupStatus: [],
    activity: [],
    totalStudents: 0,
    activeGroups: 0
  });
  const [loadingGen, setLoadingGen] = useState(true);

  // Finance Chart Data
  const [financeChartData, setFinanceChartData] = useState([]);
  const [loadingFinance, setLoadingFinance] = useState(true);

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  const fetchDashboardData = async (date) => {
    try {
      setLoadingAtt(true);
      setLoadingGen(true);
      setLoadingFinance(true);

      const [attRes, genRes, finRes] = await Promise.all([
        getDashboardAttendanceStats(date),
        getDashboardGeneralStats(date),
        getFinanceChart()
      ]);

      if (attRes.data) setAttStats(attRes.data);
      if (genRes.data) setGenStats(genRes.data);
      if (finRes.data) setFinanceChartData(finRes.data);
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
      const errorMsg = e.response?.data?.message || 'Statistikalarni yuklashda xatolik yuz berdi';
      toast.error(errorMsg);
    } finally {
      setLoadingAtt(false);
      setLoadingGen(false);
      setLoadingFinance(false);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0 UZS';
    return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(num) + ' UZS';
  };

  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return '';
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('uz-UZ', { month: 'short' });
    } catch (e) {
      return monthStr;
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const processedFinanceData = useMemo(() => {
    return financeChartData.map(item => ({
      ...item,
      label: formatMonthLabel(item.month)
    }));
  }, [financeChartData]);

  const statsList = [
    {
      label: attStats.isHistory ? `Davomat (${formatDateLabel(selectedDate)})` : 'Bugun kutilgan',
      value: (loading || loadingAtt) ? <Skeleton width="100px" height="32px" /> : `${attStats.arrived} / ${attStats.expected}`,
      icon: <UserCheck size={24} />,
      color: 'blue',
      sub: (loading || loadingAtt) ? <Skeleton width="140px" height="12px" /> : `${attStats.percentage}% davomat ko'rsatkichi`,
      trend: attStats.percentage >= 80 ? 'up' : 'neutral',
      onClick: () => setIsStatsModalOpen(true)
    },
    {
      label: 'Xodimlar soni',
      value: (loading || loadingGen) ? <Skeleton width="40px" height="32px" /> : (staffCount || 0),
      icon: <Users size={24} />,
      color: 'indigo',
      sub: "Faol ustoz va xodimlar",
      trend: 'neutral'
    },
    {
      label: 'Kutilgan Tushum',
      value: (loading || loadingAtt) ? <Skeleton width="140px" height="32px" /> : formatCurrency(attStats.expectedMonthlyRevenue),
      icon: <Wallet size={24} />,
      color: 'purple',
      sub: `${selectedDate.slice(0, 7)} oyi uchun jami`,
      trend: 'neutral'
    },
    {
      label: attStats.isHistory ? 'Kunlik tushum' : 'Bugun tushgan tushum',
      value: (loading || loadingAtt) ? <Skeleton width="140px" height="32px" /> : formatCurrency(attStats.todayRevenue),
      icon: <Banknote size={24} />,
      color: 'emerald',
      sub: attStats.isHistory ? formatDateLabel(selectedDate) : 'Bugungi kassa',
      trend: 'up'
    },
  ];

  const colorStyles = {
    blue: { bg: 'bg-[#007aff]/10', text: 'text-[#007aff]', border: 'group-hover:border-[#007aff]/30' },
    indigo: { bg: 'bg-[#5856d6]/10', text: 'text-[#5856d6]', border: 'group-hover:border-[#5856d6]/30' },
    emerald: { bg: 'bg-[#34c759]/10', text: 'text-[#34c759]', border: 'group-hover:border-[#34c759]/30' },
    purple: { bg: 'bg-[#af52de]/10', text: 'text-[#af52de]', border: 'group-hover:border-[#af52de]/30' },
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">

      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 lg:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4 z-30 sticky top-0">

        {/* Title Area */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="p-1.5 bg-[#007aff] text-white rounded-md shadow-sm">
            <LayoutDashboard size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">
              {attStats.isHistory ? `Statistika: ${formatDateLabel(selectedDate)}` : 'Bugungi Panel'}
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Marhamat, {attStats.isHistory ? formatDateLabel(selectedDate) : 'bugungi'} ko'rsatkichlar bilan tanishing
            </p>
          </div>
        </div>

        {/* Center/Right Actions Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">

          {/* Date Selector */}
          <div className="flex items-center gap-3 bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
            <Calendar size={14} className="text-[#007aff]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] outline-none border-none focus:ring-0 p-0"
            />
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-white/10 hidden sm:block" />

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(selectedDate)}
            disabled={loadingAtt || loadingGen || loadingFinance}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all shadow-sm bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] border border-gray-200 dark:border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingAtt || loadingGen || loadingFinance ? 'animate-spin' : ''} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6 lg:p-10">
        <div className="max-w-[1700px] mx-auto space-y-10 animate-fade-in pb-10">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {statsList.map((stat, i) => (
              <div
                key={i}
                onClick={stat.onClick}
                className={`bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 transition-all duration-300 group hover:-translate-y-1 shadow-sm ${colorStyles[stat.color].border} ${stat.onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-black dark:text-white tracking-tight tabular-nums">{stat.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorStyles[stat.color].bg} ${colorStyles[stat.color].text}`}>
                    {stat.icon}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${stat.trend === 'up' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-gray-500/10 text-gray-400'}`}>
                      <TrendingUp size={12} strokeWidth={3} />
                    </div>
                    <span className="text-[11px] font-medium text-gray-500">
                      {stat.sub}
                    </span>
                  </div>
                  {stat.onClick && <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>
            ))}
          </div>

          {/* Middle Row: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Financial Dynamics Chart */}
            {/* Financial Dynamics Chart - Expanded to Full Width */}
            <div className="lg:col-span-3 bg-white/60 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-[#1d1d1f] dark:text-white">
                    <Banknote size={22} className="text-[#34c759]" />
                    Moliya tahlili (Oxirgi oylar)
                  </h3>
                  <p className="text-[12px] text-gray-500 uppercase font-black tracking-widest mt-1">Oylik kassa va harajatlar</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                    <span className="text-[11px] font-black text-gray-500 tracking-tighter uppercase">Kirim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span className="text-[11px] font-black text-gray-500 tracking-tighter uppercase">Chiqim</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full min-h-0">
                {(loading || loadingFinance) ? (
                  <Skeleton variant="rect" width="100%" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedFinanceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#888', fontWeight: 700 }}
                        dy={15}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#888', fontWeight: 700 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '1.25rem',
                          border: 'none',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(15px)',
                          padding: '12px'
                        }}
                        labelStyle={{ fontSize: '11px', fontWeight: '900', color: '#1d1d1f', marginBottom: '8px', textTransform: 'uppercase' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 'bold', padding: '2px 0' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        animationDuration={2000}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Activity (Expanded) */}
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-[#1d1d1f] dark:text-white">
                  <Activity size={24} className="text-[#34c759]" />
                  So'nggi harakatlar
                </h3>
                <p className="text-[12px] text-gray-500 uppercase font-black tracking-widest mt-1">Tizimdagi umumiy oxirgi 10 ta harakat</p>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold text-[#007aff] px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <span>Jami: {(genStats?.activity || []).length} ta amal</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {(loading || loadingGen) ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-5 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 transition-all">
                    <Skeleton variant="rect" width="48px" height="48px" className="rounded-xl" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <Skeleton width="60%" height="16px" />
                      <Skeleton width="40%" height="12px" />
                    </div>
                  </div>
                ))
              ) : (genStats?.activity || []).length > 0 ? (genStats?.activity || []).map((act, i) => (
                <div key={i} className="flex gap-5 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-[#007aff]/40 transition-all group cursor-default hover:bg-white dark:hover:bg-white/10 hover:shadow-md">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm ${act.type === 'PAYMENT' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {act.type === 'PAYMENT' ? <Banknote size={20} /> : <UserPlus size={20} />}
                  </div>
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <div>
                      <p className="text-[14px] font-bold text-black dark:text-white group-hover:text-[#007aff] transition-colors leading-tight">{act.title}</p>
                      <p className="text-[12px] text-gray-500 font-medium opacity-80 mt-0.5">{act.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-gray-400 font-bold capitalize tabular-nums bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                        {new Date(act.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-[#007aff] transition-colors" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-40 flex flex-col items-center justify-center text-center text-gray-400 italic font-medium gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <p className="text-[13px]">Tanlangan kunda hali harakatlar mavjud emas...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Attendance Detail Modal */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title={`${formatDateLabel(selectedDate)} kutilgan davomat`}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div>
              <p className="text-[12px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">Umumiy ko'rsatkich</p>
              <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">{attStats.arrived} / {attStats.expected} <span className="text-sm font-medium ml-1">({attStats.percentage}%)</span></h3>
            </div>
            <UserCheck className="text-blue-500" size={32} />
          </div>

          <div className="space-y-2">
            {(attStats?.students || []).length > 0 ? (
              (attStats?.students || [])
                .sort((a, b) => (a.status === 'present' ? -1 : 1))
                .map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-[#007aff]/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-white/20 transition-transform group-hover:scale-110">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#007aff] transition-colors">{s.name}</p>
                        <p className="text-[11px] text-gray-500">{s.groupName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'present'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                          {s.status_display}
                        </span>
                        {(s.arrivedAt || s.leftAt) && (
                          <div className="flex flex-col items-end mr-1 tabular-nums">
                            {s.arrivedAt && <span className="text-[11px] font-black text-[#007aff]">K: {s.arrivedAt}</span>}
                            {s.leftAt && <span className="text-[11px] font-medium text-gray-400">Ch: {s.leftAt}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12 text-gray-400 italic">
                Bu kunda o'quvchilar ro'yxati bo'sh
              </div>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;