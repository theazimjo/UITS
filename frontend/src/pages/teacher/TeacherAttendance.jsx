import React, { useState, useEffect } from 'react';
import { getTeacherAttendance } from '../../services/api';
import { ClipboardCheck, ChevronLeft, ChevronRight, Loader2, UserCheck, UserX, Users, Info } from 'lucide-react';

const TeacherAttendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await getTeacherAttendance(`${currentMonth}-01`);
      setData(res.data);
    } catch (err) {
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${year}-${month}`);
  };

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const [year, month] = currentMonth.split('-').map(Number);
  const monthLabel = `${monthNames[month - 1]} ${year}`;

  const today = new Date();
  const isCurrentMonth = today.toISOString().slice(0, 7) === currentMonth;
  const todayDay = today.getDate();

  // Statistics
  const students = data?.students || [];
  const uniqueGroups = [...new Set(students.map(s => s.groupName))];
  const filteredStudents = selectedGroup === 'all' ? students : students.filter(s => s.groupName === selectedGroup);
  const daysInMonth = data?.daysInMonth || 30;

  const totalCells = filteredStudents.reduce((sum, s) => sum + Object.keys(s.attendance || {}).length, 0);
  const presentCells = filteredStudents.reduce((sum, s) => sum + Object.values(s.attendance || {}).filter(v => v === 'present').length, 0);
  const attendanceRate = totalCells > 0 ? Math.round((presentCells / totalCells) * 100) : 0;

  const todayArrived = filteredStudents.filter(s => s.attendance?.[todayDay] === 'present').length;

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      {/* Toolbar */}
      <div className="min-h-[56px] flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm">
            <ClipboardCheck size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Davomat</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Oylik davomat hisoboti</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white min-w-[140px] text-center uppercase tracking-tight">{monthLabel}</span>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-premium bg-[#f5f5f7]/50 dark:bg-[#1d1d1f]/50">
        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Jami O'quvchilar</p>
            </div>
            <p className="text-3xl font-black text-[#1d1d1f] dark:text-white leading-none">
              {filteredStudents.length}
              <span className="text-xs font-bold text-gray-400 ml-2">nafar</span>
            </p>
          </div>

          <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                <UserCheck size={20} />
              </div>
              <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Bugun Kelganlar</p>
            </div>
            <p className="text-3xl font-black text-emerald-500 leading-none">
              {isCurrentMonth ? todayArrived : '—'}
              <span className="text-xs font-bold opacity-60 ml-2">o'quvchi</span>
            </p>
            <div className={`absolute right-4 bottom-4 w-2 h-2 rounded-full animate-pulse bg-emerald-500 ${!isCurrentMonth && 'hidden'}`} />
          </div>

          <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-500 flex items-center gap-4">
             <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                <Info size={20} />
             </div>
             <div className="flex-1">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guruhni Tanlash</p>
               <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-transparent border-none text-[15px] font-black outline-none cursor-pointer text-[#1d1d1f] dark:text-white"
                >
                  <option value="all">Barcha guruhlar</option>
                  {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/10 shadow-inner">
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserX size={40} className="text-gray-200 dark:text-gray-700" />
            </div>
            <p className="text-[16px] text-gray-400 font-bold tracking-tight">Hozircha talabalar ro'yxati bo'sh</p>
          </div>
        ) : (
          /* Attendance Table */
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-[40px] border border-gray-200/50 dark:border-white/10 shadow-2xl overflow-hidden hover:border-emerald-500/20 transition-colors duration-700">
            <div className="overflow-x-auto scrollbar-premium">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/2 border-b border-gray-200/50 dark:border-white/10">
                    <th className="text-left px-8 py-6 font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] sticky left-0 bg-gray-50/80 dark:bg-[#1e1e1e] z-10 min-w-[240px] backdrop-blur-md">
                      Talaba Ismi
                    </th>
                    <th className="text-left px-4 py-6 font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] min-w-[140px]">
                      Guruh
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <th 
                        key={day} 
                        className={`text-center px-1 py-6 font-black min-w-[40px] transition-all relative ${isCurrentMonth && day === todayDay ? 'text-emerald-500' : 'text-gray-400'}`}
                      >
                        {day}
                        {isCurrentMonth && day === todayDay && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                        )}
                      </th>
                    ))}
                    <th className="text-center px-6 py-6 font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] min-w-[80px]">Davomat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const att = student.attendance || {};
                    const totalDays = Object.keys(att).length;
                    const presentDays = Object.values(att).filter(v => v === 'present').length;
                    const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

                    return (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300 group">
                        <td className="px-8 py-4 sticky left-0 bg-white/95 dark:bg-[#1e1e1e]/95 z-10 group-hover:bg-gray-50 dark:group-hover:bg-white/5 transition-colors border-r border-gray-100 dark:border-white/5 backdrop-blur-md">
                          <div className="flex items-center gap-4">
                            {student.photo ? (
                              <img src={student.photo} alt="" className="w-10 h-10 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[12px] font-black shadow-lg group-hover:scale-110 transition-transform duration-500">
                                {student.name?.charAt(0)}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[#1d1d1f] dark:text-white truncate max-w-[160px] tracking-tight text-[13px]">{student.name}</span>
                                <span className="text-[10px] text-gray-400 font-medium">ID: {student.externalId || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400 text-[11px] font-bold tracking-tight uppercase opacity-60">{student.groupName}</td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const status = att[day];
                          const isToday = isCurrentMonth && day === todayDay;
                          return (
                            <td key={day} className={`text-center px-0.5 py-4 ${isToday ? 'bg-emerald-500/[0.03]' : ''}`}>
                              {status === 'present' ? (
                                <div className="flex justify-center">
                                  <div className="w-7 h-7 rounded-[10px] bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-[0_4px_12px_rgba(16,185,129,0.3)] scale-100 group-hover:scale-110 transition-transform">✓</div>
                                </div>
                              ) : status === 'absent' ? (
                                <div className="flex justify-center">
                                  <div className="w-7 h-7 rounded-[10px] bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-[0_4px_12px_rgba(244,63,94,0.3)] scale-100 group-hover:scale-110 transition-transform">✗</div>
                                </div>
                              ) : (
                                <div className="flex justify-center opacity-10">
                                  <div className="w-7 h-7 rounded-[10px] bg-gray-200 dark:bg-white/10 text-gray-400 flex items-center justify-center text-[10px] leading-6">—</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center px-6 py-4">
                          <div className={`text-[10px] font-black inline-block px-3 py-1 rounded-full ${pct >= 80 ? 'bg-emerald-500/10 text-emerald-600' : pct >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'}`}>
                            {pct}%
                          </div>
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
  );
};

export default TeacherAttendance;
