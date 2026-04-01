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
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'group-hover:border-blue-500/30' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'group-hover:border-indigo-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'group-hover:border-emerald-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'group-hover:border-purple-500/30' },
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
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen">

      {/* Header Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">Asosiy panel</h2>
        <p className="text-sm text-gray-400 mt-2">UITS o'quv markazining umumiy statistikasi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-[#131520] p-6 rounded-2xl border border-white/10 transition-all duration-300 group hover:-translate-y-1 shadow-xl shadow-black/20 ${colorStyles[stat.color].border}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <h3 className="text-4xl font-bold text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorStyles[stat.color].bg} ${colorStyles[stat.color].text}`}>
                {stat.icon}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
              {stat.trend === 'up' ? (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400">
                  <TrendingUp size={12} strokeWidth={3} />
                </div>
              ) : (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500/10 text-gray-400">
                  <TrendingUp size={12} strokeWidth={3} />
                </div>
              )}
              <span className="text-xs font-medium text-gray-500">
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* System Maintenance Section */}
      <div className="mt-20 pt-10 border-t border-white/5">
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex items-center gap-6 text-center md:text-left relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/5 transition-transform hover:scale-105">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Tizimni Tozalash</h3>
              <p className="text-gray-500 text-sm max-w-md">Barcha talabalar, guruhlar, to'lovlar va xodimlarni butunlay o'chirib tashlaydi. Faqat testlash uchun!</p>
            </div>
          </div>
          <button 
            onClick={() => setIsClearModalOpen(true)}
            className="w-full md:w-auto px-10 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-black shadow-2xl shadow-rose-600/20 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3 relative z-10"
          >
            <Trash2 size={18} />
            Hamma ma'lumotlarni o'chirish
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isClearModalOpen} 
        onClose={() => !isClearing && setIsClearModalOpen(false)} 
        title="DIQQAT: Tizimni Tozalash"
      >
        <div className="space-y-6">
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4">
             <AlertCircle className="text-amber-500 shrink-0" size={24} />
             <p className="text-amber-500 text-sm font-medium leading-relaxed">
               Bu amalni ortga qaytarib bo'lmaydi. Tizimdagi barcha ma'lumotlar (talabalar, guruhlar, to'lovlar) o'chib ketadi. Admin akkauntingiz saqlanib qoladi.
             </p>
          </div>
          
          <p className="text-gray-300 text-sm px-1">
            Haqiqatdan ham hamma narsani o'chirib yubormoqchimisiz?
          </p>

          <div className="flex gap-4">
            <button 
              disabled={isClearing}
              onClick={() => setIsClearModalOpen(false)}
              className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button 
              disabled={isClearing}
              onClick={handleClearData}
              className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-black shadow-lg shadow-rose-600/20 transition-all uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isClearing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Trash2 size={18} />}
              O'CHIRISH
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;