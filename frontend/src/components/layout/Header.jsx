import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  User as UserIcon, 
  Check, 
  Settings, 
  DollarSign, 
  Calendar, 
  History, 
  X, 
  Activity 
} from 'lucide-react';
import useStore from '../../store/useStore';

const Header = ({ currentUser }) => {
  const { notifications, fetchNotifications, markAsRead } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
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

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  const handleNotificationClick = async (n) => {
    setSelectedNotification(n);
    if (!n.isRead) {
      await markAsRead(n.id);
    }
  };

  const getNotificationConfig = (n) => {
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();

    // Pink (User Profile Change, Student Photo / User updates)
    if (title.includes('profil') || title.includes('avatar') || title.includes('rasm') || title.includes('photo') || title.includes('user')) {
      return {
        icon: UserIcon,
        iconBg: 'bg-[#ec4899]/15 text-[#ec4899] border border-[#ec4899]/30',
        category: 'Logs'
      };
    }

    // Light Blue (Calendar, events, lessons, group changes)
    if (title.includes('sana') || title.includes('kun') || title.includes('vaqt') || title.includes('dars') || title.includes('taqvim') || msg.includes('dars') || msg.includes('soat')) {
      return {
        icon: Calendar,
        iconBg: 'bg-[#0ea5e9]/15 text-[#0ea5e9] border border-[#0ea5e9]/30',
        category: 'Events'
      };
    }

    // Teal / Green (Payments, income, approvals)
    if (title.includes('to\'lov') || title.includes('tolov') || title.includes('payment') || title.includes('pul') || title.includes('yakunlandi') || title.includes('muvaffaqiyatli') || msg.includes('to\'lov') || msg.includes('tolov')) {
      return {
        icon: DollarSign,
        iconBg: 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30',
        category: 'Alerts'
      };
    }

    // Orange / Yellow (Salary, ER Diagram, statistics, backups, updates)
    if (title.includes('oylik') || title.includes('moshina') || title.includes('diagram') || title.includes('tizim') || title.includes('arxiv') || title.includes('sozlama')) {
      return {
        icon: Activity,
        iconBg: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30',
        category: 'Logs'
      };
    }

    // Red / Rose (Warnings, alerts, error logs, history reports)
    if (title.includes('xabar') || title.includes('ogohlantirish') || title.includes('alert') || title.includes('xato') || title.includes('weekly') || title.includes('tarix') || title.includes('log')) {
      return {
        icon: History,
        iconBg: 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30',
        category: 'Logs'
      };
    }

    // Default (Purple bell)
    return {
      icon: Bell,
      iconBg: 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30',
      category: 'Alerts'
    };
  };

  const filteredNotifications = notifications.filter(n => {
    const config = getNotificationConfig(n);
    if (activeTab === 'All') return true;
    return config.category === activeTab;
  });

  return (
    <>
      <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-[99] bg-white/40 dark:bg-[#2d2d2d]/60 backdrop-blur-md border-b border-gray-200/50 dark:border-black/50 transition-all shrink-0">
        
        {/* Chap qism: Qidiruv joyi */}
        <div className="flex items-center gap-6"></div>

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
              <div className="absolute right-0 mt-2 w-80 sm:w-[420px] bg-[#1a2236] border border-[#24324f] rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-slate-200">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#242f47] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-[#4f46e5] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-0.5"
                      >
                        <Check size={12} /> Hamma o'qilgan
                      </button>
                    )}
                    <button className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-[#222c44]">
                      <Settings size={15} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center px-2 border-b border-[#242f47] text-[12px] font-semibold text-slate-400 bg-[#161d2e]">
                  {['All', 'Alerts', 'Events', 'Logs'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-3 relative cursor-pointer transition-colors ${
                        activeTab === tab ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Notification List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-[#242f47]/40 custom-scrollbar bg-[#1a2236]">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((n) => {
                      const config = getNotificationConfig(n);
                      const Icon = config.icon;
                      return (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`px-5 py-3.5 hover:bg-[#222c44]/80 cursor-pointer transition-all flex items-start gap-4 border-b border-[#242f47]/30 ${
                            !n.isRead ? 'bg-[#222c44]/30' : ''
                          }`}
                        >
                          {/* Icon circle */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${config.iconBg}`}>
                            <Icon size={18} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-[13px] font-bold text-slate-100 leading-snug truncate ${
                                !n.isRead ? 'text-white' : 'text-slate-300'
                              }`}>
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[12px] text-slate-400 leading-normal line-clamp-2 mt-0.5 font-normal">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-slate-500 mt-1.5 block font-medium">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' • '}
                              {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 px-4 text-center">
                      <p className="text-[13px] text-slate-500 font-medium">
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

      {/* Modal - Notification Details */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNotification(null)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-[#161d30] border border-[#24324f] rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-200">
            {/* Close Icon */}
            <button 
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-[#222c44]"
            >
              <X size={18} />
            </button>

            {/* Config & Category Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${getNotificationConfig(selectedNotification).iconBg}`}>
                {React.createElement(getNotificationConfig(selectedNotification).icon, { size: 20 })}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  {getNotificationConfig(selectedNotification).category}
                </span>
                <span className="text-[10px] text-slate-500">
                  Bildirishnoma tafsilotlari
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-white mb-2 leading-snug">
              {selectedNotification.title}
            </h3>

            {/* Text Area */}
            <div className="bg-[#0f1524] border border-[#1b253b] rounded-xl p-4 my-4 max-h-[220px] overflow-y-auto custom-scrollbar">
              <p className="text-slate-300 text-[13px] leading-relaxed whitespace-pre-wrap select-text">
                {selectedNotification.message}
              </p>
            </div>

            {/* Date & Status */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-6 bg-[#111726]/40 p-2.5 rounded-lg border border-[#242f47]/30">
              <span className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-tight">Sana va Vaqt</span>
                <span className="text-slate-300 font-medium">
                  {new Date(selectedNotification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                  {new Date(selectedNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-tight">Holati</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  selectedNotification.isRead ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-indigo-600/30 text-indigo-400'
                }`}>
                  {selectedNotification.isRead ? 'O\'qildi' : 'Yangi'}
                </span>
              </span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setSelectedNotification(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 uppercase tracking-wider"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;