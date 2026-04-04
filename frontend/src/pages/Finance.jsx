import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  BarChart3, ArrowUpRight, ArrowDownRight, CreditCard, 
  Calendar, Plus, X, AlertCircle 
} from 'lucide-react';
import { getFinanceStats, getFinanceTransactions, getFinanceChart, addExpense } from '../services/api';
import Modal from '../components/common/Modal';

const Finance = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    totalGeneralExpense: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    amount: '',
    category: 'Ofis',
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
      setStats(statsRes.data);
      setTransactions(transRes.data);
      setChartData(chartRes.data);
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
      await addExpense({
        ...expenseFormData,
        amount: parseFloat(expenseFormData.amount)
      });
      setIsExpenseModalOpen(false);
      setExpenseFormData({
        title: '',
        amount: '',
        category: 'Ofis',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Xatolik yuzaga keldi');
    }
  };

  const statCards = [
    { type: 'INCOME', title: 'Oylik Tushum', amount: stats.totalIncome.toLocaleString(), change: '+0%', isUp: true, icon: <TrendingUp size={20} className="text-green-500" /> },
    { type: 'EXPENSE', title: 'Jami Xarajat', amount: stats.totalExpense.toLocaleString(), change: '+0%', isUp: false, icon: <TrendingDown size={20} className="text-red-500" /> },
    { title: 'Sof Foyda', amount: stats.netProfit.toLocaleString(), change: '+0%', isUp: true, icon: <DollarSign size={20} className="text-[#007aff]" /> },
    { title: 'Boshqa Xarajatlar', amount: stats.totalGeneralExpense.toLocaleString(), change: '+0%', isUp: false, icon: <PieChart size={20} className="text-orange-500" /> },
  ];

  const handleCardClick = (type) => {
    if (!type) return;
    setDetailType(type);
    setIsDataDetailModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f5f5f7] dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moliya</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Markazning moliyaviy holati va tahlili — {currentMonth}</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, i) => (
            <div 
              key={i} 
              onClick={() => handleCardClick(stat.type)}
              className={`bg-white/70 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm group hover:shadow-md transition-all ${stat.type ? 'cursor-pointer hover:border-[#007aff]/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 'bg-red-100 dark:bg-red-500/10 text-red-600'}`}>
                  {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1 tabular-nums transition-all group-hover:scale-105 origin-left flex items-baseline gap-2">
                {stat.amount} <span className="text-[13px] font-normal opacity-50 uppercase">UZS</span>
              </h3>
              {stat.type && <p className="text-[10px] text-[#007aff] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Batafsil ko'rish →</p>}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Placeholder */}
          <div className="lg:col-span-2 bg-white/70 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold">Moliyaviy tahlil (Oxirgi 6 oy)</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#007aff]"></div> Kirim
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Chiqim
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-end justify-between gap-4 pb-2">
              {chartData.map((d, i) => {
                const maxVal = Math.max(...chartData.map(x => Math.max(x.income, x.expense)));
                const hIncome = (d.income / maxVal) * 100 || 5;
                const hExpense = (d.expense / maxVal) * 100 || 5;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-[250px]">
                      <div 
                        className="w-1/3 bg-[#007aff] rounded-t-lg transition-all relative group-hover:brightness-110" 
                        style={{ height: `${hIncome}%` }}
                        title={`Kirim: ${d.income.toLocaleString()}`}
                      />
                      <div 
                        className="w-1/3 bg-red-400 rounded-t-lg transition-all relative group-hover:brightness-110" 
                        style={{ height: `${hExpense}%` }}
                        title={`Chiqim: ${d.expense.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Operations */}
          <div className="bg-white/70 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col h-[400px]">
            <h3 className="text-lg font-semibold mb-6">So'nggi operatsiyalar</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {transactions.length > 0 ? transactions.map((t, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all cursor-default group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                    t.type === 'INCOME' ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 'bg-red-100 dark:bg-red-500/10 text-red-600'
                  }`}>
                    {t.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[13px] font-semibold truncate" title={t.title}>{t.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{t.comment || t.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-[13px] font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}
                    </p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-gray-500 font-bold uppercase">{t.category}</span>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-30">
                  <BarChart3 size={40} />
                  <p className="text-[13px]">Operatsiyalar topilmadi</p>
                </div>
              )}
            </div>
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
                onChange={(e) => setExpenseFormData({...expenseFormData, title: e.target.value})}
                placeholder="Masalan: Ijara to'lovi"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Summa (UZS)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Kategoriya</label>
                <select
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({...expenseFormData, category: e.target.value})}
                >
                  <option value="Ofis">Ofis</option>
                  <option value="Bino">Bino / Ijara</option>
                  <option value="Texnika">Texnika</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Kommunal">Kommunal</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Sana</label>
              <input
                type="date"
                required
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                value={expenseFormData.date}
                onChange={(e) => setExpenseFormData({...expenseFormData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Izoh</label>
              <textarea
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all min-h-[100px]"
                value={expenseFormData.comment}
                onChange={(e) => setExpenseFormData({...expenseFormData, comment: e.target.value})}
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

        {/* DATA DETAIL MODAL (INCOME / EXPENSE) */}
        <Modal 
          isOpen={isDataDetailModalOpen} 
          onClose={() => setIsDataDetailModalOpen(false)} 
          title={detailType === 'INCOME' ? `Oylik tushumlar tafsiloti (${currentMonth})` : `Oylik xarajatlar tafsiloti (${currentMonth})`}
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.filter(t => t.type === detailType).length > 0 ? (
              transactions.filter(t => t.type === detailType).map((t, i) => (
                <div key={i} className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {t.type === 'INCOME' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-white truncate max-w-[180px]">{t.title}</p>
                      <p className="text-[10px] text-gray-500">{new Date(t.date).toLocaleDateString('uz-UZ')} — {t.comment || t.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[14px] font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.amount.toLocaleString()} UZS
                    </p>
                    <span className="text-[9px] uppercase font-bold opacity-40">{t.category}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-500">
                <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-[14px]">Ma'lumotlar topilmadi</p>
              </div>
            )}
          </div>
          <div className="mt-6">
            <button
              onClick={() => setIsDataDetailModalOpen(false)}
              className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-[14px] font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              Yopish
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
};

export default Finance;
