import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen text-gray-100 flex font-sans overflow-hidden bg-[#07080e]">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header currentUser={currentUser} />
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
