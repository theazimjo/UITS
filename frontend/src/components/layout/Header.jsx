import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = ({ currentUser }) => {
  return (
    <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
          <input type="text" placeholder="Tizim bo'ylab qidirish..." className="glass-input pl-12 pr-4 py-3 rounded-2xl w-80 focus:w-96 outline-none text-sm transition-all shadow-lg border-white/5" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl border border-white/5"><Bell size={20} /></button>
        <div className="flex items-center gap-4 bg-white/5 py-1.5 px-3 rounded-2xl border border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white uppercase tracking-tighter leading-none">{currentUser?.username}</p>
            <p className="text-[8px] text-purple-500 font-black uppercase tracking-[0.2em] mt-1">Status: Active</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
