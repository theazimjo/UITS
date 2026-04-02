import React, { useState, useEffect } from 'react';
import { clearAllData } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Users, Wallet, UserCheck, BookOpen, TrendingUp, 
  Trash2, ShieldAlert, AlertCircle 
} from 'lucide-react';
import Modal from '../components/common/Modal';

const Dashboard = ({ studentsCount, staffCount, groupsCount }) => {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const stats = [
    {
      label: 'Jami talabalar',
      value: studentsCount,
      icon: <Users size={24} />,
      color: 'blue',
      sub: "+3 tasi o'tgan haftada",
      trend: 'up'
    },
    {
      label: 'Guruhlar soni',
      value: groupsCount || 0,
      icon: <BookOpen size={24} />,
      color: 'indigo',
      sub: "Barcha faol guruhlar",
      trend: 'neutral'
    },
    {
      label: 'Jami xodimlar',
      value: staffCount,
      icon: <UserCheck size={24} />,
      color: 'emerald',
      sub: 'Hamma faol holatda',
      trend: 'neutral'
    },
    {
      label: 'Oylik tushum',
      value: '$4,250',
      icon: <Wallet size={24} />,
      color: 'purple',
      sub: '92% reja bajarildi',
      trend: 'up'
    },
  ];

  const colorStyles = {
    blue: { bg: 'bg-[#007aff]/10', text: 'text-[#007aff]', border: 'group-hover:border-[#007aff]/30' },
    indigo: { bg: 'bg-[#5856d6]/10', text: 'text-[#5856d6]', border: 'group-hover:border-[#5856d6]/30' },
    emerald: { bg: 'bg-[#34c759]/10', text: 'text-[#34c759]', border: 'group-hover:border-[#34c759]/30' },
    purple: { bg: 'bg-[#af52de]/10', text: 'text-[#af52de]', border: 'group-hover:border-[#af52de]/30' },
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
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full">

      {/* Header Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Asosiy panel</h2>
        <p className="text-[13px] text-gray-500 mt-1">UITS o'quv markazining umumiy statistikasi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 transition-all duration-300 group hover:-translate-y-1 shadow-sm ${colorStyles[stat.color].border}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-3xl font-bold text-black dark:text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorStyles[stat.color].bg} ${colorStyles[stat.color].text}`}>
                {stat.icon}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200/50 dark:border-white/5">
              {stat.trend === 'up' ? (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#34c759]/10 text-[#34c759]">
                  <TrendingUp size={12} strokeWidth={3} />
                </div>
              ) : (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500/10 text-gray-400">
                  <TrendingUp size={12} strokeWidth={3} />
                </div>
              )}
              <span className="text-[11px] font-medium text-gray-500">
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* System Maintenance Section */}
      <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-white/10">
        <div className="bg-[#ff3b30]/5 border border-[#ff3b30]/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff3b30]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 text-center md:text-left relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#ff3b30]/10 flex items-center justify-center text-[#ff3b30] shadow-sm transition-transform hover:scale-105">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-black dark:text-white mb-1">Tizimni Tozalash</h3>
              <p className="text-gray-500 text-[13px] max-w-md">Barcha talabalar, guruhlar, to'lovlar va xodimlarni butunlay o'chirib tashlaydi. Faqat testlash uchun!</p>
            </div>
          </div>
          <button 
            onClick={() => setIsClearModalOpen(true)}
            className="w-full md:w-auto px-6 py-2.5 bg-[#ff3b30] hover:bg-[#ff453a] text-white rounded-lg text-[13px] font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10 shadow-sm"
          >
            <Trash2 size={16} />
            Ma'lumotlarni o'chirish
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isClearModalOpen} 
        onClose={() => !isClearing && setIsClearModalOpen(false)} 
        title="Tizimni Tozalash"
      >
        <div className="space-y-6">
          <div className="p-4 bg-[#ffcc00]/10 border border-[#ffcc00]/20 rounded-xl flex gap-3">
             <AlertCircle className="text-[#ffcc00] shrink-0" size={20} />
             <p className="text-[#ffcc00] text-[13px] font-medium leading-relaxed mt-0.5">
               Bu amalni ortga qaytarib bo'lmaydi. Tizimdagi barcha ma'lumotlar (talabalar, guruhlar, to'lovlar) o'chib ketadi. Admin akkauntingiz saqlanib qoladi.
             </p>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-[14px]">
            Haqiqatdan ham hamma narsani o'chirib yubormoqchimisiz?
          </p>

          <div className="flex gap-3 justify-end pt-2">
            <button 
              disabled={isClearing}
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg text-[13px] font-medium transition-all disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button 
              disabled={isClearing}
              onClick={handleClearData}
              className="px-4 py-2 bg-[#ff3b30] hover:bg-[#ff453a] text-white rounded-lg text-[13px] font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isClearing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />}
              O'chirish
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;