import React, { useState, useEffect } from 'react';
import { getTeacherDashboard } from '../../services/api';
import { Users, BookOpen, ClipboardCheck, TrendingUp, Clock, Loader2 } from 'lucide-react';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getTeacherDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Teacher dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  const stats = [
    { label: "Faol Guruhlar", value: data?.totalGroups || 0, icon: <BookOpen size={22} />, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { label: "Jami Talabalar", value: data?.totalStudents || 0, icon: <Users size={22} />, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
    { label: "Bugungi Kutilgan", value: data?.todayExpected || 0, icon: <ClipboardCheck size={22} />, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { label: "Oylik Tushum", value: (data?.monthlyIncome || 0).toLocaleString() + " so'm", icon: <TrendingUp size={22} />, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20' },
  ];

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      {/* Toolbar */}
      <div className="min-h-[56px] flex items-center px-6 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm">
            <ClipboardCheck size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">O'qituvchi Paneli</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Salom! Bugun {data?.todayGroupsCount || 0} ta darsing bor</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 p-6 shadow-xl ${stat.shadow} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-[28px] font-black text-[#1d1d1f] dark:text-white leading-none">{stat.value}</p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-2 font-semibold uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Groups */}
        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 p-6 shadow-sm">
          <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white mb-5 flex items-center gap-2">
            <Clock size={18} className="text-emerald-500" /> Guruhlarim
          </h3>
          <div className="space-y-3">
            {data?.groups?.length > 0 ? data.groups.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">{g.name}</p>
                    <p className="text-[11px] text-gray-500">{g.courseName || 'Kurs belgilanmagan'} • {g.days?.join(', ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">{g.studentCount} talaba</p>
                  <p className="text-[11px] text-gray-400">{g.startTime} - {g.endTime}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-8 text-[14px]">Sizga biriktirilgan guruhlar yo'q</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
