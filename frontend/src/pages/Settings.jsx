import React, { useState, useEffect } from 'react';
import {
  Sun, Moon, Check, User as UserIcon, Lock, Save, Download, Upload,
  Cloud, RefreshCcw, Folder, Terminal, Monitor, Database, Trash2, AlertCircle,
  Settings as SettingsIcon, Layout, Plus
} from 'lucide-react';
import { 
  clearAllData, getMe, updateProfile, updatePassword, 
  exportData, getSystemSettings, updateSystemSettings, triggerBackup,
  uploadGoogleAuth
} from '../services/api';
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
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingJSON, setIsUploadingJSON] = useState(false);
  
  // System Settings (Backup)
  const [systemSettings, setSystemSettings] = useState({
    autoBackupEnabled: false,
    googleDriveFolderIds: [],
    backupHour: 3,
    lastBackupAt: null,
    lastBackupStatus: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isBackingUpNow, setIsBackingUpNow] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMe();
      setProfile({ name: res.data.name || '', username: res.data.username || '' });
      
      // Fetch system settings too
      const setRes = await getSystemSettings();
      if (setRes.data) {
        setSystemSettings({
          ...setRes.data,
          googleDriveFolderIds: setRes.data.googleDriveFolderIds || []
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const categories = [
    { id: 'profile', label: 'Profil', icon: <UserIcon size={18} /> },
    { id: 'appearance', label: 'Ko\'rinish', icon: <Monitor size={18} /> },
    { id: 'backup', label: 'Zaxiralash', icon: <Cloud size={18} /> },
    { id: 'data', label: 'Ma\'lumotlar', icon: <Database size={18} /> },
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

  const handleJSONUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Faqat .json fayllar ruxsat etiladi');
      return;
    }

    setIsUploadingJSON(true);
    try {
      await uploadGoogleAuth(file);
      toast.success('Google Service Account muvaffaqiyatli yuklandi');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Faylni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploadingJSON(false);
      e.target.value = ''; // Reset input
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

  const addFolderId = () => {
    setSystemSettings({
      ...systemSettings,
      googleDriveFolderIds: [...systemSettings.googleDriveFolderIds, '']
    });
  };

  const updateFolderId = (index, value) => {
    const newIds = [...systemSettings.googleDriveFolderIds];
    newIds[index] = value;
    setSystemSettings({
      ...systemSettings,
      googleDriveFolderIds: newIds
    });
  };

  const removeFolderId = (index) => {
    const newIds = systemSettings.googleDriveFolderIds.filter((_, i) => i !== index);
    setSystemSettings({
      ...systemSettings,
      googleDriveFolderIds: newIds
    });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await exportData();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `uits_backup_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success('Ma\'lumotlar yuklab olindi!');
    } catch (err) {
      toast.error('Eksport qilishda xatolik!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateSystemSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSystemSettings(systemSettings);
      toast.success('Zaxira sozlamalari saqlandi!');
    } catch (err) {
      toast.error('Saqlashda xatolik yuz berdi!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleManualBackup = async () => {
    setIsBackingUpNow(true);
    try {
      await triggerBackup();
      toast.success('Zaxiralash muvaffaqiyatli yakunlandi!');
      const res = await getSystemSettings();
      setSystemSettings(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Zaxiralashda xatolik yuz berdi!');
    } finally {
      setIsBackingUpNow(false);
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
                            placeholder=""
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

              {activeCategory === 'data' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {/* Export Section */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-green-500/10 text-green-500 rounded-xl">
                        <Download size={20} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">Eksport qilish</h3>
                        <p className="text-[11px] text-gray-400 italic">Barcha ma'lumotlarni JSON formatida yuklab oling</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                      <div className="flex-1">
                        <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white mb-1">Tizim zaxira nusxasi</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          Ushbu amal orqali siz barcha o'quvchilar, guruhlar, to'lovlar va boshqa ma'lumotlarni o'z ichiga olgan faylni yuklab olishingiz mumkin.
                        </p>
                      </div>
                      <button
                        onClick={handleExportData}
                        disabled={isExporting}
                        className="w-full md:w-auto px-8 py-3 bg-green-500 text-white rounded-2xl text-[14px] font-black hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                      >
                        {isExporting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download size={18} />}
                        Yuklab olish
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'backup' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {/* Google Drive Status Card */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#4285F4] to-[#34A853] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                        <Cloud size={28} />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-black text-[#1d1d1f] dark:text-white leading-tight">
                          Google Drive Sync
                        </h3>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                          {systemSettings.lastBackupAt ? (
                            <>
                              <span className={`w-2 h-2 rounded-full ${systemSettings.lastBackupStatus === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`} />
                              Oxirgi zaxira: {new Date(systemSettings.lastBackupAt).toLocaleString()}
                            </>
                          ) : 'Zaxira nusxasi hali olinmagan'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleManualBackup}
                      disabled={isBackingUpNow}
                      className="px-6 py-2.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-[13px] font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      {isBackingUpNow ? <RefreshCcw size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                      Hozir zaxiralash
                    </button>
                  </div>

                  {/* Config Card */}
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Folder size={20} />
                      </div>
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">Zaxira sozlamalari</h3>
                    </div>

                    <div className="mb-8 p-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-3xl border border-blue-100 dark:border-blue-500/20">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                          <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white mb-1">Google Auth Key (JSON)</h4>
                          <p className="text-[12px] text-gray-500 leading-relaxed">
                            Google Service Account JSON faylini yuklang. Bu faylsiz Google Drive-ga zaxiralash ishlamaydi.
                          </p>
                        </div>
                        <div className="shrink-0">
                          <input
                            type="file"
                            id="json-upload"
                            className="hidden"
                            accept=".json,application/json"
                            onChange={handleJSONUpload}
                            disabled={isUploadingJSON}
                          />
                          <label
                            htmlFor="json-upload"
                            className={`px-6 py-3 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl text-[13px] font-black cursor-pointer flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/20 transition-all ${isUploadingJSON ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {isUploadingJSON ? (
                              <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            ) : (
                              <Upload size={18} className="text-blue-500" />
                            )}
                            {isUploadingJSON ? 'Yuklanmoqda...' : 'JSON yuklash'}
                          </label>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateSystemSettings} className="space-y-8">
                      <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                        <div>
                          <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white mb-1">Avtomatik kundalik zaxira</h4>
                          <p className="text-[12px] text-gray-500">Har kuni soat {systemSettings.backupHour < 10 ? `0${systemSettings.backupHour}` : systemSettings.backupHour}:00 da bazani Google Drive-ga yuklaydi</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSystemSettings({ ...systemSettings, autoBackupEnabled: !systemSettings.autoBackupEnabled })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${systemSettings.autoBackupEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${systemSettings.autoBackupEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              Google Drive Folder ID-lar
                              <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">Kamida bitta</span>
                            </span>
                            <button
                              type="button"
                              onClick={addFolderId}
                              className="text-[11px] text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1"
                            >
                              <Plus size={12} /> Jild qo'shish
                            </button>
                          </label>

                          {systemSettings.googleDriveFolderIds.map((folderId, index) => (
                            <div key={index} className="relative group flex items-center gap-2">
                              <div className="relative flex-1">
                                <Folder size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                  type="text"
                                  value={folderId}
                                  onChange={(e) => updateFolderId(index, e.target.value)}
                                  placeholder="Masalan: 1abc...xyz"
                                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[14px] outline-none focus:border-blue-500 transition-all font-mono"
                                />
                              </div>
                              {systemSettings.googleDriveFolderIds.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeFolderId(index)}
                                  className="p-4 text-red-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                                  title="O'chirish"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                          
                          <p className="text-[11px] text-gray-400 leading-relaxed ml-1 italic">
                            * Eslatma: Service Account email manzili barcha ko'rsatilgan jildlarga yozish huquqiga ega bo'lishi kerak.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            Zaxiralash vaqti (soat)
                          </label>
                          <select
                            value={systemSettings.backupHour}
                            onChange={(e) => setSystemSettings({ ...systemSettings, backupHour: parseInt(e.target.value) })}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-[14px] outline-none focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i} className="bg-white dark:bg-[#1d1d1f]">
                                {i < 10 ? `0${i}` : i}:00
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                        <button
                          type="submit"
                          disabled={isSavingSettings}
                          className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[14px] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                        >
                          {isSavingSettings ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                          Sozlamalarni saqlash
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Instructions Card */}
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-[2.5rem] p-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30 shrink-0">
                        <Terminal size={24} />
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[18px] font-black text-[#1d1d1f] dark:text-white leading-tight">Zaxira tizimini qanday sozlash kerak?</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-blue-200/30 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-[12px] font-black">1</span>
                              <h5 className="font-bold text-[14px] text-[#1d1d1f] dark:text-white">API-ni yoqish</h5>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed">
                              Google Cloud Console-ga kiring va <b>Google Drive API</b>-ni yoqing. Bu tizimga bulut bilan muloqot qilish imkonini beradi.
                            </p>
                          </div>

                          <div className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-blue-200/30 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-[12px] font-black">2</span>
                              <h5 className="font-bold text-[14px] text-[#1d1d1f] dark:text-white">Xizmat hisobi (SA)</h5>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed">
                              <b>Service Account</b> yarating va uning <b>JSON</b> kalitini yuklab oling. Bu kalit tizimning "pasporti" hisoblanadi.
                            </p>
                          </div>

                          <div className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-blue-200/30 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-[12px] font-black">3</span>
                              <h5 className="font-bold text-[14px] text-[#1d1d1f] dark:text-white">Faylni yuklash</h5>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed">
                              Yuklab olingan JSON faylni yuqoridagi <b>"JSON yuklash"</b> tugmasi orqali tizimga yuboring. Tizim uni avtomatik saqlaydi.
                            </p>
                          </div>

                          <div className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-blue-200/30 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-[12px] font-black">4</span>
                              <h5 className="font-bold text-[14px] text-[#1d1d1f] dark:text-white">Ruxsat berish</h5>
                            </div>
                            <p className="text-[12px] text-gray-500 leading-relaxed">
                              Google Drive-da jild yarating va uni SA-ning email manziliga <b>Muharrir (Editor)</b> huquqi bilan ulashing. So'ng Jild ID-sini yuqoriga yozing.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <p className="text-[11px] text-amber-600 font-bold flex items-center gap-2">
                            <AlertCircle size={14} />
                            ESLATMA: Jild (Folder) ID - bu brauzer manzilidagi oxirgi raqam va harflar to'plami.
                          </p>
                        </div>
                      </div>
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
