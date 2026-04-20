import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart as LucidePieChart,
  BarChart3, ArrowUpRight, ArrowDownRight, CreditCard,
  Calendar, Plus, X, AlertCircle, Wallet,
  Repeat, Smartphone, Search, Filter, ArrowRightLeft,
  ChevronLeft, ChevronRight, Activity, Download,
  Edit, Trash2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line
} from 'recharts';
import { 
  getFinanceStats, 
  getFinanceTransactions, 
  getFinanceChart, 
  addExpense, 
  addIncome,
  updateExpense,
  deleteExpense,
  updateIncome,
  deleteIncome,
  updatePayment,
  deletePayment,
  updateStaffPayment,
  deleteStaffPayment
} from '../services/api';
import Modal from '../components/common/Modal';
import CategorySelect from '../components/finance/CategorySelect';
import CategoryManagerModal from '../components/finance/CategoryManagerModal';

const Finance = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalStudentIncome: 0,
    totalOtherIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    totalGeneralExpense: 0,
    incomeByMethod: {},
    incomeByCategory: {},
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

  // Modals State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isStudentPaymentModalOpen, setIsStudentPaymentModalOpen] = useState(false);
  const [isStaffPaymentModalOpen, setIsStaffPaymentModalOpen] = useState(false);
  
  // Category management
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [categoryManagerType, setCategoryManagerType] = useState('INCOME');
  
  const [editingId, setEditingId] = useState(null);

  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    amount: '',
    category: '',
    paymentType: 'Naqd',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [incomeFormData, setIncomeFormData] = useState({
    title: '',
    amount: '',
    category: '',
    paymentType: 'Naqd',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [studentPaymentFormData, setStudentPaymentFormData] = useState({
    amount: '',
    paymentType: 'Naqd',
    paymentDate: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [staffPaymentFormData, setStaffPaymentFormData] = useState({
    amount: '',
    paymentType: 'Naqd',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

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
          incomeByCategory: statsRes.data.incomeByCategory || {},
          expenseByMethod: statsRes.data.expenseByMethod || {},
          expenseByCategory: statsRes.data.expenseByCategory || {},
          prevMonthStats: statsRes.data.prevMonthStats || { totalInc: 0, totalExp: 0 }
        });
      }

      setTransactions(transRes?.data || []);
      setChartData(chartRes?.data || []);
    } catch (err) {
      console.error('Error fetching finance data:', err);
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
      const data = {
        ...expenseFormData,
        amount: parseFloat(expenseFormData.amount)
      };

      if (editingId) {
        await updateExpense(editingId, data);
      } else {
        await addExpense(data);
      }
      
      setIsExpenseModalOpen(false);
      resetExpenseForm();
      fetchData();
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Xatolik yuzaga keldi');
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...incomeFormData,
        amount: parseFloat(incomeFormData.amount)
      };

      if (editingId) {
        await updateIncome(editingId, data);
      } else {
        await addIncome(data);
      }

      setIsIncomeModalOpen(false);
      resetIncomeForm();
      fetchData();
    } catch (err) {
      console.error('Error saving income:', err);
      alert('Xatolik yuzaga keldi');
    }
  };

  const handleUpdateStudentPayment = async (e) => {
    e.preventDefault();
    try {
      await updatePayment(editingId, {
        ...studentPaymentFormData,
        amount: parseFloat(studentPaymentFormData.amount)
      });
      setIsStudentPaymentModalOpen(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Xatolik yuzaga keldi');
    }
  };

  const handleUpdateStaffPayment = async (e) => {
    e.preventDefault();
    try {
      await updateStaffPayment(editingId, {
        ...staffPaymentFormData,
        amount: parseFloat(staffPaymentFormData.amount)
      });
      setIsStaffPaymentModalOpen(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Error updating staff payment:', err);
      alert('Xatolik yuzaga keldi');
    }
  };

  const handleDeleteTransaction = async (t) => {
    if (!window.confirm('Haqiqatdan ham ushbu operatsiyani o\'chirmoqchimisiz?')) return;
    
    try {
      const id = t.id.split('_')[1];
      if (t.id.startsWith('inc_')) await deletePayment(id);
      else if (t.id.startsWith('oinc_')) await deleteIncome(id);
      else if (t.id.startsWith('staff_')) await deleteStaffPayment(id);
      else if (t.id.startsWith('gen_')) await deleteExpense(id);
      
      fetchData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Xatolik yuzaga keldi');
    }
  };

  const handleEditTransaction = (t) => {
    const id = t.id.split('_')[1];
    setEditingId(id);

    if (t.id.startsWith('inc_')) {
      setStudentPaymentFormData({
        amount: t.amount,
        paymentType: t.paymentType,
        paymentDate: t.date,
        comment: t.comment || ''
      });
      setIsStudentPaymentModalOpen(true);
    } else if (t.id.startsWith('oinc_')) {
      setIncomeFormData({
        title: t.title,
        amount: t.amount,
        category: t.category,
        paymentType: t.paymentType,
        date: t.date,
        comment: t.comment || ''
      });
      setIsIncomeModalOpen(true);
    } else if (t.id.startsWith('staff_')) {
      setStaffPaymentFormData({
        amount: t.amount,
        paymentType: t.paymentType,
        date: t.date,
        comment: t.comment || ''
      });
      setIsStaffPaymentModalOpen(true);
    } else if (t.id.startsWith('gen_')) {
      setExpenseFormData({
        title: t.title,
        amount: t.amount,
        category: t.category,
        paymentType: t.paymentType,
        date: t.date,
        comment: t.comment || ''
      });
      setIsExpenseModalOpen(true);
    }
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      title: '',
      amount: '',
      category: '',
      paymentType: 'Naqd',
      date: new Date().toISOString().split('T')[0],
      comment: ''
    });
    setEditingId(null);
  };

  const resetIncomeForm = () => {
    setIncomeFormData({
      title: '',
      amount: '',
      category: '',
      paymentType: 'Naqd',
      date: new Date().toISOString().split('T')[0],
      comment: ''
    });
    setEditingId(null);
  };

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      if (!t) return false;
      const matchesType = filterType === 'ALL' || t.type === filterType;
      const matchesMethod = filterMethod === 'ALL' || t.paymentType === filterMethod;
      const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.comment && t.comment.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesMethod && matchesSearch;
    });
  }, [transactions, filterType, filterMethod, searchTerm]);

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

  const COLORS = ['#007aff', '#ff9500', '#34c759', '#af52de', '#ff3b30', '#5856d6'];

  const formattedMonth = new Date(currentMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

  const StatCard = ({ title, value, icon: Icon, color, trendValue, subLabel }) => {
    const colorMap = {
      blue: 'text-[#007aff] bg-[#007aff]/10',
      green: 'text-[#34c759] bg-[#34c759]/10',
      red: 'text-[#ff3b30] bg-[#ff3b30]/10',
      orange: 'text-[#ff9500] bg-[#ff9500]/10',
      purple: 'text-[#af52de] bg-[#af52de]/10'
    };

    return (
      <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 transition-all duration-300 group hover:-translate-y-1 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight tabular-nums">
              {(value || 0).toLocaleString()} <span className="text-[12px] font-medium opacity-50 uppercase">UZS</span>
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorMap[color]}`}>
            <Icon size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-white/5">
          <div className="flex items-center gap-2">
            {trendValue !== undefined && trendValue !== 0 ? (
              <div className={`flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${Number(trendValue) >= 0 ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'}`}>
                {Number(trendValue) >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(trendValue)}%
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            )}
            <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
              {subLabel || (trendValue !== undefined ? "O'tgan oyga nisbatan" : '')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">

      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 lg:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4 z-20 sticky top-0">
        
        {/* Title Area */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="p-1.5 bg-[#007aff] text-white rounded-md shadow-sm">
            <DollarSign size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Moliya</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Balans va tushumlar tahlili</p>
          </div>
        </div>

        {/* Center/Right Actions Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          
          {/* Month Selector */}
          <div className="flex items-center bg-white/60 dark:bg-black/30 rounded-md border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md px-1 py-1">
             <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent border-none text-[12px] font-medium px-3 py-1 outline-none text-[#1d1d1f] dark:text-[#f5f5f7] cursor-pointer"
            />
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-white/10 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { resetIncomeForm(); setIsIncomeModalOpen(true); }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600"
            >
              <ArrowUpRight size={14} />
              <span>Kirim</span>
            </button>
            <button
              onClick={() => { resetExpenseForm(); setIsExpenseModalOpen(true); }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all shadow-sm bg-red-500 hover:bg-red-600 text-white border border-red-600"
            >
              <ArrowDownRight size={14} />
              <span>Chiqim</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6">
        <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-10">

          {/* Core Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Oylik Tushum"
              value={stats.totalIncome}
              icon={TrendingUp}
              color="green"
              trendValue={getGrowth(stats.totalIncome, stats.prevMonthStats.totalInc)}
              subLabel={`Talaba: ${stats.totalStudentIncome?.toLocaleString()} | Boshqa: ${stats.totalOtherIncome?.toLocaleString()}`}
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
              subLabel={`${stats.totalIncome > 0 ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(1) : 0}% rentabellik`}
            />
            <StatCard
              title="Zaxira / Boshqa"
              value={stats.totalGeneralExpense}
              icon={LucidePieChart}
              color="orange"
              subLabel="Umumiy xarajatlar"
            />
          </div>

          {/* Detailed Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Financial Dynamics Chart */}
            <div className="lg:col-span-2 bg-white/60 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity size={20} className="text-[#007aff]" />
                    Moliyaviy Dinamika
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-1">Yillik tushum va chiqim grafigi</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#007aff]" />
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight">Kirim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff3b30]" />
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight">Chiqim</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData || []}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
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
                      tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#007aff" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                    <Bar dataKey="expense" fill="#ff3b30" radius={[10, 10, 0, 0]} barSize={20} opacity={0.6} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Income Distribution */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col">
              <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
                <ArrowUpRight size={18} className="text-[#34c759]" />
                Daromadlar taqsimoti
              </h3>
              
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={Object.keys(stats?.incomeByCategory || {}).map(name => ({ name, value: stats.incomeByCategory[name] }))}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.keys(stats?.incomeByCategory || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-6 overflow-y-auto custom-scrollbar flex-1 max-h-[150px] pr-2">
                {Object.keys(stats?.incomeByCategory || {}).map((name, index) => (
                  <div key={name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                       <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium group-hover:text-[#1d1d1f] dark:group-hover:text-white transition-colors">{name}</span>
                    </div>
                    <span className="text-[10px] font-bold tabular-nums">
                       {stats.totalIncome > 0 ? ((stats.incomeByCategory[name] / stats.totalIncome) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Distribution */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col">
              <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
                <LucidePieChart size={18} className="text-[#af52de]" />
                Xarajatlar taqsimoti
              </h3>
              
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={Object.keys(stats?.expenseByCategory || {}).map(name => ({ name, value: stats.expenseByCategory[name] }))}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.keys(stats?.expenseByCategory || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-6 overflow-y-auto custom-scrollbar flex-1 max-h-[150px] pr-2">
                {Object.keys(stats?.expenseByCategory || {}).map((name, index) => (
                  <div key={name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                       <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium group-hover:text-[#1d1d1f] dark:group-hover:text-white transition-colors">{name}</span>
                    </div>
                    <span className="text-[10px] font-bold tabular-nums">
                       {stats.totalExpense > 0 ? ((stats.expenseByCategory[name] / stats.totalExpense) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Income Card */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[15px] font-bold flex items-center gap-2 uppercase tracking-tight">
                  <ArrowUpRight size={18} className="text-[#34c759]" />
                  Kirim (To'lov turlari)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['Naqd', 'Karta', 'O\'tkazma', 'Click/Payme'].map(method => (
                  <div key={method} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-[#007aff]/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      {getPaymentIcon(method, 16)}
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{method === 'Karta' ? 'Plastik' : method}</span>
                    </div>
                    <p className="text-[18px] font-bold tabular-nums tracking-tighter truncate">
                      {(stats.incomeByMethod?.[method] || 0).toLocaleString()}
                    </p>
                    <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-[#34c759] transition-all duration-1000"
                        style={{ width: `${(stats.incomeByMethod?.[method] || 0) / (stats.totalIncome || 1) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Card */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[15px] font-bold flex items-center gap-2 uppercase tracking-tight">
                  <ArrowDownRight size={18} className="text-[#ff3b30]" />
                  Chiqim (To'lov turlari)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['Naqd', 'Karta', 'O\'tkazma', 'Click/Payme'].map(method => (
                  <div key={method} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-[#ff3b30]/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      {getPaymentIcon(method, 16)}
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{method}</span>
                    </div>
                    <p className="text-[18px] font-bold tabular-nums tracking-tighter truncate">
                      {(stats.expenseByMethod?.[method] || 0).toLocaleString()}
                    </p>
                    <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-[#ff3b30] transition-all duration-1000"
                        style={{ width: `${(stats.expenseByMethod?.[method] || 0) / (stats.totalExpense || 1) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Table Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <ArrowRightLeft className="text-[#007aff]" size={20} />
                 Operatsiyalar logi
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                   <input
                    type="text"
                    placeholder="Qidirish (Nomi, izoh...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[12px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all backdrop-blur-md"
                  />
                </div>
                
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md px-3 py-1.5 text-[12px] outline-none backdrop-blur-md cursor-pointer"
                >
                  <option value="ALL">Barcha turlar</option>
                  <option value="INCOME">Kirim</option>
                  <option value="EXPENSE">Chiqim</option>
                </select>

                <select 
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                   className="bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md px-3 py-1.5 text-[12px] outline-none backdrop-blur-md cursor-pointer"
                >
                  <option value="ALL">To'lov usuli</option>
                  <option value="Naqd">Naqd</option>
                  <option value="Karta">Plastik</option>
                  <option value="O'tkazma">O'tkazma</option>
                  <option value="Click/Payme">Click/Payme</option>
                </select>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f2f2f7] dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl z-10">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Tur</th>
                      <th className="px-5 py-2.5 font-medium">Sana</th>
                      <th className="px-5 py-2.5 font-medium">Operatsiya / Izoh</th>
                      <th className="px-5 py-2.5 font-medium">Metod</th>
                      <th className="px-5 py-2.5 font-medium">Kategoriya</th>
                      <th className="px-5 py-2.5 font-medium text-right">Summa (UZS)</th>
                      <th className="px-5 py-2.5 font-medium text-center">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-20 text-center">
                           <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="w-6 h-6 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin mb-3"></div>
                            <span className="text-[12px] font-medium tracking-tight">Ma'lumotlar tahlil qilinmoqda...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((t, i) => (
                        <tr key={i} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-default">
                          <td className="px-5 py-3.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'INCOME' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'}`}>
                              {t.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-gray-500 whitespace-nowrap">
                            {new Date(t.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                               <span className="font-bold text-[#1d1d1f] dark:text-white group-hover:text-[#007aff] transition-colors">{t.title}</span>
                               <span className="text-[11px] text-gray-400 max-w-[250px] truncate">{t.comment || '-'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                              {getPaymentIcon(t.paymentType, 12)}
                              <span className="text-[11px] font-medium">{t.paymentType || 'Naqd'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                              {t.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold tabular-nums">
                             <span className={t.type === 'INCOME' ? 'text-[#34c759]' : 'text-[#ff3b30]'}>
                               {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                             </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                               <button 
                                onClick={() => handleEditTransaction(t)}
                                className="p-1.5 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors"
                               >
                                 <Edit size={14} />
                               </button>
                               <button 
                                onClick={() => handleDeleteTransaction(t)}
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-5 py-24 text-center">
                          <div className="flex flex-col items-center justify-center grayscale opacity-50">
                            <Download size={40} className="text-gray-400 mb-4" />
                            <p className="text-[14px] font-medium text-gray-600">Mos ma'lumotlar topilmadi</p>
                            <p className="text-[12px] text-gray-400 mt-1">Filtr parametrlarini o'zgartirib ko'ring</p>
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

      {/* ADD INCOME MODAL */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title={editingId ? "Daromadni tahrirlash" : "Yangi daromad"}
      >
        <form onSubmit={handleAddIncome} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">DAROMAD NOMI / MANBAI</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#34c759]/50 outline-none transition-all shadow-inner"
                value={incomeFormData.title}
                onChange={(e) => setIncomeFormData({ ...incomeFormData, title: e.target.value })}
                placeholder="Masalan: Grant mablag'i"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">KATEGORIYA</label>
                <CategorySelect
                  type="INCOME"
                  value={incomeFormData.category}
                  onChange={(name, id) => setIncomeFormData({ ...incomeFormData, category: name, categoryId: id })}
                  onManage={() => {
                    setCategoryManagerType('INCOME');
                    setIsIncomeModalOpen(false);
                    setIsCategoryManagerOpen(true);
                  }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">TO'LOV TURI</label>
                <select
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#34c759]/50 outline-none transition-all shadow-inner"
                  value={incomeFormData.paymentType}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, paymentType: e.target.value })}
                >
                  <option value="Naqd">Naqd</option>
                  <option value="Karta">Karta</option>
                  <option value="O'tkazma">O'tkazma</option>
                  <option value="Click/Payme">Click/Payme</option>
                </select>
              </div>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SUMMA (UZS)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[14px] font-bold text-[#34c759] outline-none focus:ring-2 focus:ring-[#34c759]/50 transition-all"
                  value={incomeFormData.amount}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SANA</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  value={incomeFormData.date}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">IZOH / KOMMENTARIYA</label>
              <textarea
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#34c759]/50 outline-none transition-all shadow-inner min-h-[80px] resize-none"
                value={incomeFormData.comment}
                onChange={(e) => setIncomeFormData({ ...incomeFormData, comment: e.target.value })}
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(false)}
              className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-[13px] font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md shadow-sm border border-emerald-600 transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD EXPENSE MODAL */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title={editingId ? "Xarajatni tahrirlash" : "Yangi xarajat"}
      >
        <form onSubmit={handleAddExpense} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">MAQSAD / NOMI</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                value={expenseFormData.title}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, title: e.target.value })}
                placeholder="Masalan: Ijara to'lovi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">KATEGORIYA</label>
                <CategorySelect
                  type="EXPENSE"
                  value={expenseFormData.category}
                  onChange={(name, id) => setExpenseFormData({ ...expenseFormData, category: name, categoryId: id })}
                  onManage={() => {
                    setCategoryManagerType('EXPENSE');
                    setIsExpenseModalOpen(false);
                    setIsCategoryManagerOpen(true);
                  }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">TO'LOV TURI</label>
                <select
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
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


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SUMMA (UZS)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[14px] font-bold text-[#ff3b30] outline-none focus:ring-2 focus:ring-[#ff3b30]/50 transition-all"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SANA</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">IZOH / KOMMENTARIYA</label>
              <textarea
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner min-h-[80px] resize-none"
                value={expenseFormData.comment}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, comment: e.target.value })}
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
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

      {/* STUDENT PAYMENT MODAL */}
      <Modal
        isOpen={isStudentPaymentModalOpen}
        onClose={() => setIsStudentPaymentModalOpen(false)}
        title="To'lovni tahrirlash"
      >
        <form onSubmit={handleUpdateStudentPayment} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">TO'LOV TURI</label>
                <select
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  value={studentPaymentFormData.paymentType}
                  onChange={(e) => setStudentPaymentFormData({ ...studentPaymentFormData, paymentType: e.target.value })}
                >
                  <option value="Naqd">Naqd</option>
                  <option value="Karta">Karta</option>
                  <option value="O'tkazma">O'tkazma</option>
                  <option value="Click/Payme">Click/Payme</option>
                </select>
              </div>
               <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SUMMA (UZS)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[14px] font-bold text-[#34c759] outline-none focus:ring-2 focus:ring-[#34c759]/50 transition-all"
                  value={studentPaymentFormData.amount}
                  onChange={(e) => setStudentPaymentFormData({ ...studentPaymentFormData, amount: e.target.value })}
                />
              </div>
          </div>
          <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SANA</label>
              <input
                type="date"
                required
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                value={studentPaymentFormData.paymentDate}
                onChange={(e) => setStudentPaymentFormData({ ...studentPaymentFormData, paymentDate: e.target.value })}
              />
          </div>
          <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">IZOH</label>
              <textarea
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner min-h-[80px] resize-none"
                value={studentPaymentFormData.comment}
                onChange={(e) => setStudentPaymentFormData({ ...studentPaymentFormData, comment: e.target.value })}
              />
          </div>
          <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsStudentPaymentModalOpen(false)}
              className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 rounded-md transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-[13px] font-medium bg-[#007aff] text-white rounded-md shadow-sm transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* STAFF PAYMENT MODAL */}
      <Modal
        isOpen={isStaffPaymentModalOpen}
        onClose={() => setIsStaffPaymentModalOpen(false)}
        title="Maosh to'lovini tahrirlash"
      >
        <form onSubmit={handleUpdateStaffPayment} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">TO'LOV TURI</label>
                <select
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  value={staffPaymentFormData.paymentType}
                  onChange={(e) => setStaffPaymentFormData({ ...staffPaymentFormData, paymentType: e.target.value })}
                >
                  <option value="Naqd">Naqd</option>
                  <option value="Karta">Karta</option>
                  <option value="O'tkazma">O'tkazma</option>
                  <option value="Click/Payme">Click/Payme</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SUMMA (UZS)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[14px] font-bold text-[#ff3b30] outline-none focus:ring-2 focus:ring-[#ff3b30]/50 transition-all"
                  value={staffPaymentFormData.amount}
                  onChange={(e) => setStaffPaymentFormData({ ...staffPaymentFormData, amount: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">SANA</label>
              <input
                type="date"
                required
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                value={staffPaymentFormData.date}
                onChange={(e) => setStaffPaymentFormData({ ...staffPaymentFormData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 tracking-wider uppercase">IZOH</label>
              <textarea
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner min-h-[80px] resize-none"
                value={staffPaymentFormData.comment}
                onChange={(e) => setStaffPaymentFormData({ ...staffPaymentFormData, comment: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsStaffPaymentModalOpen(false)}
                className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 rounded-md transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-[13px] font-medium bg-[#ff3b30] text-white rounded-md shadow-sm transition-colors"
              >
                Saqlash
              </button>
            </div>
        </form>
      </Modal>

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        type={categoryManagerType}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.2);
          border-radius: 20px;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Finance;