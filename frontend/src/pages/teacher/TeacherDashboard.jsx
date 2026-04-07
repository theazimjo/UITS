import React, { useState, useEffect, useMemo } from 'react';
import { getTeacherDashboard } from '../../services/api';
import { 
  Users, BookOpen, ClipboardCheck, TrendingUp, Clock, Loader2, 
  LayoutDashboard, RefreshCw, ChevronLeft, ChevronRight,
  TrendingDown, PieChart as PieIcon, BarChart as BarIcon, 
  Layers, UserCheck, Banknote
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchDashboard();
  }, [currentMonth]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getTeacherDashboard(currentMonth);
      setData(res.data || null);
    } catch (err) {
      console.error('Teacher dashboard error:', err);
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

  const stats = useMemo(() => [
    { label: "Faol Guruhlar", value: data?.totalGroups || 0, icon: <Layers size={20} />, color: 'emerald', sub: "O'quv jarayonidagi guruhlar" },
    { label: "Jami Talabalar", value: data?.totalStudents || 0, icon: <Users size={20} />, color: 'blue', sub: "Faol o'quvchilar tarkibi" },
    { label: "Kutilgan Tushum", value: (data?.expectedIncome || 0).toLocaleString(), unit: "so'm", icon: <ClipboardCheck size={20} />, color: 'amber', sub: "To'liq darslar bo'yicha" },
    { label: "Oylik Tushum", value: (data?.monthlyIncome || 0).toLocaleString(), unit: "so'm", icon: <TrendingUp size={20} />, color: 'violet', sub: "Tasdiqlangan to'lovlar" },
  ], [data]);

  const colorStyles = {
    blue: { bg: 'bg-[#007aff]/10', text: 'text-[#007aff]', border: 'group-hover:border-[#007aff]/30' },
    emerald: { bg: 'bg-[#34c759]/10', text: 'text-[#34c759]', border: 'group-hover:border-[#34c759]/30' },
    amber: { bg: 'bg-[#ff9500]/10', text: 'text-[#ff9500]', border: 'group-hover:border-[#ff9500]/30' },
    violet: { bg: 'bg-[#af52de]/10', text: 'text-[#af52de]', border: 'group-hover:border-[#af52de]/30' },
  };

  const PIE_COLORS = ['#007aff', '#34c759', '#ff9500', '#af52de', '#5856d6', '#ff2d55'];

  // Safe checks for arrays
  const financialTrend = data?.financialTrend || [];
  const studentDistribution = data?.studentDistribution || [];

  return (
    <div className="h-full w-full overflow-hidden bg-[#f5f5f7] dark:bg-[#1d1d1f] flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] scroll-smooth">
      
      {/* macOS Toolbar */}
      <div className="h-14 border-b border-gray-200/50 dark:border-white/10 flex items-center px-6 justify-between shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#007aff] text-white rounded-lg shadow-sm">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h2 className="text-[11px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none uppercase opacity-70">Analytics</h2>
            <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] mt-1 tracking-tight">Umumiy Ko'rsatkichlar</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center bg-gray-200/50 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
              <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-gray-500">
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-[12px] font-bold text-[#1d1d1f] dark:text-white min-w-[120px] text-center">
                {new Date(currentMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-gray-500">
                <ChevronRight size={16} />
              </button>
           </div>
           <div className="h-6 w-px bg-gray-300 dark:bg-white/10 hidden sm:block" />
           <button 
             onClick={fetchDashboard}
             className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
            >
             <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-10 text-left">
          
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
               <Loader2 className="w-8 h-8 text-[#007aff] animate-spin mb-4" />
               <p className="text-[13px] font-medium text-gray-500">Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`bg-white/70 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 transition-all duration-300 group hover:-translate-y-1 shadow-sm ${colorStyles[stat.color].border}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-black dark:text-white tracking-tight tabular-nums">
                          {stat.value} {stat.unit && <span className="text-xs font-medium text-gray-400 ml-1">{stat.unit}</span>}
                        </h3>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${colorStyles[stat.color].bg} ${colorStyles[stat.color].text}`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200/50 dark:border-white/5">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500/10 text-gray-400">
                          <TrendingUp size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 italic">
                          {stat.sub}
                        </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-white/70 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black flex items-center gap-2 text-[#1d1d1f] dark:text-white uppercase tracking-tighter">
                        <BarIcon size={20} className="text-[#34c759]" />
                        Moliya dinamikasi
                      </h3>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">So'nggi 6 oylik o'sish</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.06} />
                        <XAxis 
                           dataKey="month" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 10, fill: '#888', fontWeight: 800 }} 
                           tickFormatter={(m) => m ? new Date(m + '-01').toLocaleDateString('uz-UZ', { month: 'short' }) : ''}
                           dy={10}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888', fontWeight: 800 }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,122,255,0.05)' }}
                          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                          labelStyle={{ fontSize: '11px', fontWeight: '900', color: '#1d1d1f', marginBottom: '4px' }}
                          itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                          formatter={(v) => Number(v || 0).toLocaleString() + ' so\'m'}
                        />
                        <Bar dataKey="income" fill="#007aff" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-white/70 dark:bg-black/20 backdrop-blur-md p-8 rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm flex flex-col h-[400px]">
                   <div className="mb-4">
                      <h3 className="text-lg font-black flex items-center gap-2 text-[#1d1d1f] dark:text-white uppercase tracking-tighter">
                        <PieIcon size={20} className="text-[#af52de]" />
                        Guruhlar tarkibi
                      </h3>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">Talabalar soni bo'yicha</p>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={studentDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {studentDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                               contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                               labelStyle={{ display: 'none' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '800', paddingTop: '20px' }} />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
