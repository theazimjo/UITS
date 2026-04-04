import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users, LayoutDashboard, BookOpen, Wallet, UserSquare2, LogOut, Hexagon,
  BarChart3, Settings
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Asosiy panel' },
    { to: '/groups', icon: <BookOpen size={18} />, label: 'Guruhlar' },
    { to: '/students', icon: <Users size={18} />, label: 'Talabalar' },
    { to: '/payments', icon: <Wallet size={18} />, label: 'To\'lovlar' },
    { to: '/staff', icon: <UserSquare2 size={18} />, label: 'Xodimlar' },
    { to: '/finance', icon: <BarChart3 size={18} />, label: 'Moliya' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Sozlanmalar' },
  ];

  return (
    <aside className="w-[260px] bg-white/30 dark:bg-black/20 flex flex-col py-4 px-3 z-20 flex-shrink-0 backdrop-blur-md hidden md:flex">

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-3 mt-2 select-none drag-region">
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[10px] flex items-center justify-center shadow-sm">
          <Hexagon className="text-white w-5 h-5" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />
        </div>
        <span className="text-lg font-semibold text-black dark:text-white tracking-tight">
          UITS <span className="text-indigo-600 dark:text-indigo-400 font-medium">CRM</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div className="px-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-2">Asosiy menu</div>
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 select-none
              ${isActive
                ? 'bg-[#007aff] text-white font-medium shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`${isActive ? 'text-white' : 'text-[#007aff] dark:text-[#0a84ff] opacity-80'}`}>
                  {item.icon}
                </div>
                <span className="text-[13px] tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all duration-200 group text-left select-none"
        >
          <LogOut size={18} className="text-gray-500 group-hover:text-[#ff3b30] transition-colors" />
          <span className="text-[13px] font-medium">Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;