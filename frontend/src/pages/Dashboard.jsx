import React from 'react';
import { Users, Wallet, UserCheck, BookOpen, TrendingUp } from 'lucide-react';

const Dashboard = ({ studentsCount, staffCount, groupsCount }) => {
  const stats = [
    {
      label: 'Jami talabalar',
      value: studentsCount,
      icon: <Users size={24} />,
      color: 'blue',
      sub: "+3 tasi o'tgan haftada",
      trend: 'up'
    },
    {
      label: 'Guruhlar soni',
      value: groupsCount || 0, // Props'dan kelgan ma'lumot qo'shildi
      icon: <BookOpen size={24} />,
      color: 'indigo',
      sub: "Barcha faol guruhlar",
      trend: 'neutral'
    },
    {
      label: 'Jami xodimlar',
      value: staffCount,
      icon: <UserCheck size={24} />,
      color: 'emerald',
      sub: 'Hamma faol holatda',
      trend: 'neutral'
    },
    {
      label: 'Oylik tushum',
      value: '$4,250',
      icon: <Wallet size={24} />,
      color: 'purple',
      sub: '92% reja bajarildi',
      trend: 'up'
    },
  ];

  // Ranglar uchun yordamchi obyekt
  const colorStyles = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'group-hover:border-blue-500/30' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'group-hover:border-indigo-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'group-hover:border-purple-500/30' },
  };

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen">

      {/* Header Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">Asosiy panel</h2>
        <p className="text-sm text-gray-400 mt-2">UITS o'quv markazining umumiy statistikasi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-[#131520] p-6 rounded-2xl border border-white/10 transition-all duration-300 group hover:-translate-y-1 shadow-xl shadow-black/20 ${colorStyles[stat.color].border}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <h3 className="text-4xl font-bold text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorStyles[stat.color].bg} ${colorStyles[stat.color].text}`}>
                {stat.icon}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
              {stat.trend === 'up' ? (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400">
                  <TrendingUp size={12} strokeWidth={3} />
                </div>
              ) : (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500/10 text-gray-400">
                  <TrendingUp size={12} strokeWidth={3} />
                </div>
              )}
              <span className="text-xs font-medium text-gray-500">
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;