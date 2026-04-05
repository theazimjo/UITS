import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart,
  BarChart3, ArrowUpRight, ArrowDownRight, CreditCard,
  Calendar, Plus, X, AlertCircle, Wallet,
  Repeat, Smartphone, Search, Filter, ArrowRightLeft
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line
} from 'recharts';
import { getFinanceStats, getFinanceTransactions, getFinanceChart, addExpense } from '../services/api';
import Modal from '../components/common/Modal';

const Finance = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    totalGeneralExpense: 0,
    incomeByMethod: {},
    expenseByMethod: {},
    expenseByCategory: {},
    prevMonthStats: { totalInc: 0, totalExp: 0 }
  });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  // Filtering states
  const [filterType, setFilterType] = useState('ALL'); // ALL, INCOME, EXPENSE
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    amount: '',
    category: 'Ofis',
    customCategory: '',
    paymentType: 'Naqd',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  // Detail Modal State
  const [isDataDetailModalOpen, setIsDataDetailModalOpen] = useState(false);
  const [detailType, setDetailType] = useState('INCOME'); // INCOME or EXPENSE

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, transRes, chartRes] = await Promise.all([
        getFinanceStats(currentMonth),
        getFinanceTransactions(currentMonth),
        getFinanceChart()
      ]);

      if (statsRes?.data) {
        setStats({
          ...statsRes.data,
          incomeByMethod: statsRes.data.incomeByMethod || {},
          expenseByMethod: statsRes.data.expenseByMethod || {},
          expenseByCategory: statsRes.data.expenseByCategory || {},
          prevMonthStats: statsRes.data.prevMonthStats || { totalInc: 0, totalExp: 0 }
        });
      }

      setTransactions(transRes?.data || []);
      setChartData(chartRes?.data || []);
    } catch (err) {
      console.error('Error fetching finance data:', err);
      if (err.response?.status === 401) {
        // Silent fail or alert is already there
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense({
        ...expenseFormData,
        category: expenseFormData.category === 'Boshqa' ? expenseFormData.customCategory : expenseFormData.category,
        amount: parseFloat(expenseFormData.amount)
      });
      setIsExpenseModalOpen(false);
      setExpenseFormData({
        title: '',
        amount: '',
        category: 'Ofis',
        customCategory: '',
        paymentType: 'Naqd',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Xatolik yuzaga keldi');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesMethod = filterMethod === 'ALL' || t.paymentType === filterMethod;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.comment && t.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesMethod && matchesSearch;
  });

  const getGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const getPaymentIcon = (type, size = 14) => {
    switch (type) {
      case 'Naqd': return <Wallet size={size} className="text-amber-500" />;
      case 'Karta':
      case 'Plastik': return <CreditCard size={size} className="text-blue-500" />;
      case 'O\'tkazma': return <ArrowRightLeft size={size} className="text-purple-500" />;
      case 'Click/Payme': return <Smartphone size={size} className="text-cyan-500" />;
      default: return <Wallet size={size} className="text-gray-400" />;
    }
  };

  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884d8', '#ffc658'];

  const StatCard = ({ title, value, icon: Icon, color, trendValue }) => (
    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-lg shadow-black/5 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500 shadow-inner`}>
          <Icon size={24} />
        </div>
        {trendValue !== undefined && trendValue !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black ${Number(trendValue) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {Number(trendValue) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
      <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest opacity-60">{title}</p>
      <h3 className="text-3xl font-black mt-2 tracking-tighter tabular-nums drop-shadow-sm">{(value || 0).toLocaleString()} <span className="text-[14px] font-medium opacity-50">UZS</span></h3>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f5f5f7] dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moliya Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ko'rsatkichlar va operatsiyalar tahlili — {currentMonth}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-[13px] outline-none"
            />
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 bg-[#007aff] text-white rounded-xl text-[13px] font-medium hover:bg-[#007aff]/90 transition-all shadow-md shadow-[#007aff]/20 flex items-center gap-2"
            >
              <Plus size={16} />
              Xarajat qo'shish
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Oylik Tushum"
            value={stats.totalIncome}
            icon={TrendingUp}
            color="green"
            trendValue={getGrowth(stats.totalIncome, stats.prevMonthStats.totalInc)}
          />
          <StatCard
            title="Jami Xarajat"
            value={stats.totalExpense}
            icon={TrendingDown}
            color="red"
            trendValue={getGrowth(stats.totalExpense, stats.prevMonthStats.totalExp)}
          />
          <StatCard
            title="Sof Foyda"
            value={stats.netProfit}
            icon={DollarSign}
            color="blue"
          />
          <StatCard
            title="Boshqa Chiqimlar"
            value={stats.totalGeneralExpense}
            icon={PieChart}
            color="orange"
          />
        </div>

        {/* Detailed Payment Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INCOME BREAKDOWN */}
          <div className="bg-white/70 dark:bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                  <ArrowUpRight size={18} className="text-green-600" />
                </div>
                Kirim: To'lov turlari bo'yicha
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Naqd', 'Karta', 'O\'tkazma', 'Click/Payme'].map(method => (
                <div key={method} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-[#007aff]/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    {getPaymentIcon(method, 16)}
                    <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">{method === 'Karta' ? 'Plastik' : method}</span>
                  </div>
                  <p className="text-xl font-black tabular-nums transition-transform group-hover:translate-x-1 lg:text-2xl">
                    {(stats.incomeByMethod?.[method] || 0).toLocaleString()}
                  </p>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000"
                      style={{ width: `${(stats.incomeByMethod?.[method] || 0) / (stats.totalIncome || 1) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EXPENSE BREAKDOWN */}
          <div className="bg-white/70 dark:bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight size={18} className="text-red-600" />
                </div>
                Chiqim: To'lov turlari bo'yicha
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Naqd', 'Karta', 'O\'tkazma', 'Click/Payme'].map(method => (
                <div key={method} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-red-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    {getPaymentIcon(method, 16)}
                    <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">{method}</span>
                  </div>
                  <p className="text-xl font-black tabular-nums transition-transform group-hover:translate-x-1 lg:text-2xl">
                    {(stats.expenseByMethod?.[method] || 0).toLocaleString()}
                  </p>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-1000"
                      style={{ width: `${(stats.expenseByMethod?.[method] || 0) / (stats.totalExpense || 1) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Trend Line Chart */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight">Moliyaviy Dinamika</h3>
                <p className="text-sm text-gray-400 mt-1">Daromad va xarajatlar tahlili</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#007aff]" />
                  <span className="text-[11px] font-black text-gray-500 uppercase">Kirim</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-[11px] font-black text-gray-500 uppercase">Chiqim</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007aff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#007aff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 700 }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#007aff" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
                  <Bar dataKey="expense" fill="#f87171" radius={[10, 10, 0, 0]} barSize={20} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Distribution Pie Chart */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-sm flex flex-col">
            <h3 className="text-xl font-black tracking-tight mb-2">Xarajatlar Taqsimoti</h3>
            <p className="text-sm text-gray-400 mb-8 lowercase">kategoriyalar bo'yicha</p>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={Object.keys(stats.expenseByCategory).map(name => ({ name, value: stats.expenseByCategory[name] }))}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.keys(stats.expenseByCategory).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {Object.keys(stats.expenseByCategory).slice(0, 4).map((name, index) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[11px] font-bold text-gray-500 truncate">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdowns Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INCOME BREAKDOWN */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <ArrowUpRight size={20} className="text-green-500" />
                </div>
                Kirim: To'lov turlari
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Naqd', 'Karta', 'O\'tkazma', 'Click/Payme'].map(method => (
                <div key={method} className="p-5 rounded-3xl bg-white/50 dark:bg-white/5 border border-white dark:border-white/5 group hover:border-[#007aff]/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest">{method === 'Karta' ? 'Plastik' : method}</span>
                  </div>
                  <p className="text-xl font-black tabular-nums tracking-tighter">
                    {(stats.incomeByMethod?.[method] || 0).toLocaleString()}
                  </p>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-[#007aff] transition-all duration-1000"
                      style={{ width: `${(stats.incomeByMethod?.[method] || 0) / (stats.totalIncome || 1) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EXPENSE BREAKDOWN */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight size={20} className="text-red-600" />
                </div>
                Chiqim: To'lov turlari
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Naqd', 'Karta', 'O\'tkazma', 'Click/Payme'].map(method => (
                <div key={method} className="p-5 rounded-3xl bg-white/50 dark:bg-white/5 border border-white dark:border-white/5 group hover:border-red-500/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest">{method}</span>
                  </div>
                  <p className="text-xl font-black tabular-nums tracking-tighter">
                    {(stats.expenseByMethod?.[method] || 0).toLocaleString()}
                  </p>
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-1000"
                      style={{ width: `${(stats.expenseByMethod?.[method] || 0) / (stats.totalExpense || 1) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Operations Widget (New) */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <ArrowRightLeft className="text-[#007aff]" size={20} />
                Oxirgi Harakatlar
              </h3>
              <button
                onClick={() => document.getElementById('full-transactions-list')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[11px] font-black text-[#007aff] hover:underline uppercase tracking-tighter"
              >
                Barchasini ko'rish
              </button>
            </div>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-white/50 dark:bg-white/5 border border-white dark:border-white/5 hover:border-[#007aff]/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {t.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-black tracking-tight">{t.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">{t.category}</p>
                    </div>
                  </div>
                  <p className={`text-[14px] font-black tabular-nums ${t.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-gray-400 italic py-8">Harakatlar mavjud emas...</p>}
            </div>
          </div>

          {/* Quick Stats / Actions (New) */}
          <div className="bg-gradient-to-br from-[#007aff] to-[#0051af] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#007aff]/30 relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            <h3 className="text-2xl font-black tracking-tight mb-2">Tezkor Xulosalar</h3>
            <p className="text-white/60 text-sm mb-8">Oy yakuniga ko'ra asosiy ko'rsatkichlar</p>

            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                  <p className="text-[11px] font-black uppercase opacity-60">Sof Foyda</p>
                  <p className="text-2xl font-black">{(stats.netProfit / (stats.totalIncome || 1) * 100).toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase opacity-60">O'rtacha Daromad</p>
                  <p className="text-xl font-bold">{(stats.totalIncome / (transactions.filter(t => t.type === 'INCOME').length || 1)).toLocaleString()} <span className="text-[10px]">UZS</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FULL TRANSACTIONS LIST SECTION */}
        <div id="full-transactions-list" className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-sm overflow-hidden mt-12">
          <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRightLeft className="text-[#007aff]" size={20} />
                Barcha operatsiyalar
              </h3>
              <p className="text-xs text-gray-500 mt-1">{filteredTransactions.length} ta operatsiya topildi</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007aff] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-[13px] outline-none focus:border-[#007aff] w-full md:w-[200px]"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-[13px] outline-none"
              >
                <option value="ALL">Barchasi</option>
                <option value="INCOME">Kirim</option>
                <option value="EXPENSE">Chiqim</option>
              </select>

              {/* Method Filter */}
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-[13px] outline-none"
              >
                <option value="ALL">To'lov usuli</option>
                <option value="Naqd">Naqd</option>
                <option value="Karta">Plastik</option>
                <option value="O'tkazma">O'tkazma</option>
                <option value="Click/Payme">Click/Payme</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4">Turi</th>
                  <th className="px-6 py-4">Sana</th>
                  <th className="px-6 py-4">Nomi & Izoh</th>
                  <th className="px-6 py-4 text-center">Usul</th>
                  <th className="px-6 py-4">Kategoriya</th>
                  <th className="px-6 py-4 text-right">Summa (UZS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredTransactions.length > 0 ? filteredTransactions.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all text-[13px] group">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 'bg-red-100 dark:bg-red-500/10 text-red-600'}`}>
                        {t.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 tabular-nums">
                      {new Date(t.date).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1d1d1f] dark:text-white">{t.title}</span>
                        <span className="text-[11px] text-gray-500 truncate max-w-[200px]">{t.comment || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 transition-transform group-hover:scale-105">
                          {getPaymentIcon(t.paymentType)}
                          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{t.paymentType || 'Naqd'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded shadow-sm">{t.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[15px] font-black tabular-nums ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">Ma'lumotlar topilmadi...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD EXPENSE MODAL */}
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title="Xarajat qo'shish"
        >
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Xarajat nomi</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                value={expenseFormData.title}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, title: e.target.value })}
                placeholder="Masalan: Ijara to'lovi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Kategoriya</label>
                <select
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                >
                  <option value="Ofis">Ofis</option>
                  <option value="Bino">Bino / Ijara</option>
                  <option value="Texnika">Texnika</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Kommunal">Kommunal</option>
                  <option value="Oylik">Oylik (Maosh)</option>
                  <option value="Boshqa">Boshqa...</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">To'lov turi</label>
                <select
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                  value={expenseFormData.paymentType}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentType: e.target.value })}
                >
                  <option value="Naqd">Naqd</option>
                  <option value="Karta">Karta</option>
                  <option value="O'tkazma">O'tkazma</option>
                  <option value="Click/Payme">Click/Payme</option>
                </select>
              </div>
            </div>

            {expenseFormData.category === 'Boshqa' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Yangi kategoriya nomi</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none border-[#007aff] shadow-sm"
                  value={expenseFormData.customCategory}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, customCategory: e.target.value })}
                  placeholder="Kategoriya nomini yozing..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Summa (UZS)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Sana</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Izoh</label>
              <textarea
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all min-h-[100px]"
                value={expenseFormData.comment}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, comment: e.target.value })}
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-xl text-[14px] font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-[#007aff] text-white rounded-xl text-[14px] font-bold hover:bg-[#007aff]/90 transition-all shadow-lg shadow-[#007aff]/20"
              >
                Xarajatni saqlash
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </div>
  );
};

export default Finance;