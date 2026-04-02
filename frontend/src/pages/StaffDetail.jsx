import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Phone, CreditCard, BookOpen,
  ChevronLeft, Calendar, Clock, MapPin, Trash2,
  Users, Search, CheckCircle2, AlertCircle,
  ChevronRight, Percent, TrendingUp, Wallet
} from 'lucide-react';
import { getStaffById, deleteStaff, getStaffSalary } from '../services/api';

const StaffDetail = ({ fetchStaff }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryData, setSalaryData] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const staffRes = await getStaffById(id);
        setStaff(staffRes.data);

        setSalaryLoading(true);
        const salaryRes = await getStaffSalary(id, currentMonth);
        setSalaryData(salaryRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
        setSalaryLoading(false);
      }
    };
    fetchData();
  }, [id, currentMonth]);

  const handleMonthChange = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + direction);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
  };

  const handleDelete = async () => {
    if (window.confirm("Haqiqatdan ham bu xodimni o'chirmoqchimisiz?")) {
      await deleteStaff(id);
      fetchStaff();
      navigate('/staff');
    }
  };

  const allStudents = staff?.groups?.filter(group => {
    // Xodim O'qituvchi bo'lsa, tanlangan oydagi dars bergan guruhlarini aniq fazalar orqali aniqlaymiz:
    if (staff.role?.name === 'TEACHER') {
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const mStart = new Date(year, monthNum - 1, 1);
      const mEnd = new Date(year, monthNum, 0);

      // Phases orqali tekshirish: Ushbu xodim shu oylarda dars berganmi?
      return group.phases?.some(p => {
        if (p.teacher?.id !== staff.id) return false;
        const pStart = new Date(p.startDate);
        
        // Agar phase-da tugash sanasi bo'lmasa, guruhning tugash sanasiga qaraymiz:
        const effectiveEndDate = p.endDate || group.endDate;
        const pEnd = effectiveEndDate ? new Date(effectiveEndDate) : new Date(8640000000000000);
        
        return pStart <= mEnd && pEnd >= mStart;
      });
    }
    return true; 
  }).flatMap(group =>
    group.enrollments?.filter(enrollment => {
      const joinedDate = new Date(enrollment.joinedDate);
      const joinedMonth = joinedDate.toISOString().substring(0, 7);
      
      // 1-shart: O'quvchi ushbu tanlangan oydan keyin qo'shilmagan bo'lishi kerak
      if (joinedMonth > currentMonth) return false;
      
      // 2-shart: Agar guruh o'tkazilgan bo'lsa, o'quvchi bu o'qituvchi ketishidan oldin qo'shilgan bo'lishi kerak
      const teacherPhases = group.phases?.filter(p => p.teacher?.id === staff.id) || [];
      if (teacherPhases.length > 0) {
        const taughtThisStudent = teacherPhases.some(phase => {
          const pEnd = phase.endDate ? new Date(phase.endDate) : new Date(8640000000000000);
          return joinedDate <= pEnd;
        });
        if (!taughtThisStudent) return false;
      } else if (group.teacher?.id !== staff.id) {
         // Agar phase yo'q bo'lsa va hozirgi o'qituvchisi bu odam bo'lmasa, demak eski baza va xato
         // Lekin agar oldin o'qitgan bo'lsa-yu, phase yozilmagan bo'lsa, shunchaki true qaytaramiz
      }

      // 3-shart: Chiqib ketgan yoki bitirgan o'quvchilarni faqat o'qigan oylarida ko'rsatish
      if (enrollment.status !== 'ACTIVE' && enrollment.updatedAt) {
        const leftMonth = new Date(enrollment.updatedAt).toISOString().substring(0, 7);
        if (currentMonth > leftMonth) return false;
      }

      // 4-shart: Guruh tugagan bo'lsa, keyingi oylarda o'quvchini yashirish
      if (group.endDate) {
        const endMonth = group.endDate.substring(0, 7);
        if (currentMonth > endMonth) return false;
      }

      return true;
    }).map(enrollment => ({
      ...enrollment.student,
      groupName: group.name,
      enrollmentStatus: enrollment.status,
      isPaid: group.payments?.some(p => p.student?.id === enrollment.student?.id && p.month === currentMonth),
      lastPayment: group.payments?.filter(p => p.student?.id === enrollment.student?.id)
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]
    }))
  ).filter(Boolean) || [];

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStudentsCount = allStudents.filter(s => s.enrollmentStatus === 'ACTIVE').length;

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000]">
      <div className="w-8 h-8 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!staff) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Xodim topilmadi</h2>
        <button onClick={() => navigate('/staff')} className="text-[#007aff] hover:underline">Orqaga qaytish</button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      <div className="flex-1 w-full h-full flex flex-col">
        <div className="h-12 bg-white/40 dark:bg-[#2d2d2d]/60 backdrop-blur-md border-b border-gray-200/50 dark:border-black/50 flex items-center px-4 justify-between shrink-0">
          <div className="w-20"></div>
          <div className="flex-1 text-center font-medium text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate px-4">
            {staff.name} — Ma'lumotlar
          </div>
          <div className="flex justify-end w-20">
            <button onClick={handleDelete} className="text-gray-500 hover:text-[#ff3b30] dark:text-gray-400 dark:hover:text-[#ff453a] transition-colors" title="O'chirish">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/staff')} className="p-1.5 rounded-md bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border border-gray-200/50 dark:border-white/10 shadow-sm text-gray-700 dark:text-gray-300 transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-medium shadow-sm text-sm">
                {staff.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">{staff.name}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{staff.role?.name || 'Lavozim yo\'q'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner">
              {[
                { id: 'overview', label: "Asosiy" },
                { id: 'students', label: "O'quvchilar", count: allStudents.length },
                { id: 'salary', label: "Maosh" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-1.5 text-[13px] font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === tab.id
                    ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-black/10 dark:bg-white/20' : 'bg-black/5 dark:bg-white/10'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Unified Month Picker */}
            <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner">
              <button onClick={() => handleMonthChange(-1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-500 hover:text-black"><ChevronLeft size={16} /></button>
              <span className="px-4 text-[12px] font-bold min-w-[110px] text-center uppercase tracking-tight">{getMonthName(currentMonth)}</span>
              <button onClick={() => handleMonthChange(1)} className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-500 hover:text-black"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 text-[#1d1d1f] dark:text-[#f5f5f7] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 shadow-sm">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">Shaxsiy ma'lumotlar</h3>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#007aff]/10 text-[#007aff] rounded-lg"><Phone size={18} /></div>
                        <div>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400">Telefon</p>
                          <p className="text-[14px] font-medium">{staff.phone || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#34c759]/10 text-[#34c759] rounded-lg"><CreditCard size={18} /></div>
                        <div>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400">Maosh turi</p>
                          <p className="text-[14px] font-medium">{staff.salaryType === 'FIXED' ? 'Fiks (Oylik)' : staff.salaryType === 'KPI' ? 'KPI (%)' : 'Aralash'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm text-center">
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">Guruhlar</p>
                      <p className="text-2xl font-semibold">{staff.groups?.length || 0}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm text-center">
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-1">O'quvchilar</p>
                      <p className="text-2xl font-semibold">{activeStudentsCount}</p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-white/10 shadow-sm min-h-full">
                    <h3 className="text-base font-semibold mb-6">Biriktirilgan guruhlar</h3>
                    {staff.groups?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {staff.groups.map(g => (
                          <div key={g.id} onClick={() => navigate(`/groups/${g.id}`)} className="p-5 bg-white/70 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="text-[#007aff]"><BookOpen size={18} /></div>
                                <h4 className="font-medium text-[15px]">{g.name}</h4>
                              </div>
                              <div className={`w-2.5 h-2.5 rounded-full ${g.status === 'ACTIVE' ? 'bg-[#34c759]' : g.status === 'WAITING' ? 'bg-[#ffcc00]' : 'bg-gray-400'}`} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{g.course?.name || 'Umumiy'}</p>

                            <div className="space-y-2 text-[13px] text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="opacity-50" />
                                <span>{g.days.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="opacity-50" />
                                <span>{g.startTime} — {g.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="opacity-50" />
                                <span>{g.room?.name || 'Belgilanmagan'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <BookOpen size={32} className="mb-3 opacity-40" />
                        <p className="text-[14px]">Guruhlar biriktirilmagan</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SALARY TAB */}
            {activeTab === 'salary' && (
              <div className="space-y-8 animate-fade-in">
                {/* macOS Finder-like Toolbar for Month Selection */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Maosh hisoblagich</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Guruhlar tushumi</p>
                    <h3 className="text-2xl font-semibold">{(salaryData?.totalRevenue || 0).toLocaleString()} <span className="text-xs text-gray-400 font-normal">UZS</span></h3>
                  </div>

                  {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && (
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">KPI ({staff.kpiPercentage}%)</p>
                      <h3 className="text-2xl font-semibold text-[#007aff]">{(salaryData?.totalKpi || 0).toLocaleString()} <span className="text-xs text-gray-400 font-normal">UZS</span></h3>
                    </div>
                  )}

                  {(staff.salaryType === 'FIXED' || staff.salaryType === 'MIXED') && (
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">O'zgarmas oylik</p>
                      <h3 className="text-2xl font-semibold text-gray-500">{(salaryData?.fixedAmount || 0).toLocaleString()} <span className="text-xs text-gray-400 font-normal">UZS</span></h3>
                    </div>
                  )}

                  <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/20 shadow-sm">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1.5 font-bold uppercase tracking-wider">Jami maosh</p>
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{(salaryData?.totalSalary || 0).toLocaleString()} <span className="text-xs font-normal">UZS</span></h3>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-[14px]">
                    <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10">
                      <tr>
                        <th className="px-6 py-4 font-medium">Guruh nomi</th>
                        <th className="px-6 py-4 font-medium">O'quvchilar</th>
                        <th className="px-6 py-4 font-medium">Guruh tushumi</th>
                        {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && (
                          <th className="px-6 py-4 font-medium text-right">O'qituvchi ulushi (KPI)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                      {salaryData?.groupBreakdown?.length > 0 ? salaryData.groupBreakdown.map((group) => (
                        <tr key={group.groupId} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium">{group.groupName}</td>
                          <td className="px-6 py-4 text-gray-500">{group.students} ta</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(group.students * group.coursePrice).toLocaleString()} UZS</td>
                          {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && (
                            <td className="px-6 py-4 font-medium text-[#007aff] text-right">{group.kpiSalary.toLocaleString()} UZS</td>
                          )}
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-10 text-center text-gray-400 text-[13px]">Ushbu oyda ma'lumot yo'q</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
              <div className="h-full flex flex-col space-y-6 animate-fade-in">
                {/* Finder Search Bar & Month Picker */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Izlash..."
                      className="w-full pl-9 pr-4 py-2 bg-white/70 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 backdrop-blur-md shadow-inner"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Students List Table */}
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex-1">
                  <div className="overflow-x-auto h-full">
                    <table className="w-full text-left text-[14px]">
                      <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl">
                        <tr>
                          <th className="px-6 py-3.5 font-medium">O'quvchi</th>
                          <th className="px-6 py-3.5 font-medium">Guruh</th>
                          <th className="px-6 py-3.5 font-medium">Holati</th>
                          <th className="px-6 py-3.5 font-medium">To'lov holati</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                        {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
                          <tr key={`${student.id}-${idx}`} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-default">
                            <td className="px-6 py-3.5">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-[12px] text-gray-500 mt-1">{student.phone}</div>
                            </td>
                            <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{student.groupName}</td>
                            <td className="px-6 py-3.5">
                              {student.enrollmentStatus === 'ACTIVE'
                                ? <span className="inline-block px-2.5 py-1 bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20 rounded-md text-[11px] font-medium">Faol</span>
                                : <span className="inline-block px-2.5 py-1 bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/20 rounded-md text-[11px] font-medium">Ketgan</span>
                              }
                            </td>
                            <td className="px-6 py-3.5">
                              {student.isPaid ? (
                                <div className="flex items-center gap-2 text-[#34c759]">
                                  <CheckCircle2 size={16} /> <span className="text-[13px]">To'langan</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-[#ff3b30]">
                                  <AlertCircle size={16} /> <span className="text-[13px]">To'lanmagan</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                              <Users size={28} className="mx-auto mb-3 opacity-30" />
                              <p className="text-[13px]">Ma'lumot topilmadi</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffDetail;