import React from 'react';
import { Search, Bell, User as UserIcon } from 'lucide-react';

const Header = ({ currentUser }) => {
  return (
    <header className="h-20 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 bg-[#0b0d17]/80 backdrop-blur-md border-b border-white/10 transition-all">

      {/* Chap qism: Qidiruv */}
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Tizim bo'ylab qidirish..."
            className="pl-11 pr-4 py-2.5 bg-[#131520] border border-white/10 rounded-xl w-64 xl:w-80 focus:w-80 xl:focus:w-96 outline-none text-sm text-white placeholder-gray-500 transition-all duration-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* O'ng qism: Amallar va Profil */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Bildirishnomalar */}
        <button className="relative p-2.5 bg-[#131520] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
          <Bell size={18} />
          {/* Yangi xabar uchun qizil nuqta */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#131520]"></span>
        </button>

        {/* Profil ma'lumotlari */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">
              {currentUser?.username || 'Foydalanuvchi'}
            </p>
            <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Faol
            </p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
            {currentUser?.username ? (
              <span className="text-white font-bold text-sm">
                {currentUser.username.substring(0, 1).toUpperCase()}
              </span>
            ) : (
              <UserIcon size={18} className="text-white" />
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;