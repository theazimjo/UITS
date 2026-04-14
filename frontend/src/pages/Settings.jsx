import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Layout, Trash2,
  AlertCircle, ShieldAlert, Monitor, Database,
  Sun, Moon, Check, User as UserIcon, Lock, Save
} from 'lucide-react';
import { clearAllData, getMe, updateProfile, updatePassword } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('profile');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Profile State
  const [profile, setProfile] = useState({ name: '', username: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMe();
      setProfile({ name: res.data.name || '', username: res.data.username || '' });
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  const categories = [
    { id: 'profile', label: 'Profil', icon: <UserIcon size={18} /> },
    { id: 'appearance', label: 'Ko\'rinish', icon: <Monitor size={18} /> },
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile(profile);
      toast.success('Profil ma\'lumotlari yangilandi!');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, username: profile.username }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Yangi parollar mos kelmadi!');
    }
    setIsUpdatingPassword(true);
    try {
      await updatePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Parol muvaffaqiyatli o\'zgartirildi!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi!');
    } finally {
      setIsUpdatingPassword(false);
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
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Profil va tizim boshqaruvi</p>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-black transition-all duration-200 border border-transparent ${activeCategory === cat.id
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

              {activeCategory === 'profile' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {/* Profile Header Card */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#007aff] to-[#00c6ff] rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                      <UserIcon size={32} />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-black text-[#1d1d1f] dark:text-white leading-tight">
                        {profile.name || profile.username || 'Admin'}
                      </h3>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md text-[11px] font-bold uppercase tracking-wider">Administrator</span>
                        • @{profile.username || 'admin'}
                      </p>
                    </div>
                  </div>

                  {/* Basic Info Section */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-blue-500/10 text-[#007aff] rounded-xl">
                        <UserIcon size={20} />
                      </div>
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">Ma'lumotlarni yangilash</h3>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-2">To'liq ismingiz</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            placeholder="Masalan: Azimjon Abdullaev"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                          />
                          <p className="text-[11px] text-gray-400 ml-2 italic">Hozirgi: {profile.name || 'Set emas'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-2">Foydalanuvchi nomi</label>
                          <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            placeholder="Username"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all font-mono"
                          />
                          <p className="text-[11px] text-gray-400 ml-2 italic">Hozirgi: @{profile.username || 'admin'}</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="px-8 py-3 bg-[#007aff] text-white rounded-2xl text-[14px] font-black hover:bg-[#0066d6] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                        >
                          {isUpdatingProfile ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                          O'zgarishlarni saqlash
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security Section */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">Xavfsizlik</h3>
                        <p className="text-[11px] text-gray-400 italic">Joriy parol shifrlangan va himoyalangan</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-2">Eski parol</label>
                          <input
                            type="password"
                            value={passwords.oldPassword}
                            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                            placeholder="Amaldagi parolni kiriting"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-2">Yangi parol</label>
                            <input
                              type="password"
                              value={passwords.newPassword}
                              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                              placeholder="Yangi parol"
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase ml-2">Yangi parolni tasdiqlang</label>
                            <input
                              type="password"
                              value={passwords.confirmPassword}
                              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                              placeholder="Qayta kiriting"
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-[14px] outline-none focus:border-[#007aff] transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="px-8 py-3 bg-amber-500 text-white rounded-2xl text-[14px] font-black hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center gap-2"
                        >
                          {isUpdatingPassword ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Lock size={18} />}
                          Yangi parolni saqlash
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

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
