import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Layout, Trash2, 
  AlertCircle, ShieldAlert, Monitor, Database,
  Sun, Moon, Check
} from 'lucide-react';
import { clearAllData } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('appearance');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const categories = [
    { id: 'appearance', label: 'Ko\'rinish', icon: <Monitor size={18} /> },
    { id: 'system', label: 'Tizim', icon: <Database size={18} /> },
  ];

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      toast.success('Barcha ma\'lumotlar muvaffaqiyatli o\'chirildi!');
      window.location.reload();
    } catch (err) {
      toast.error('Xatolik yuz berdi!');
      setIsClearing(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      
      {/* macOS Toolbar */}
      <div className="min-h-[56px] flex items-center px-6 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-500 text-white rounded-md shadow-sm">
            <SettingsIcon size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Sozlanmalar</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Interfeys va tizim vositalari</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="max-w-5xl mx-auto animate-fade-in pb-10">
          
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Sidebar Tabs */}
            <aside className="lg:w-[200px] shrink-0 flex flex-col gap-1.5 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-black transition-all duration-200 border border-transparent ${
                    activeCategory === cat.id 
                    ? 'bg-white dark:bg-white/10 text-[#007aff] dark:text-white shadow-sm border-gray-200/50 dark:border-white/10' 
                    : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`${activeCategory === cat.id ? 'text-[#007aff] dark:text-white' : 'text-gray-400 opacity-80'}`}>
                    {cat.icon}
                  </div>
                  {cat.label}
                </button>
              ))}
            </aside>

            {/* Settings Content */}
            <main className="flex-1 min-w-0">
              
              {activeCategory === 'appearance' && (
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center gap-3 mb-8">
                     <div className="p-2 bg-blue-500/10 text-[#007aff] rounded-xl">
                       <Sun size={20} />
                     </div>
                     <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">Interfeys Ko'rinishi</h3>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Light Mode Card */}
                      <button 
                        onClick={() => handleThemeChange('light')}
                        className={`group relative overflow-hidden rounded-[2rem] border-2 transition-all p-1 ${theme === 'light' ? 'border-[#007aff] bg-[#007aff]/5 ring-4 ring-[#007aff]/10' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
                      >
                         <div className="aspect-[4/3] bg-white rounded-[1.75rem] shadow-inner mb-4 overflow-hidden relative border border-gray-100">
                            {/* Dummy UI Preview */}
                            <div className="absolute top-3 left-3 right-3 h-4 bg-gray-100 rounded-md" />
                            <div className="absolute top-9 left-3 w-16 h-16 bg-blue-50 rounded-lg border border-blue-100" />
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
                              <div className="w-6 h-6 bg-[#007aff] rounded-full flex items-center justify-center text-white">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                         </div>
                      </button>

                      {/* Dark Mode Card */}
                      <button 
                        onClick={() => handleThemeChange('dark')}
                        className={`group relative overflow-hidden rounded-[2rem] border-2 transition-all p-1 ${theme === 'dark' ? 'border-[#007aff] bg-[#007aff]/5 ring-4 ring-[#007aff]/10' : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
                      >
                         <div className="aspect-[4/3] bg-[#1e1e1e] rounded-[1.75rem] shadow-inner mb-4 overflow-hidden relative border border-white/5">
                             {/* Dummy UI Preview */}
                            <div className="absolute top-3 left-3 right-3 h-4 bg-white/5 rounded-md" />
                            <div className="absolute top-9 left-3 w-16 h-16 bg-blue-500/10 rounded-lg border border-blue-500/20" />
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
                              <div className="w-6 h-6 bg-[#007aff] rounded-full flex items-center justify-center text-white">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                         </div>
                      </button>
                   </div>
                </div>
              )}

              {activeCategory === 'system' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-red-50/20 dark:bg-red-500/5 p-8 rounded-[2.5rem] border border-red-200/50 dark:border-red-500/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-full bg-red-500/5 -rotate-12 translate-x-12 pointer-events-none group-hover:translate-x-8 transition-transform duration-700" />
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                      <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-red-600 mb-2">
                          <ShieldAlert size={22} strokeWidth={2.5} />
                          <h4 className="text-[17px] font-black uppercase tracking-tight">Xavfli Hudud</h4>
                        </div>
                        <p className="text-[14px] text-red-600/80 font-medium leading-relaxed max-w-md">Barcha talabalar, guruhlar va to'lovlarni o'chirib tashlaydi. Bu amalni ortga qaytarib bo'lmaydi.</p>
                      </div>
                      <button 
                        onClick={() => setIsClearModalOpen(true)}
                        className="w-full sm:w-auto px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[15px] font-black transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Tizimni Tozalash
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>

        </div>
      </div>

      <Modal
        isOpen={isClearModalOpen}
        onClose={() => !isClearing && setIsClearModalOpen(false)}
        title="Ma'lumotlarni o'chirishni tasdiqlang"
      >
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl flex gap-4">
            <AlertCircle className="text-amber-500 shrink-0" size={24} />
            <p className="text-amber-600 dark:text-amber-400 text-[14px] font-semibold leading-relaxed">
              Diqqat! Ushbu amal tizimdagi barcha o'quvchilar, guruhlar va to'lovlar tarixini butunlay o'chirib yuboradi. Ma'lumotlarni tiklash imkoni yo'q.
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              disabled={isClearing}
              onClick={() => setIsClearModalOpen(false)}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-xl text-[14px] font-bold transition-all"
            >
              Bekor qilish
            </button>
            <button
              disabled={isClearing}
              onClick={handleClearData}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-bold transition-all flex items-center gap-2"
            >
              {isClearing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />}
              Tasdiqlash
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Settings;
