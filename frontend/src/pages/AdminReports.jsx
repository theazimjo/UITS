import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { getAdminReportDates, toggleAdminReportDate } from '../services/api';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reportDates, setReportDates] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper to format date YYYY-MM-DD local
  const formatYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const currentMonthStr = () => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const fetchDates = async () => {
    try {
      setLoading(true);
      const res = await getAdminReportDates(currentMonthStr());
      const datesMap = {};
      res.data.forEach(item => {
        datesMap[item.date] = true;
      });
      setReportDates(datesMap);
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, [currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const toggleDate = async (day) => {
    const dateStr = formatYMD(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    
    // Optistic UI
    const isSelected = !!reportDates[dateStr];
    setReportDates(prev => ({ ...prev, [dateStr]: !isSelected }));

    try {
      await toggleAdminReportDate(dateStr);
      toast.success(isSelected ? "Kun olib tashlandi" : "Kun qo'shildi");
    } catch (err) {
      // Revert if error
      setReportDates(prev => ({ ...prev, [dateStr]: isSelected }));
      toast.error("Xatolik yuz berdi");
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    // Adjust for Monday start (0: Mon, 6: Sun)
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const blanks = Array.from({ length: startOffset }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isToday = (d) => {
      const td = new Date();
      return td.getDate() === d && td.getMonth() === month && td.getFullYear() === year;
    };

    return (
      <div className="w-full max-w-3xl mx-auto bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white flex items-center gap-3">
              <CalendarIcon className="text-[#007aff]" size={28} />
              Hisobot Kalendari
            </h2>
            <p className="text-gray-500 text-sm mt-1">O'qituvchilar hisobot topshirishi shart bo'lgan kunlarni belgilang.</p>
          </div>
          <div className="flex items-center gap-4 bg-gray-100 dark:bg-white/5 rounded-2xl p-1 shadow-inner">
            <button onClick={prevMonth} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all text-gray-600 dark:text-gray-300 shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <span className="w-32 text-center font-bold text-[#1d1d1f] dark:text-white uppercase tracking-wider text-sm">
              {currentDate.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all text-gray-600 dark:text-gray-300 shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => (
            <div key={day} className="text-center font-bold text-xs uppercase tracking-wider text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#007aff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="aspect-square rounded-2xl bg-gray-50/30 dark:bg-black/10 border border-transparent" />
            ))}
            {days.map(d => {
              const fullDateStr = formatYMD(new Date(year, month, d));
              const isSelected = !!reportDates[fullDateStr];
              const today = isToday(d);

              return (
                <div
                  key={d}
                  onClick={() => toggleDate(d)}
                  className={`
                    aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 select-none
                    ${isSelected 
                      ? 'bg-gradient-to-br from-[#007aff] to-[#005bb5] text-white shadow-lg shadow-[#007aff]/30 scale-105 border border-[#005bb5]' 
                      : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#1d1d1f] dark:text-white hover:bg-gray-50 hover:scale-105 dark:hover:bg-white/10'}
                  `}
                >
                  <span className={`text-xl font-bold ${today && !isSelected ? 'text-[#007aff] underline decoration-2 underline-offset-4' : ''}`}>
                    {d}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 size={14} className="text-blue-200" />
                    </div>
                  )}

                  {isSelected && (
                    <span className="text-[10px] font-medium text-blue-100 uppercase tracking-widest mt-1">
                      Hisobot
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-tight">
          Hisobotlar boshqaruvi
        </h1>
        <p className="text-[15px] text-gray-500 mt-1.5 flex items-center gap-2">
          <FileText size={16} /> Markaz bo'yicha onlayn hisobot tartibi
        </p>
      </div>

      {renderCalendar()}
    </div>
  );
};

export default AdminReports;
