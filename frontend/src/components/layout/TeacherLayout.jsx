import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import Header from './Header';

const TeacherLayout = ({ currentUser, onLogout }) => {
  return (
    <div className="h-screen w-full bg-[url('https://images.unsplash.com/photo-1628156108168-cf890eb9385b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] overflow-hidden flex">
      <div className="absolute inset-0 bg-white/40 dark:bg-[#000000]/60 backdrop-blur-2xl z-0 pointer-events-none"></div>
      
      <div className="relative z-10 flex w-full h-full max-w-[1920px] mx-auto xl:px-4 xl:py-4 transition-all">
        <div className="flex w-full h-full xl:rounded-2xl overflow-hidden shadow-2xl xl:shadow-black/50 border-0 xl:border xl:border-white/20 dark:xl:border-white/10 bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-xl relative">
          <TeacherSidebar onLogout={onLogout} />
          <main className="flex-1 flex flex-col min-w-0 h-full relative border-l border-white/30 dark:border-black/30">
            <Header currentUser={currentUser} />
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;
