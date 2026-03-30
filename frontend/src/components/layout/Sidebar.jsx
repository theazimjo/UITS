import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users, LayoutDashboard, BookOpen, Wallet, UserSquare2, LogOut, Hexagon
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/groups', icon: <BookOpen size={20} />, label: 'Guruhlar' },
    { to: '/students', icon: <Users size={20} />, label: 'Talabalar' },
    { to: '/payments', icon: <Wallet size={20} />, label: 'To\'lovlar' },
    { to: '/staff', icon: <UserSquare2 size={20} />, label: 'Xodimlar' },
  ];

  return (
    <aside className="w-[280px] bg-[#131520] border border-white/10 flex flex-col p-5 z-20 m-4 rounded-2xl shadow-2xl shadow-black/40 h-[calc(100vh-2rem)] sticky top-4 flex-shrink-0">

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 px-2 mt-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Hexagon className="text-white w-6 h-6" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          UITS <span className="text-indigo-400 font-medium">CRM</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
              ${isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-medium'
                : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-400'} transition-colors duration-200`}>
                  {item.icon}
                </div>
                <span className="text-sm tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 mt-auto border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 font-medium group text-left"
        >
          <LogOut size={20} className="text-gray-500 group-hover:text-rose-400 transition-colors" />
          <span className="text-sm">Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;