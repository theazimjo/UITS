import React, { useState, useEffect } from 'react';
import { getTeacherAttendance } from '../../services/api';
import { ClipboardCheck, ChevronLeft, ChevronRight, Loader2, UserCheck, UserX } from 'lucide-react';

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
    setCurrentMonth(d.toISOString().slice(0, 7));
  };

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const [year, month] = currentMonth.split('-').map(Number);
  const monthLabel = `${monthNames[month - 1]} ${year}`;

  // Filter students by group
  const students = data?.students || [];
  const uniqueGroups = [...new Set(students.map(s => s.groupName))];
  const filteredStudents = selectedGroup === 'all' ? students : students.filter(s => s.groupName === selectedGroup);
  const daysInMonth = data?.daysInMonth || 30;

  // Attendance summary
  const totalCells = filteredStudents.reduce((sum, s) => sum + Object.keys(s.attendance || {}).length, 0);
  const presentCells = filteredStudents.reduce((sum, s) => sum + Object.values(s.attendance || {}).filter(v => v === 'present').length, 0);
  const attendanceRate = totalCells > 0 ? Math.round((presentCells / totalCells) * 100) : 0;

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
          <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white min-w-[140px] text-center">{monthLabel}</span>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Filters & Summary */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-[13px] outline-none focus:border-emerald-500 transition-all"
          >
            <option value="all">Barcha guruhlar</option>
            {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 text-[12px]">
              <UserCheck size={14} className="text-emerald-500" />
              <span className="text-gray-600 dark:text-gray-300 font-semibold">{presentCells} kelgan</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <UserX size={14} className="text-red-400" />
              <span className="text-gray-600 dark:text-gray-300 font-semibold">{totalCells - presentCells} kelmagan</span>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[12px] font-black">
              {attendanceRate}%
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-[14px]">Talabalar topilmadi</div>
        ) : (
          /* Attendance Table */
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-200/50 dark:border-white/10">
                    <th className="text-left px-4 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50/80 dark:bg-[#1e1e1e] z-10 min-w-[180px]">
                      Talaba
                    </th>
                    <th className="text-left px-3 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Guruh
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <th key={day} className="text-center px-1 py-3 font-bold text-gray-500 dark:text-gray-400 min-w-[32px]">
                        {day}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[60px]">%</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const att = student.attendance || {};
                    const totalDays = Object.keys(att).length;
                    const presentDays = Object.values(att).filter(v => v === 'present').length;
                    const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

                    return (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 sticky left-0 bg-white/90 dark:bg-[#1e1e1e]/90 z-10">
                          <div className="flex items-center gap-3">
                            {student.photo ? (
                              <img src={student.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">
                                {student.name?.charAt(0)}
                              </div>
                            )}
                            <span className="font-semibold text-[#1d1d1f] dark:text-white truncate max-w-[130px]">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-[11px]">{student.groupName}</td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const status = att[day];
                          return (
                            <td key={day} className="text-center px-1 py-3">
                              {status === 'present' ? (
                                <span className="inline-block w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold leading-6">✓</span>
                              ) : status === 'absent' ? (
                                <span className="inline-block w-6 h-6 rounded-lg bg-red-500/15 text-red-500 text-[10px] font-bold leading-6">✗</span>
                              ) : (
                                <span className="inline-block w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 text-[10px] leading-6">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center px-3 py-3">
                          <span className={`text-[11px] font-black ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
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
  );
};

export default TeacherAttendance;
