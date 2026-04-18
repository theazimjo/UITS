import React, { useState, useMemo } from 'react';
import { Calendar, ArrowLeft, ArrowRight, Clock, History } from 'lucide-react';

export const AttendanceCalendar = ({ records, currentViewDate, onMonthChange }) => {
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysCount = daysInMonth(year, month);
  const startOffset = (firstDayOfMonth(year, month) + 6) % 7; // Monday start

  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push({ type: 'empty' });

    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const record = records?.find(r => r.date === dateStr);
      days.push({
        day: d,
        dateStr,
        type: 'day',
        status: record ? (record.status?.toLowerCase() === 'present' ? 'present' : 'absent') : 'none',
        arrived: record?.arrived_at,
        left: record?.left_at
      });
    }
    return days;
  }, [records, year, month, daysCount, startOffset]);

  const weekLabels = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onMonthChange(newDate);
    setSelectedDayDetail(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    if (newDate > new Date()) return;
    onMonthChange(newDate);
    setSelectedDayDetail(null);
  };

  const isNextDisabled = new Date(year, month + 1, 1) > new Date();

  return (
    <div className="bg-white dark:bg-white/5 rounded-[3rem] p-8 border border-gray-100 dark:border-white/10 shadow-sm flex flex-col hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#007aff]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <h3 className="text-[20px] font-black flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Calendar size={22} />
          </div>
          Davomat Jadvali
        </h3>

        <div className="flex items-center justify-between bg-gray-50/80 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 min-w-[210px] backdrop-blur-sm">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 hover:bg-white dark:hover:bg-white/10 text-gray-400 hover:text-blue-500 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-[13px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">{monthNames[month]} {year}</span>
          <button
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            className={`p-2.5 rounded-xl transition-all shadow-sm ${isNextDisabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-white/10 text-gray-400 hover:text-blue-500 hover:shadow-md'}`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-6 relative z-10">
        {weekLabels.map(w => (
          <div key={w} className="text-center text-[10px] font-black text-gray-400 p-2 uppercase tracking-[0.2em]">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-10 relative z-10">
        {calendarDays.map((d, i) => (
          <div key={i} className="aspect-square relative flex items-center justify-center">
            {d.type === 'day' && (
              <button
                onClick={() => setSelectedDayDetail(d)}
                className={`w-full h-full max-w-[44px] max-h-[44px] rounded-[1.2rem] flex items-center justify-center text-[14px] font-black transition-all relative group ${selectedDayDetail?.day === d.day ? 'ring-2 ring-offset-4 ring-blue-500 dark:ring-offset-black scale-110' : 'hover:scale-105'
                  } ${d.status === 'present' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' :
                    d.status === 'absent' ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/30' :
                      'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
              >
                {d.day}
                {d.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-white dark:border-black rounded-full shadow-lg"></div>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-gray-100 dark:border-white/10 relative z-10">
        {selectedDayDetail ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Tanlangan sana</span>
                  <p className="text-[16px] font-black uppercase tracking-tighter text-blue-500">{selectedDayDetail.day} {monthNames[month].toLowerCase()}</p>
              </div>
              <span className={`text-[12px] font-black px-5 py-2 rounded-full uppercase tracking-tighter border-2 ${selectedDayDetail.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {selectedDayDetail.status === 'present' ? 'Ishtirok etdi' : 'Kelmagan'}
              </span>
            </div>
            {selectedDayDetail.status === 'present' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5 hover:bg-white transition-all group">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock size={12} className="text-emerald-500" /> Kirish
                  </p>
                  <p className="text-[20px] font-black tracking-tight text-gray-800 dark:text-white tabular-nums">{selectedDayDetail.arrived || '--:--'}</p>
                </div>
                <div className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5 hover:bg-white transition-all group">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock size={12} className="text-rose-500" /> Chiqish
                  </p>
                  <p className="text-[20px] font-black tracking-tight text-gray-800 dark:text-white tabular-nums">{selectedDayDetail.left || '--:--'}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 text-[14px] font-black italic tracking-tight">
                Ushbu kunda dars qoldirilgan
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50/30 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10 text-gray-400 text-center animate-pulse">
            <History size={32} className="mb-4 opacity-20" />
            <p className="text-[13px] font-bold tracking-tight">Davomat tafsilotlari uchun<br />kunni tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PaymentOverview = ({ payments, formatCurrency }) => {
  return (
    <div className="bg-white dark:bg-white/5 rounded-[3rem] p-8 border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-[20px] font-black flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <Clock size={22} />
          </div>
          To'lovlar Tarixi
        </h3>
      </div>

      <div className="overflow-x-auto -mx-8 px-8 no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
              <th className="pb-6 pl-2 pr-4 whitespace-nowrap">Hisob oyi</th>
              <th className="pb-6 pr-4 whitespace-nowrap">Summa</th>
              <th className="pb-6 pr-4 whitespace-nowrap text-rose-500">Chegirma</th>
              <th className="pb-6 pr-4 whitespace-nowrap text-emerald-500">To'landi</th>
              <th className="pb-6 text-right pr-2 whitespace-nowrap">Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {payments.length > 0 ? payments.map((p, i) => (
              <tr key={i} className="group hover:bg-gray-50/80 dark:hover:bg-white/5 transition-all">
                <td className="py-6 pl-2 pr-4">
                  <span className="text-[15px] font-black whitespace-nowrap tracking-tight">{p.month || 'Noma\'lum'}</span>
                </td>
                <td className="py-6 pr-4 font-black text-[14px] whitespace-nowrap tabular-nums opacity-60 line-through decoration-rose-500/30">{formatCurrency(p.amount || 0)}</td>
                <td className="py-6 pr-4 font-black text-[14px] text-rose-500 whitespace-nowrap tabular-nums">-{formatCurrency(p.discount || 0)}</td>
                <td className="py-6 pr-4 font-black text-[16px] text-emerald-500 whitespace-nowrap tabular-nums">{formatCurrency(p.amount - (p.discount || 0))}</td>
                <td className="py-6 text-right pr-2 whitespace-nowrap">
                  <span className="inline-flex px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-500/50 shadow-sm">
                    Qabul qilingan
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-16 text-center text-gray-400 font-bold italic text-[14px] opacity-40">Hozircha hech qanday to'lov amalga oshirilmagan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
