import React from 'react';
import { Award, CreditCard, TrendingUp, CheckCircle2, Clock, LogOut, BookOpen, User, Calendar, History, MessageSquare, QuoteIcon } from 'lucide-react';

export const StatCard = ({ icon: Icon, label, value, subValue, colorClass, borderClass }) => (
  <div className={`bg-white dark:bg-white/5 p-4 md:p-6 rounded-[2rem] border ${borderClass} shadow-sm group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
    <div className={`absolute -right-2 -top-2 w-16 h-16 ${colorClass} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-all`}></div>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} text-white shadow-lg`}>
        <Icon size={20} />
      </div>
      {subValue && (
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{subValue}</span>
      )}
    </div>
    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="text-[18px] md:text-[22px] font-black tracking-tighter text-gray-800 dark:text-white tabular-nums">
      {value || '--:--'}
    </p>
  </div>
);

export const SectionHeader = ({ icon: Icon, title, count, colorClass }) => (
  <div className="flex items-center justify-between mb-8 px-2">
    <h3 className="text-[20px] md:text-[24px] font-black flex items-center gap-3 tracking-tighter">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} text-white shadow-lg shadow-current/20`}>
        <Icon size={22} />
      </div>
      {title}
    </h3>
    {count !== undefined && (
      <span className="text-[11px] font-black text-gray-400 bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-200 dark:border-white/10 shadow-sm">
        {count} ta
      </span>
    )}
  </div>
);

export const ChildSelector = ({ children, selectedChildId, onSelect }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
    {children.map(child => (
      <button
        key={child.id}
        onClick={() => onSelect(child.id)}
        className={`shrink-0 flex items-center gap-4 px-6 py-4 rounded-[2.5rem] transition-all duration-500 border-2 ${selectedChildId === child.id
          ? 'bg-white dark:bg-white/10 border-blue-500 shadow-2xl shadow-blue-500/10 scale-[1.02]'
          : 'bg-white/50 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'
          }`}
      >
        <div className={`w-12 h-12 rounded-full border-2 overflow-hidden bg-gray-200 shadow-sm transition-transform duration-500 ${selectedChildId === child.id ? 'scale-110 border-blue-400' : 'border-white/20'}`}>
          {child.photo ? (
            <img src={child.photo} alt={child.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-500">
              <User size={24} />
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="text-[14px] font-black tracking-tight">{child.name}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">O'quvchi</p>
        </div>
      </button>
    ))}
  </div>
);
