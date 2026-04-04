import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Shield, 
  Bell, Globe, Smartphone, HelpCircle, 
  Moon, Sun, Check, ChevronRight, Lock
} from 'lucide-react';

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', label: 'Umumiy', icon: <SettingsIcon size={18} /> },
    { id: 'account', label: 'Profil', icon: <User size={18} /> },
    { id: 'security', label: 'Xavfsizlik', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Bildirishnomalar', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Ko\'rinish', icon: <Moon size={18} /> },
  ];

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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">Sozlanmalar</h1>
          <p className="text-gray-500 dark:text-gray-400">Tizim va profil sozlamalarini boshqaring</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <aside className="lg:w-1/4 flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                  activeCategory === cat.id 
                  ? 'bg-white dark:bg-white/10 text-[#007aff] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
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
          <main className="flex-1 space-y-6">
            
            {/* General Section */}
            <div className="bg-white/70 dark:bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{activeCategory} sozlamalari</h3>
              </div>
              <div className="space-y-1">
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
            <div className="bg-red-50/50 dark:bg-red-500/5 p-2 rounded-2xl border border-red-100 dark:border-red-500/10 shadow-sm mt-4">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-red-600">Barcha ma'lumotlarni o'chirish</h4>
                  <p className="text-[12px] text-red-500/70 mt-0.5">Bu amalni ortga qaytarib bo'lmaydi</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-[12px] font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/20">
                  Ochirish
                </button>
              </div>
            </div>

          </main>
        </div>

      </div>
    </div>
  );
};

export default Settings;
