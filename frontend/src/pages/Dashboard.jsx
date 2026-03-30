import React from 'react';
import { ChevronRight } from 'lucide-react';

const Dashboard = ({ studentsCount, staffCount, groupsCount }) => {
  const stats = [
    { label: 'Jami talabalar', value: studentsCount, color: 'from-blue-500 to-indigo-600', sub: '+3 tasi o\'tgan haftada' },
    { label: 'Oylik tushum', value: '$4,250', color: 'from-purple-500 to-fuchsia-600', sub: '92% reja bajarildi' },
    { label: 'Jami xodimlar', value: staffCount, color: 'from-emerald-500 to-teal-600', sub: 'Hamma faol holatda' },
  ];

  return (
    <div className="animate-fade-in px-4 lg:px-8">
      <h2 className="text-2xl font-bold text-white mb-8 mt-2 uppercase tracking-tighter italic font-black">Asosiy panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card relative overflow-hidden p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all group shadow-2xl">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform`}></div>
            <div className="text-sm text-gray-400 mb-2 font-medium">{stat.label}</div>
            <div className="text-5xl font-black text-white mb-3 tracking-tighter">{stat.value}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
              <ChevronRight size={10} className="text-purple-500" /> {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
