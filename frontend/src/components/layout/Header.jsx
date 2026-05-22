import React, { useState, useEffect, useRef } from 'react';
import { Bell, User as UserIcon, Check } from 'lucide-react';
import useStore from '../../store/useStore';

const Header = ({ currentUser }) => {
  const { notifications, fetchNotifications, markAsRead } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  const handleNotificationClick = async (id, isRead) => {
    if (!isRead) {
      await markAsRead(id);
    }
  };

  return (
    <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-[50] bg-white/40 dark:bg-[#2d2d2d]/60 backdrop-blur-md border-b border-gray-200/50 dark:border-black/50 transition-all shrink-0">

      {/* Chap qism: Qidiruv */}
      <div className="flex items-center gap-6">
      
      </div>

      {/* O'ng qism: Amallar va Profil */}
      <div className="flex items-center gap-4">

        {/* Notifikatsiya Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors ${
              isDropdownOpen ? 'bg-black/5 dark:bg-white/10' : ''
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff3b30] rounded-full border-2 border-white dark:border-[#2d2d2d]"></span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-[#2c2c2e]/95 backdrop-blur-lg border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Dropdown Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[13px] font-bold text-black dark:text-white flex items-center gap-1.5">
                  Bildirishnomalar
                  {unreadCount > 0 && (
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} yangi
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-0.5"
                  >
                    <Check size={12} /> Hamma o'qilgan
                  </button>
                )}
              </div>

              {/* Dropdown Content */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.isRead)}
                      className={`p-4 hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-all flex items-start gap-3 relative group ${
                        !n.isRead ? 'bg-blue-50/20 dark:bg-blue-500/5' : ''
                      }`}
                    >
                      {!n.isRead && (
                        <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      )}
                      
                      <div className="flex-1 pl-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`text-[13px] font-bold text-black dark:text-white leading-tight ${
                            !n.isRead ? 'pr-4' : ''
                          }`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 shrink-0 font-medium bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded-full">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-medium">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center">
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">
                      Hech qanday bildirishnoma yo'q
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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