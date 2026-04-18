import React from 'react';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import useStore from '../../store/useStore';

const Header = ({ currentUser }) => {
  const { notifications } = useStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-30 bg-white/40 dark:bg-[#2d2d2d]/60 backdrop-blur-md border-b border-gray-200/50 dark:border-black/50 transition-all shrink-0">

      {/* Chap qism: Qidiruv */}
      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007aff] transition-colors pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Qidirish..."
            className="pl-9 pr-4 py-1.5 bg-white/50 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md w-64 xl:w-80 outline-none text-[13px] text-gray-800 dark:text-white placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-[#007aff]/50 focus:border-transparent shadow-inner"
          />
        </div>
      </div>

      {/* O'ng qism: Amallar va Profil */}
      <div className="flex items-center gap-4">

        <button className="relative p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff3b30] rounded-full border-2 border-white dark:border-[#2d2d2d]"></span>
          )}
        </button>

        {/* Profil ma'lumotlari */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-300/50 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-medium text-black dark:text-white leading-tight">
              {currentUser?.username || 'Foydalanuvchi'}
            </p>
            <p className="text-[11px] text-[#34c759] font-medium mt-0.5 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse"></span>
              Faol
            </p>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm border border-black/5">
            {currentUser?.username ? (
              <span className="text-white font-bold text-xs">
                {currentUser.username.substring(0, 1).toUpperCase()}
              </span>
            ) : (
              <UserIcon size={16} className="text-white" />
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;