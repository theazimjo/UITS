import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Check, User as UserIcon, Monitor } from 'lucide-react';

const TeacherSettings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      {/* Toolbar */}
      <div className="min-h-[56px] flex items-center px-6 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-500 text-white rounded-md shadow-sm">
            <SettingsIcon size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Sozlamalar</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Profil va ko'rinish</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <UserIcon size={32} />
            </div>
            <div>
              <h3 className="text-[20px] font-black text-[#1d1d1f] dark:text-white leading-tight">
                {user?.username || 'O\'qituvchi'}
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[11px] font-bold uppercase tracking-wider">O'qituvchi</span>
                • @{user?.username || 'teacher'}
              </p>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 text-[#007aff] rounded-xl">
                <Monitor size={20} />
              </div>
              <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">Interfeys Ko'rinishi</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Light Mode */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`group relative overflow-hidden rounded-[2rem] border-2 transition-all p-1 ${theme === 'light' ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
              >
                <div className="aspect-[4/3] bg-white rounded-[1.75rem] shadow-inner mb-4 overflow-hidden relative border border-gray-100">
                  <div className="absolute top-3 left-3 right-3 h-4 bg-gray-100 rounded-md" />
                  <div className="absolute top-9 left-3 w-16 h-16 bg-emerald-50 rounded-lg border border-emerald-100" />
                  <div className="absolute top-9 left-[5.5rem] right-3 h-16 bg-gray-50 rounded-lg flex flex-col gap-2 p-2">
                    <div className="w-full h-1 bg-gray-200 rounded-full" />
                    <div className="w-3/4 h-1 bg-gray-200 rounded-full" />
                  </div>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">Yorug' (Light)</p>
                    <p className="text-[12px] text-gray-500">Standart ko'rinish</p>
                  </div>
                  {theme === 'light' && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`group relative overflow-hidden rounded-[2rem] border-2 transition-all p-1 ${theme === 'dark' ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
              >
                <div className="aspect-[4/3] bg-[#1e1e1e] rounded-[1.75rem] shadow-inner mb-4 overflow-hidden relative border border-white/5">
                  <div className="absolute top-3 left-3 right-3 h-4 bg-white/5 rounded-md" />
                  <div className="absolute top-9 left-3 w-16 h-16 bg-emerald-500/10 rounded-lg border border-emerald-500/20" />
                  <div className="absolute top-9 left-[5.5rem] right-3 h-16 bg-white/5 rounded-lg flex flex-col gap-2 p-2">
                    <div className="w-full h-1 bg-white/10 rounded-full" />
                    <div className="w-3/4 h-1 bg-white/10 rounded-full" />
                  </div>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">Qorong'u (Dark)</p>
                    <p className="text-[12px] text-gray-500">Tungi rejim</p>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
