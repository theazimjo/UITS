import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Shield, 
  Bell, Globe, Smartphone, HelpCircle, 
  Moon, Sun, Check, ChevronRight, Lock, 
  Trash2, AlertCircle, ShieldAlert, Database,
  Layout
} from 'lucide-react';
import { clearAllData } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const categories = [
    { id: 'general', label: 'Umumiy', icon: <SettingsIcon size={18} /> },
    { id: 'account', label: 'Profil', icon: <User size={18} /> },
    { id: 'security', label: 'Xavfsizlik', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Bildirishnomalar', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Ko\'rinish', icon: <Layout size={18} /> },
  ];

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

  const SettingRow = ({ label, desc, type = 'toggle', checked = false }) => (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-default group border border-transparent hover:border-gray-100 dark:hover:border-white/5">
      <div className="flex-1 pr-4">
        <h4 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{label}</h4>
        <p className="text-[12px] text-gray-500 mt-0.5">{desc}</p>
      </div>
      {type === 'toggle' ? (
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
          <div className="w-10 h-5 bg-gray-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007aff]"></div>
        </label>
      ) : (
        <ChevronRight size={16} className="text-gray-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      )}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      
      {/* macOS Toolbar */}
      <div className="min-h-[56px] flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-500 text-white rounded-md shadow-sm">
            <SettingsIcon size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Sozlanmalar</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Tizim va xavfsizlik parametrlari</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-10">
          
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Sidebar Tabs */}
            <aside className="lg:w-[220px] shrink-0 flex flex-col gap-1.5 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 border border-transparent ${
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
            <main className="flex-1 space-y-8 min-w-0">
              
              {/* Category Card */}
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">{activeCategory} sozlamalari</h3>
                </div>
                <div className="p-2 space-y-1">
                  {activeCategory === 'general' && (
                    <>
                      <SettingRow label="To'lov eslatmalari" desc="O'quvchilarga to'lov haqida avtomatik habar yuborish" checked={true} />
                      <SettingRow label="Dars boshlanishi habari" desc="Guruh o'qituvchisiga dars boshlanishidan 15 daqiqa oldin habar berish" />
                      <SettingRow label="Yangi dars so'rovi" desc="Adminlarga yangi dars so'rovlari haqida habar berish" checked={true} />
                      <SettingRow label="Sinxronizatsiya" desc="Ma'lumotlarni har 1 soatda server bilan yangilash" checked={true} />
                    </>
                  )}
                  {activeCategory === 'appearance' && (
                    <>
                      <SettingRow label="Dark Mode" desc="Tizimning qorong'u rejimini yoqish" checked={false} />
                      <SettingRow label="Glassmorphism" desc="Orqa fonni xiralashtirish effektini yoqish" checked={true} />
                      <SettingRow label="Animations" desc="Interfeys animatsiyalarini faollashtirish" checked={true} />
                    </>
                  )}
                  {activeCategory === 'security' && (
                    <>
                      <SettingRow label="Parolni o'zgartirish" desc="Oxirgi marta 3 oy oldin yangilangan" type="link" />
                      <SettingRow label="Two-Factor Auth" desc="SMS orqali tizimga kirishni tasdiqlash" />
                      <SettingRow label="Faol seanslar" desc="Hozirgi vaqtda 1 ta qurilma ulangan" type="link" />
                    </>
                  )}
                  {activeCategory === 'account' && (
                    <>
                      <SettingRow label="Profil ma'lumotlari" desc="Ism: Azimjon, Lavozim: Admin" type="link" />
                      <SettingRow label="Email" desc="test@uits.uz" type="link" />
                      <SettingRow label="Telefon raqam" desc="+998 90 123 45 67" type="link" />
                    </>
                  )}
                  {activeCategory === 'notifications' && (
                    <>
                      <SettingRow label="Email habarlari" desc="Haftalik hisobotlarni emailga yuborish" checked={true} />
                      <SettingRow label="Telegram bot" desc="Telegram bot orqali xabarlarni qabul qilish" checked={true} />
                      <SettingRow label="Push notifications" desc="Brauzer orqali habarlarni qabul qilish" />
                    </>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50/20 dark:bg-red-500/5 p-6 rounded-2xl border border-red-200/50 dark:border-red-500/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-full bg-red-500/5 -rotate-12 translate-x-12 pointer-events-none group-hover:translate-x-8 transition-transform duration-700" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                      <ShieldAlert size={18} strokeWidth={2.5} />
                      <h4 className="text-[15px] font-black uppercase tracking-tight">Xavfli Hudud</h4>
                    </div>
                    <p className="text-[13px] text-red-600/80 font-medium leading-relaxed max-w-md">Barcha talabalar, guruhlar va to'lovlarni o'chirib tashlaydi. Bu amalni ortga qaytarib bo'lmaydi.</p>
                  </div>
                  <button 
                    onClick={() => setIsClearModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95"
                  >
                    Tizimni Tozalash
                  </button>
                </div>
              </div>

            </main>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => !isClearing && setIsClearModalOpen(false)}
        title="Ma'lumotlarni o'chirishni tasdiqlang"
      >
        <div className="space-y-6 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl flex gap-3 shadow-inner">
            <AlertCircle className="text-amber-500 shrink-0" size={24} />
            <div>
               <p className="text-amber-700 dark:text-amber-400 text-[14px] font-bold uppercase tracking-tight mb-1">DIQQAT!</p>
               <p className="text-amber-600 dark:text-amber-500/80 text-[13px] font-medium leading-relaxed">
                Ushbu amal tizimdagi barcha o'quvchilar, guruhlar, to'lovlar va darslar tarixini butunlay o'chirib yuboradi. Ma'lumotlarni tiklash imkoni yo'q.
              </p>
            </div>
          </div>

          <p className="text-[#1d1d1f] dark:text-gray-300 text-[14px] font-medium px-1">
            Davom etish uchun quyidagi amalni tasdiqlang:
          </p>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-white/5 mt-6 pt-6">
            <button
              disabled={isClearing}
              onClick={() => setIsClearModalOpen(false)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              disabled={isClearing}
              onClick={handleClearData}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {isClearing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />}
              O'chirib yuborish
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Settings;
