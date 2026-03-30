                                                                                                                                                              import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, LayoutDashboard, BookOpen, Wallet, UserSquare2, LogOut 
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  return (
    <aside className="w-72 glass-card border-r border-white/5 flex flex-col p-6 z-20 m-4 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
          <UserSquare2 className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 italic">UITS CRM</span>
      </div>
      <nav className="flex-1 flex flex-col gap-3">
        {[
          { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { to: '/groups', icon: <BookOpen size={20} />, label: 'Guruhlar' },
          { to: '/students', icon: <Users size={20} />, label: 'Talabalar' },
          { to: '/payments', icon: <Wallet size={20} />, label: 'To\'lovlar' },
          { to: '/staff', icon: <UserSquare2 size={20} />, label: 'Xodimlar' },
        ].map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/60 font-black' : 'text-gray-500 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}>
            <div className="group-hover:text-purple-400 transition-colors">{item.icon}</div>    
            <span className="text-sm tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button onClick={onLogout} className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all font-medium group text-left">
        <LogOut size={20} className="group-hover:-translate-x-1" />
        <span className="text-sm">Chiqish</span>
      </button>
    </aside>
  );
};

export default Sidebar;
