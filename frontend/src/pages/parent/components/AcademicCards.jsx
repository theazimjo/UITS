import React from 'react';
import { Award, BookOpen, User, Calendar, History, Phone, Clock, MapPin } from 'lucide-react';

export const ExamCard = ({ exam }) => {
  const hasPercentage = exam.percentage !== undefined && exam.percentage !== null;
  const scorePercent = hasPercentage ? Number(exam.percentage) : 0;
  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  
  const examDate = exam.date ? new Date(exam.date) : (exam.month ? new Date(exam.month + '-01') : null);
  const monthLabel = examDate ? monthNames[examDate.getMonth()] : 'Noma\'lum';
  
  const isPassed = exam.status ? (exam.status === "O'tdi" || exam.status === "Pass") : (hasPercentage && scorePercent >= 60);
  const statusLabel = exam.status || (hasPercentage ? (isPassed ? "O'tdi" : "O'tmadi") : 'Kutilmoqda');

  return (
    <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-1000 scale-150 -rotate-12 translate-x-4 -translate-y-4">
        <Award size={120} className="text-blue-500" />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] leading-none mb-2">Imtihon oyi</span>
            <span className={`text-[15px] font-black uppercase tracking-tight py-1 px-3 rounded-xl ${examDate ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
              {monthLabel} {examDate ? examDate.getFullYear() : ''}
            </span>
          </div>
          <div className="relative">
             <div className={`absolute inset-0 blur-2xl opacity-20 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
             <div className={`relative text-[36px] font-black tabular-nums tracking-tighter ${
                !hasPercentage ? 'text-gray-400' :
                isPassed ? 'text-emerald-500' : 'text-rose-500'
             }`}>
                {hasPercentage ? `${Math.round(scorePercent)}%` : 'N/A'}
             </div>
          </div>
        </div>
        
        <h4 className="text-[20px] font-black mb-8 line-clamp-2 pr-12 leading-tight tracking-tight text-gray-800 dark:text-gray-100">
          {exam.group?.name || 'Umumiy imtihon'}
        </h4>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 transition-colors group-hover:bg-white dark:group-hover:bg-white/10">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5 opacity-60">Nazariy Bilim</p>
              <p className="text-[18px] font-black text-gray-800 dark:text-gray-100">{exam.theoryScore || 0}</p>
           </div>
           <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 transition-colors group-hover:bg-white dark:group-hover:bg-white/10">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5 opacity-60">Amaliy Mashq</p>
              <p className="text-[18px] font-black text-gray-800 dark:text-gray-100">{exam.practiceScore || 0}</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden shadow-inner p-[2px]">
          <div
            className={`h-full rounded-full transition-all duration-1000 relative ${
              !hasPercentage ? 'bg-gray-200' :
              isPassed ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${scorePercent}%` }}
          >
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {exam.note && (
          <div className="bg-amber-50/40 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100/50 border-dashed">
            <p className="text-[13px] text-amber-700 dark:text-amber-400 font-medium italic leading-relaxed">
              "{exam.note}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/10">
          <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">
            Xulosa:
          </p>
          <span className={`text-[13px] font-black px-6 py-2 rounded-full uppercase tracking-tighter shadow-sm border-2 ${
            !hasPercentage ? 'bg-gray-50 text-gray-400 border-gray-200' :
            isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-500/50' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-500/50'
          }`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ProgressReportCard = ({ report, QuoteIcon }) => {
  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const date = report.date ? new Date(report.date) : null;
  const dateStr = date ? `${date.getDate()} ${monthNames[date.getMonth()]}` : 'Sana yo\'q';

  return (
    <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm relative group overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Dars sanasi</span>
            <span className="text-[14px] font-black text-purple-500 dark:text-purple-400">
              {dateStr}
            </span>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-2 pr-6 rounded-full border border-gray-100 dark:border-white/5 shadow-inner group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center border border-purple-200 dark:border-purple-500/20 shadow-sm">
            <User size={18} className="text-purple-500" />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-0.5">Report muallifi</p>
            <p className="text-[13px] font-black text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{report.teacher?.name || 'O\'qituvchi'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-2">
        <div className="relative">
          <QuoteIcon className="absolute -top-6 -left-4 text-purple-500/10 w-16 h-16 rotate-180" />
          <p className="text-[17px] text-gray-800 dark:text-gray-100 leading-relaxed font-semibold italic pl-6 pb-6 relative z-10">
            {report.comment || 'Ushbu dars uchun o\'qituvchi tomonidan izoh qoldirilmagan.'}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)] animate-pulse"></div>
            <span className="text-[12px] font-black text-gray-800 dark:text-white uppercase tracking-wider truncate max-w-[200px]">{report.group?.name || 'Umumiy dars'}</span>
        </div>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">O'zlashtirish</span>
      </div>
    </div>
  );
};

export const EducationCard = ({ enrollment }) => (
  <div className="bg-white dark:bg-white/5 p-8 rounded-[3.5rem] border-2 border-blue-500/10 shadow-2xl shadow-blue-500/5 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition-all"></div>
    
    <div className="flex flex-col gap-8 relative z-10">
      {/* Top Section: Course & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 group-hover:scale-110 transition-all duration-500">
            <BookOpen size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[24px] md:text-[28px] font-black tracking-tighter text-gray-900 dark:text-white leading-tight">
              {enrollment.group?.course?.name || 'Yo\'nalish nomi'}
            </h4>
            <span className="inline-block text-[11px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-blue-100 dark:border-blue-500/20">
              {enrollment.group?.name}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[12px] font-black text-emerald-500 uppercase tracking-widest">Faol ta'lim</span>
        </div>
      </div>

      {/* Middle Section: Instructor & Room */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 group-hover:bg-white dark:group-hover:bg-white/10 transition-all">
        <div className="space-y-3">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Kurs Instruktori</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User size={14} className="text-blue-600" />
              </div>
              <span className="text-[15px] font-black text-gray-700 dark:text-gray-200">{enrollment.group?.teacher?.name || 'Tugallanmagan'}</span>
            </div>
            {enrollment.group?.teacher?.phone && (
              <a href={`tel:${enrollment.group.teacher.phone}`} className="flex items-center gap-3 ml-1 group/phone text-emerald-600 hover:text-blue-500 transition-all">
                <Phone size={12} className="group-hover/phone:rotate-12 transition-transform" />
                <span className="text-[13px] font-black tabular-nums">{enrollment.group.teacher.phone}</span>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">Dars Xonasi</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <MapPin size={14} className="text-indigo-600" />
            </div>
            <span className="text-[15px] font-black text-gray-700 dark:text-gray-200">{enrollment.group?.room?.name || 'Xona belgilanmagan'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Schedule & Time */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4 px-2">
        <div className="space-y-2">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
            <Clock size={12} /> Dars Jadvali
          </p>
          <div className="flex flex-wrap gap-2">
            {enrollment.group?.days?.map((day, idx) => (
              <span key={idx} className="px-3 py-1 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] font-black text-blue-500 shadow-sm">
                {day}
              </span>
            ))}
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-[14px] font-black text-gray-700 dark:text-gray-300 tabular-nums">
              {enrollment.group?.startTime} - {enrollment.group?.endTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
          <Calendar size={14} />
          <span className="text-[12px] font-black whitespace-nowrap tabular-nums">Boshlangan: {enrollment.group?.startDate}</span>
        </div>
      </div>
    </div>
  </div>
);
