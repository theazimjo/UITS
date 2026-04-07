import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { ClipboardCheck, ChevronLeft, ChevronRight, Loader2, UserCheck, UserX, Users } from 'lucide-react';

const TeacherAttendance = () => {
  const { students: allStudents, loading, refreshAllRows } = useStore();
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    refreshAllRows();
  }, [currentMonth, refreshAllRows]);

  const changeMonth = (delta) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${year}-${month}`);
  };

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const [year, month] = currentMonth.split('-').map(Number);
  
  const today = new Date();
  const isCurrentMonth = today.toISOString().slice(0, 7) === currentMonth;
  const todayDay = today.getDate();

  const students = allStudents || [];
  const uniqueGroups = [...new Set(students.map(s => s.groupName).filter(Boolean))];
  const filteredStudents = selectedGroup === 'all' ? students : students.filter(s => s.groupName === selectedGroup);
  
  const todayArrived = filteredStudents.filter(s => s.attendance?.[todayDay] === 'present').length;
  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div className="h-full w-full overflow-hidden bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] scroll-smooth">
      
      {/* macOS Title Bar Area */}
      <div className="h-12 border-b border-gray-200/50 dark:border-white/10 flex items-center px-4 justify-between shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center w-32">
          <div className="flex items-center gap-1 text-gray-500 text-[11px] font-medium uppercase tracking-wider">
            <ClipboardCheck size={16} className="text-[#007aff]" /> <span>Davomat</span>
          </div>
        </div>
        <div className="flex-1 text-center font-medium text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate px-4">
          Oylik Davomat Jurnali
        </div>
        <div className="w-32 flex justify-end">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">{new Date().toLocaleDateString('uz-UZ')}</span>
          </div>
        </div>
      </div>

      {/* Control Bar (Month & Group) */}
      <div className="px-6 py-3 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
        <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner">
          <button onClick={() => changeMonth(-1)} className="px-2 py-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-600 dark:text-gray-300">
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 text-[12px] font-bold text-[#1d1d1f] dark:text-white min-w-[140px] text-center">
            {new Date(currentMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} className="px-2 py-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-600 dark:text-gray-300">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/60 dark:bg-black/20 rounded-md border border-gray-200/50 dark:border-white/10 px-3 py-1.5 shadow-sm">
            <Users size={14} className="text-gray-400 mr-2" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-transparent border-none text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] outline-none cursor-pointer pr-4"
            >
              <option value="all" className="bg-white dark:bg-[#1e1e1e] text-[#1d1d1f] dark:text-[#f5f5f7]">Barcha guruhlar</option>
              {uniqueGroups.map(g => (
                <option key={g} value={g} className="bg-white dark:bg-[#1e1e1e] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 relative">
        <div className="max-w-[1400px] mx-auto space-y-6 h-full">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm flex items-center justify-between group overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 text-[#007aff]/5 group-hover:scale-110 transition-transform duration-1000">
                <Users size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1 text-[#007aff]">
                  <Users size={16} />
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">Jami O'quvchilar</p>
                </div>
                <p className="text-2xl font-bold text-[#1d1d1f] dark:text-white leading-tight">
                  {filteredStudents.length} <span className="text-xs font-medium text-gray-400">nafar</span>
                </p>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm flex items-center justify-between group overflow-hidden relative">
               <div className="absolute -right-4 -bottom-4 text-[#34c759]/5 group-hover:scale-110 transition-transform duration-1000">
                <UserCheck size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1 text-[#34c759]">
                  <UserCheck size={16} />
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">Bugun Kelganlar</p>
                </div>
                <p className="text-2xl font-bold text-[#34c759] leading-tight">
                  {isCurrentMonth ? todayArrived : '---'} <span className="text-xs font-medium opacity-60">o'quvchi</span>
                </p>
              </div>
              <div className="relative z-10 text-right">
                 <p className="text-[9px] text-gray-400 uppercase font-black mb-1.5 tracking-tighter">Holat</p>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${isCurrentMonth ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-gray-100 text-gray-400'}`}>
                    {isCurrentMonth ? 'LIVE' : 'OFFLINE'}
                 </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
               <Loader2 className="w-8 h-8 text-[#007aff] animate-spin mb-4" />
               <p className="text-[13px] font-medium text-gray-500">Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white/40 dark:bg-black/10 rounded-xl border border-gray-200/50 dark:border-white/5 border-dashed">
              <UserX size={48} className="text-gray-200 dark:text-gray-700 mb-6" />
              <p className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white">O'quvchilar topilmadi</p>
              <p className="text-[12px] text-gray-500 mt-2">Tanlangan guruh yoki oyda o'quvchilar yo'q</p>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl z-20">
                    <tr>
                      <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px] sticky left-0 bg-gray-100 dark:bg-[#1e1e1e] z-30 min-w-[220px]">
                        Ism-sharif
                      </th>
                      <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px] min-w-[130px]">Guruh</th>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <th 
                          key={day} 
                          className={`text-center px-1 py-3 font-bold min-w-[42px] transition-all relative ${isCurrentMonth && day === todayDay ? 'text-[#007aff] bg-[#007aff]/5' : ''}`}
                        >
                          <span className="text-[11px]">{day}</span>
                          {isCurrentMonth && day === todayDay && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#007aff]" />
                          )}
                        </th>
                      ))}
                      <th className="px-5 py-3 font-medium uppercase tracking-wider text-[11px] text-center sticky right-0 bg-gray-100 dark:bg-[#1e1e1e] z-30 min-w-[70px]">FOIZ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {filteredStudents.map((student) => {
                      const att = student.attendance || {};
                      const totalDays = Object.keys(att).length;
                      const presentDays = Object.values(att).filter(v => v === 'present').length;
                      const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

                      return (
                        <tr key={student.id} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group text-left">
                          <td className="px-5 py-3 sticky left-0 bg-white/95 dark:bg-[#1e1e1e]/95 z-10 group-hover:bg-[#007aff]/5 transition-colors border-r border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                              {student.photo ? (
                                <img src={student.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200/50 shadow-sm" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[11px] font-bold text-gray-500">
                                  {student.name?.substring(0, 1)}
                                </div>
                              )}
                              <Link 
                                to={`/teacher/students/${student.id}`}
                                className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate max-w-[150px] hover:text-[#007aff] hover:underline transition-colors"
                              >
                                {student.name}
                              </Link>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-500 text-[12px]">{student.groupName}</td>
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const status = att[day];
                            const isToday = isCurrentMonth && day === todayDay;
                            return (
                              <td key={day} className={`text-center px-0.5 py-3 ${isToday ? 'bg-[#007aff]/[0.02]' : ''}`}>
                                {status === 'present' ? (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-md bg-[#34c759] text-white flex items-center justify-center text-[10px] font-black shadow-[0_2px_8px_rgba(52,199,89,0.3)]">✓</div>
                                  </div>
                                ) : status === 'absent' ? (
                                  <div className="flex justify-center">
                                    <div className="w-6 h-6 rounded-md bg-[#ff3b30] text-white flex items-center justify-center text-[10px] font-black shadow-[0_2px_8px_rgba(255,59,48,0.3)]">✗</div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/10 text-gray-400 flex items-center justify-center text-[10px]">—</div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-5 py-3 text-center sticky right-0 bg-white/95 dark:bg-[#1e1e1e]/95 z-10 group-hover:bg-[#007aff]/5 transition-colors border-l border-gray-100 dark:border-white/5 font-bold">
                            <span className={`${pct >= 80 ? 'text-[#34c759]' : pct >= 50 ? 'text-[#ff9500]' : 'text-[#ff3b30]'} text-[11px]`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
