import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getTeacherDashboard, getTeacherGroups, getTeacherAttendance } from '../../services/api';
import {
  Users, BookOpen, ClipboardCheck, TrendingUp, Loader2,
  LayoutDashboard, RefreshCw, ChevronLeft, ChevronRight, Layers,
  Calendar, Clock, MapPin, Phone
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';

const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

const PIE_COLORS = ['#2dd4bf', '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ef4444', '#eab308'];
const DOT_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];

/* ──────────────────── Custom Legend (rasmdagidek) ──────────────────── */
const SubjectLegend = ({ items }) => (
  <div className="space-y-2.5 mt-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
        <span className="flex-1 text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
        <span className="text-[13px] font-bold text-gray-900 dark:text-white min-w-[28px] text-right">{item.value}</span>
        <span className={`text-[11px] font-bold min-w-[40px] text-right ${item.pct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {item.pct >= 0 ? '+' : ''}{item.pct}%
        </span>
      </div>
    ))}
  </div>
);

/* ──────────────────── Custom Tooltip for AreaChart ──────────────────── */
const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl p-3 text-left min-w-[130px]">
      <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">{label}</p>
      <p className="text-[15px] font-black text-gray-900 dark:text-white">
        {Number(payload[0]?.value || 0).toLocaleString()}
        <span className="text-[10px] font-medium text-gray-400 ml-1">so'm</span>
      </p>
    </div>
  );
};

/* ──────────────────── Stat Card ──────────────────── */
const StatCard = ({ label, value, unit, icon, color, sub }) => {
  const colors = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'text-blue-500',    border: 'border-blue-100 dark:border-blue-800/30' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500', border: 'border-emerald-100 dark:border-emerald-800/30' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-500',   border: 'border-amber-100 dark:border-amber-800/30' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-500', border: 'border-violet-100 dark:border-violet-800/30' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} ${c.icon}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-[20px] font-black text-gray-900 dark:text-white leading-tight tabular-nums">
          {value}
          {unit && <span className="text-[11px] font-medium text-gray-400 ml-1">{unit}</span>}
        </p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const calendarRef = useRef(null);

  const currentMonth = useMemo(() => selectedDate.slice(0, 7), [selectedDate]);

  useEffect(() => { fetchDashboard(); }, [selectedDate]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, groupsRes, attendanceRes] = await Promise.all([
        getTeacherDashboard(currentMonth).catch(e => { console.error(e); return { data: null }; }),
        getTeacherGroups().catch(e => { console.error(e); return { data: [] }; }),
        getTeacherAttendance(selectedDate).catch(e => { console.error(e); return { data: null }; })
      ]);
      setData(dashRes.data || null);
      setGroups(groupsRes.data || []);
      setAttendanceData(attendanceRes.data || null);
    } catch (err) {
      console.error('Teacher dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeDay = (delta) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + delta);
    setSelectedDate(`${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`);
  };

  const formatSelectedDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekday = dateObj.toLocaleDateString('uz-UZ', { weekday: 'short' });
    const month = dateObj.toLocaleDateString('uz-UZ', { month: 'short' });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${day}-${month}, ${year} (${weekday})`;
  };

  const openCalendar = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    setCalendarMonth(new Date(y, m - 1, 1));
    setShowCalendar(true);
  };

  const getCalendarDays = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    let firstDayIndex = firstDay.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevDaysInMonth - i;
      const prevDate = new Date(year, month - 1, prevDay);
      days.push({ day: prevDay, date: prevDate, isCurrentMonth: false, key: `prev-${prevDay}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ day: i, date: currentDate, isCurrentMonth: true, key: `curr-${i}` });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ day: i, date: nextDate, isCurrentMonth: false, key: `next-${i}` });
    }
    return days;
  };

  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  const isDateSelected = (dateObj) => {
    const formatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return formatted === selectedDate;
  };

  const isDateToday = (dateObj) => {
    const today = new Date();
    return dateObj.getFullYear() === today.getFullYear() &&
           dateObj.getMonth() === today.getMonth() &&
           dateObj.getDate() === today.getDate();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const stats = useMemo(() => [
    { label: 'Faol Guruhlar',   value: data?.totalGroups  || 0, icon: <Layers size={20}/>,        color: 'emerald', sub: "O'quv jarayonidagi guruhlar" },
    { label: 'Jami Talabalar',  value: data?.totalStudents || 0, icon: <Users size={20}/>,          color: 'blue',    sub: "Faol o'quvchilar" },
    { label: 'Kutilgan Tushum', value: (data?.expectedIncome || 0).toLocaleString(), unit: "so'm", icon: <ClipboardCheck size={20}/>, color: 'amber',   sub: "To'liq darslar bo'yicha" },
    { label: 'Oylik Tushum',    value: (data?.monthlyIncome  || 0).toLocaleString(), unit: "so'm", icon: <TrendingUp size={20}/>,    color: 'violet',  sub: "Tasdiqlangan to'lovlar" },
  ], [data]);

  /* ── Area chart data: month labels → short uz names ── */
  const financialTrend = useMemo(() =>
    (data?.financialTrend || []).map(f => ({
      ...f,
      label: f.month ? MONTHS_SHORT[Number(f.month.split('-')[1]) - 1] : f.month,
    })), [data]);

  /* ── Yo'nalishlar tarkibi: group guruh → courseName ── */
  const directionData = useMemo(() => {
    const groups = data?.groups || [];
    const map = {};
    groups.forEach(g => {
      const key = g.courseName || 'Boshqa';
      if (!map[key]) map[key] = { name: key, value: 0 };
      map[key].value += g.studentCount || 0;
    });
    const arr = Object.values(map).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    const total = arr.reduce((s, d) => s + d.value, 0) || 1;
    return arr.map((d, i, all) => ({
      ...d,
      // simple "change vs others" as percentage share
      pct: Math.round((d.value / total) * 100),
    }));
  }, [data]);

  /* average value for area chart reference line label */
  const avgIncome = useMemo(() => {
    const arr = financialTrend.map(d => d.income);
    return arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
  }, [financialTrend]);

  const isGroupToday = (groupDays) => {
    let daysArray = [];
    if (Array.isArray(groupDays)) {
      daysArray = groupDays;
    } else if (typeof groupDays === 'string') {
      daysArray = groupDays.split(',');
    } else {
      return false;
    }
    
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const day = dateObj.getDay();
    const possibleDayNames = {
      0: ['yak', 'ya', 'sun'],
      1: ['dush', 'du', 'mon'],
      2: ['sesh', 'se', 'tue'],
      3: ['chor', 'cho', 'wed'],
      4: ['pay', 'pa', 'thu'],
      5: ['jum', 'ju', 'fri'],
      6: ['shan', 'sha', 'sat']
    }[day] || [];
    
    return daysArray.some(d => {
      const cleanDay = d.trim().toLowerCase();
      return possibleDayNames.some(p => cleanDay.includes(p));
    });
  };

  const todayGroups = useMemo(() => {
    return groups
      .filter(g => {
        if (g.status !== 'ACTIVE' && g.status !== 'WAITING') return false;

        if (g.startDate) {
          const startStr = String(g.startDate).split('T')[0];
          if (selectedDate < startStr) return false;
        }
        if (g.endDate) {
          const endStr = String(g.endDate).split('T')[0];
          if (selectedDate > endStr) return false;
        }

        return isGroupToday(g.days);
      })
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [groups, selectedDate]);

  const getStudentPhotoUrl = (photo) => {
    if (!photo || photo === 'null' || photo === 'undefined') return null;
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
      return photo;
    }
    const cleanPath = photo.startsWith('/') ? photo.slice(1) : photo;
    return `https://schoolmanage.uz/${cleanPath}`;
  };

  const renderAttendanceBadge = (status) => {
    if (status === 'present') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Bugun keldi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Kelmadi
      </span>
    );
  };

  const todayStudents = useMemo(() => {
    const list = [];
    const todayDayNum = parseInt(selectedDate.split('-')[2]);

    // Map student IDs to their attendance status and photo from attendanceData
    const attendanceMap = {};
    if (attendanceData?.students) {
      attendanceData.students.forEach(s => {
        const todayAtt = s.attendance?.[todayDayNum];
        const status = typeof todayAtt === 'object' && todayAtt !== null ? todayAtt.status : todayAtt;
        attendanceMap[s.id] = {
          status: status, // 'present', 'absent', or undefined
          photo: s.photo
        };
      });
    }

    todayGroups.forEach(group => {
      const activeEnrollments = group.enrollments?.filter(e => {
        if (e.status !== 'ACTIVE') return false;
        if (e.joinedDate) {
          const joinedStr = String(e.joinedDate).split('T')[0];
          if (selectedDate < joinedStr) return false;
        }
        return true;
      }) || [];
      activeEnrollments.forEach(e => {
        if (e.student) {
          const attInfo = attendanceMap[e.student.id] || {};
          list.push({
            id: e.student.id,
            name: e.student.name,
            phone: e.student.phone,
            photo: getStudentPhotoUrl(e.student.photo || attInfo.photo),
            groupName: group.name,
            courseName: group.course?.name || 'Noma\'lum',
            time: `${group.startTime || ''} - ${group.endTime || ''}`,
            room: group.room?.name || 'Xona yo\'q',
            attendanceStatus: attInfo.status
          });
        }
      });
    });
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [todayGroups, attendanceData, selectedDate]);

  return (
    <div className="h-full w-full overflow-hidden bg-[#f5f5f7] dark:bg-[#1d1d1f] flex flex-col">

      {/* ── Toolbar ── */}
      <div className="h-14 border-b border-gray-200/50 dark:border-white/10 flex items-center px-6 justify-between shrink-0 bg-white/60 dark:bg-black/40 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#007aff] text-white rounded-lg shadow-sm">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Analytics</p>
            <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-white mt-0.5">Umumiy Ko'rsatkichlar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-1" ref={calendarRef}>
            <button onClick={() => changeDay(-1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-gray-500">
              <ChevronLeft size={16} />
            </button>
            
            <div 
              onClick={openCalendar}
              className="relative flex items-center gap-1.5 px-3 py-1 cursor-pointer hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all select-none"
            >
              <Calendar size={14} className="text-blue-500" />
              <span className="text-[12px] font-bold text-[#1d1d1f] dark:text-white min-w-[150px] text-center">
                {formatSelectedDate(selectedDate)}
              </span>
            </div>

            <button onClick={() => changeDay(1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all text-gray-500">
              <ChevronRight size={16} />
            </button>

            {/* Custom Popover Calendar */}
            {showCalendar && (
              <div className="absolute right-0 top-12 w-[280px] bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-[12px] font-bold text-gray-900 dark:text-white capitalize">
                    {calendarMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                  {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((w, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                      {w}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((item) => {
                    const isSelected = isDateSelected(item.date);
                    const isToday = isDateToday(item.date);
                    return (
                      <button
                        key={item.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          const formatted = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}-${String(item.date.getDate()).padStart(2, '0')}`;
                          setSelectedDate(formatted);
                          setShowCalendar(false);
                        }}
                        className={`
                          h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all relative
                          ${!item.isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
                          ${isSelected 
                            ? 'bg-blue-500 text-white shadow-md font-bold hover:bg-blue-600' 
                            : 'hover:bg-gray-100 dark:hover:bg-white/5'
                          }
                        `}
                      >
                        {item.day}
                        {isToday && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={fetchDashboard}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-7">
        <div className="max-w-[1600px] mx-auto space-y-6 pb-10">

          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-8 h-8 text-[#007aff] animate-spin mb-4" />
              <p className="text-[13px] font-medium text-gray-500">Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
              </div>

              {/* ── Charts Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Area Chart (Moliya dinamikasi / Average Lecture Per Month style) ── */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 flex flex-col">
                  {/* header */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Moliya Dinamikasi</h3>
                    <button className="text-[12px] font-semibold text-blue-500 hover:underline">View All</button>
                  </div>
                

                  <div className="flex-1 min-h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={financialTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
                          </linearGradient>
                          <linearGradient id="incomeGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" strokeOpacity={0.8} />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                          tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                        />
                        <Tooltip content={<AreaTooltip />} />
                        {/* first half teal, second half blue — mimics the two-color look */}
                        <Area
                          type="monotone"
                          dataKey="income"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          fill="url(#incomeGrad)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-center text-[11px] font-semibold text-gray-400 mt-2 tracking-wide">Oylar</p>
                </div>

                {/* ── Donut Chart (Yo'nalishlar tarkibi / Subject Chart style) ── */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 flex flex-col">
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">Yo'nalishlar tarkibi</h3>

                  {/* Donut */}
                  <div className="flex justify-center" style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={directionData.length ? directionData : [{ name: 'Ma\'lumot yo\'q', value: 1 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={directionData.length > 1 ? 3 : 0}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {(directionData.length ? directionData : [{}]).map((_, i) => (
                            <Cell key={i} fill={directionData.length ? PIE_COLORS[i % PIE_COLORS.length] : '#e5e7eb'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.97)', fontSize: 12 }}
                          formatter={(v, n) => [v + ' talaba', n]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend list (like the image) */}
                  <div className="flex-1 overflow-y-auto mt-2">
                    {directionData.length === 0 ? (
                      <p className="text-center text-[12px] text-gray-400 py-4">Guruh ma'lumoti yo'q</p>
                    ) : (
                      <SubjectLegend items={directionData} />
                    )}
                  </div>
                </div>

              </div>

              {/* ── Today's Schedule & Students Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Bugungi Guruhlar (Today's Class Schedule) */}
                <div className="lg:col-span-1 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-[#007aff]/10 text-[#007aff] rounded-lg">
                        <Calendar size={16} />
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Bugungi Darslar</h3>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-md">
                      {todayGroups.length} guruh
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {todayGroups.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-6 text-gray-400">
                        <Calendar className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-[12px] font-semibold">Bugun darslar rejalashtirilmagan</p>
                      </div>
                    ) : (
                      todayGroups.map((group, idx) => (
                        <div
                          key={group.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:border-gray-200 dark:hover:border-white/10 transition-all"
                        >
                          <div className="flex flex-col min-w-[85px]">
                            <span className="text-[12px] font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1">
                              <Clock size={11} className="text-gray-400" />
                              {group.startTime}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {group.endTime} gacha
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                              {group.name}
                            </p>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {group.room?.name || 'Xona yo\'q'}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 text-[10px] font-black bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-md">
                              {group.enrollments?.filter(e => e.status === 'ACTIVE').length || 0} ta
                            </span>
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                DOT_COLORS[idx % DOT_COLORS.length]
                              }`}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bugungi O'quvchilar (Today's Lecture) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        <Users size={16} />
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Bugun Keladigan O'quvchilar</h3>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-md">
                      {todayStudents.length} o'quvchi
                    </span>
                  </div>

                  <div className="flex-1 overflow-auto pr-1">
                    {todayStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-6 text-gray-400">
                        <Users className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-[12px] font-semibold">Bugun keladigan o'quvchilar ro'yxati bo'sh</p>
                      </div>
                    ) : (
                      <div className="min-w-[600px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                              <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">O'quvchi</th>
                              <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Guruh</th>
                              <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kurs</th>
                              <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Dars Vaqti</th>
                              <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Yo'qlama</th>
                              <th className="pb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aloqa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayStudents.map((st) => (
                              <tr
                                key={`${st.id}-${st.groupName}`}
                                className="border-b border-gray-100/50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                              >
                                <td className="py-2.5">
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8 shrink-0">
                                      {st.photo ? (
                                        <img
                                          src={st.photo}
                                          alt=""
                                          className="w-8 h-8 rounded-full object-cover border border-gray-200/50 dark:border-white/10 shadow-sm"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        style={{ display: st.photo ? 'none' : 'flex' }}
                                        className="avatar-fallback w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold text-sm"
                                      >
                                        {st.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">
                                        {st.name}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                                  {st.groupName}
                                </td>
                                <td className="py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                                  {st.courseName}
                                </td>
                                <td className="py-2.5">
                                  <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight">
                                    {st.time}
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                    <MapPin size={9} />
                                    {st.room}
                                  </p>
                                </td>
                                <td className="py-2.5">
                                  {renderAttendanceBadge(st.attendanceStatus)}
                                </td>
                                <td className="py-2.5 text-right">
                                  {st.phone ? (
                                    <a
                                      href={`tel:${st.phone}`}
                                      className="inline-flex items-center justify-center p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                                      title={st.phone}
                                    >
                                      <Phone size={13} />
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 font-medium italic">Raqam yo'q</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
