import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { getGroupPayments } from '../../services/api';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  Loader2, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRightLeft,
  Search,
  X,
  History,
  Info,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusMap = {
  ACTIVE: { label: "Faol", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  WAITING: { label: "Kutilmoqda", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  COMPLETED: { label: "Tugallangan", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  CANCELLED: { label: "Bekor qilingan", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

const TeacherGroups = () => {
  const { groups: allGroups, loading, refreshAllRows } = useStore();
  const [activeTab, setActiveTab] = useState('faol'); // faol, tugatgan, otkazilgan
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('students'); // students, history
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [groupPayments, setGroupPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    refreshAllRows();
  }, [refreshAllRows]);

  const activeEnrollments = (group) => group?.enrollments?.filter(e => e.status === 'ACTIVE') || [];

  const groups = allGroups || [];
  const filteredGroups = groups.filter(g => {
    const matchesSearch = (g.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (g.course?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'faol') {
      return !g.isTransferred && (g.status === 'ACTIVE' || g.status === 'WAITING');
    }
    if (activeTab === 'tugatgan') {
      return !g.isTransferred && g.status === 'COMPLETED';
    }
    if (activeTab === 'otkazilgan') {
      return g.isTransferred;
    }
    return true;
  });

  const getTabCount = (tab) => {
    if (tab === 'faol') return groups.filter(g => !g.isTransferred && (g.status === 'ACTIVE' || g.status === 'WAITING')).length;
    if (tab === 'tugatgan') return groups.filter(g => !g.isTransferred && g.status === 'COMPLETED').length;
    if (tab === 'otkazilgan') return groups.filter(g => g.isTransferred).length;
    return 0;
  };

  const openDetail = (group) => {
    setSelectedGroup(group);
    setIsDrawerOpen(true);
    fetchPayments(group.id, selectedMonth);
  };

  const fetchPayments = async (groupId, month) => {
    setPaymentsLoading(true);
    try {
      const res = await getGroupPayments(groupId, month);
      setGroupPayments(res.data || []);
    } catch (err) {
      console.error('Payments fetch error:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
    if (selectedGroup) fetchPayments(selectedGroup.id, newMonth);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
    if (selectedGroup) fetchPayments(selectedGroup.id, newMonth);
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f] relative overflow-hidden">
      {/* Header & Sub-header */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-[19px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Guruhlarim</h2>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">O'quv jarayonini boshqarish</p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100/50 dark:bg-white/5 border-none rounded-xl text-[13px] focus:ring-2 focus:ring-emerald-500/50 transition-all outline-none text-[#1d1d1f] dark:text-white"
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pb-0 flex gap-8">
          {[
            { id: 'faol', label: 'Faol', icon: CheckCircle2 },
            { id: 'tugatgan', label: 'Tugatgan', icon: Users },
            { id: 'otkazilgan', label: 'O\'tkazilgan', icon: ArrowRightLeft },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 flex items-center gap-2 transition-all group`}
              >
                <tab.icon size={14} className={isActive ? 'text-emerald-500' : 'text-gray-400'} />
                <span className={`text-[13px] font-semibold ${isActive ? 'text-[#1d1d1f] dark:text-white' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                  {tab.label}
                </span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                    {count}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-premium">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-[13px] text-gray-400 font-medium">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4">
              <BookOpen className="text-gray-300 dark:text-gray-600" size={32} />
            </div>
            <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white mb-2">Guruhlar topilmadi</h3>
            <p className="text-[13px] text-gray-400 max-w-xs">Bu bo'limda hozircha hech qanday ma'lumot yo'q.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGroups.map((group) => {
              const active = activeEnrollments(group);
              const st = statusMap[group.status] || statusMap.ACTIVE;

              return (
                <div 
                  key={group.id} 
                  onClick={() => openDetail(group)}
                  className="group bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[28px] border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white truncate tracking-tight">{group.name}</h3>
                        </div>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {group.course?.name || 'Kurs belgilanmagan'}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold whitespace-nowrap shadow-sm ${group.isTransferred ? 'bg-blue-500/10 text-blue-500 border border-blue-500/10' : st.color}`}>
                        {group.isTransferred ? "O'tkazilgan" : st.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Users size={14} className="text-emerald-500" />
                          <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Talaba</span>
                        </div>
                        <span className="text-[15px] font-bold text-[#1d1d1f] dark:text-white">{active.length} ta</span>
                      </div>
                      <div className="p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Vaqt</span>
                        </div>
                        <span className="text-[13px] font-bold text-[#1d1d1f] dark:text-white">{group.startTime || '--:--'} - {group.endTime || '--:--'}</span>
                      </div>
                      <div className="p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Calendar size={14} className="text-amber-500" />
                          <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Kunlar</span>
                        </div>
                        <span className="text-[13px] font-bold text-[#1d1d1f] dark:text-white truncate">{group.days?.join(', ') || 'Belgilanmagan'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium italic">
                        Batafsil ko'rish uchun bosing
                      </div>
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL DRAWER */}
      {isDrawerOpen && (
        <>
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 animate-in fade-in duration-300" 
            onClick={() => setIsDrawerOpen(false)} 
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-[450px] bg-white dark:bg-[#1c1c1e] z-40 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-white/10">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[18px] font-bold shadow-lg shadow-emerald-500/20">
                  {selectedGroup?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">{selectedGroup?.name}</h3>
                  <p className="text-[12px] text-gray-500 font-medium">Guruh Tafsilotlari</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-white/5 bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-white/5">
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status</p>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${selectedGroup?.isTransferred ? 'bg-blue-500/10 text-blue-500' : (statusMap[selectedGroup?.status]?.color || 'bg-gray-100 text-gray-500')}`}>
                  {selectedGroup?.isTransferred ? "O'tkazilgan" : (statusMap[selectedGroup?.status]?.label || selectedGroup?.status)}
                </span>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Darslar</p>
                <span className="text-[13px] font-bold text-[#1d1d1f] dark:text-white">{selectedGroup?.startTime || '--:--'} - {selectedGroup?.endTime || '--:--'}</span>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-gray-100 dark:border-white/5">
              {[
                { id: 'students', label: 'O\'quvchilar', icon: Users },
                { id: 'history', label: 'Tarix', icon: History }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all relative ${drawerTab === tab.id ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {drawerTab === tab.id && (
                    <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Month Selector inside Drawer Content for Students tab */}
            {drawerTab === 'students' && (
              <div className="px-6 py-3 bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Oy Tanlash</span>
                <div className="flex items-center gap-4 bg-white dark:bg-black/20 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-white/5">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all">
                    <ChevronLeft size={16} className="text-gray-400" />
                  </button>
                  <span className="text-[12px] font-bold text-[#1d1d1f] dark:text-white min-w-[100px] text-center">
                    {new Date(selectedMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all">
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-premium">
              {drawerTab === 'students' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Guruh Tarkibi</span>
                    {paymentsLoading && <Loader2 size={14} className="animate-spin text-emerald-500" />}
                  </div>
                  <div className="space-y-3">
                    {activeEnrollments(selectedGroup).length > 0 ? activeEnrollments(selectedGroup).map((e, i) => {
                      const studentPayments = (groupPayments || []).filter(p => p.student?.id === e.student?.id);
                      const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                      const monthlyPrice = Number(selectedGroup?.monthlyPrice || 0);
                      
                      let paymentBadge;
                      if (totalPaid >= monthlyPrice && monthlyPrice > 0) {
                        paymentBadge = <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">To'langan</span>;
                      } else if (totalPaid > 0) {
                        paymentBadge = <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">Qisman</span>;
                      } else {
                        paymentBadge = <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">To'lanmagan</span>;
                      }

                      return (
                        <div key={e.id || i} className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-white/[0.03] rounded-3xl border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-all">
                          {e.student?.photo ? (
                            <img src={e.student.photo} alt="" className="w-11 h-11 rounded-2xl object-cover shadow-sm" />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[15px] font-black shadow-lg">
                              {e.student?.name?.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white truncate">{e.student?.name}</p>
                            <p className="text-[11px] text-gray-500 font-medium">To'lov: {totalPaid.toLocaleString()} / {monthlyPrice.toLocaleString()}</p>
                          </div>
                          {paymentBadge}
                        </div>
                      );
                    }) : (
                      <div className="text-center py-20 px-10">
                        <Users size={32} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                        <p className="text-[14px] text-gray-400 font-medium">Hozircha faol o'quvchilar yo'q</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {drawerTab === 'history' && (
                <div className="space-y-6">
                  <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">O'qituvchilar Tarixi</span>
                  <div className="relative border-l-2 border-gray-100 dark:border-white/5 ml-3 space-y-8 pb-10">
                    {(selectedGroup?.phases || []).length > 0 ? [...selectedGroup.phases].sort((a,b) => new Date(b.startDate) - new Date(a.startDate)).map((phase, i) => (
                      <div key={phase.id || i} className="relative pl-7">
                        <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1c1c1e] ${!phase.endDate ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-[14px] font-bold ${!phase.endDate ? 'text-[#1d1d1f] dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {phase.teacher?.name}
                              {!phase.endDate && <span className="ml-2 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">Hozirgi</span>}
                            </h4>
                            <span className="text-[10px] font-bold text-gray-400">{(phase.startDate || "").substring(0, 10)}</span>
                          </div>
                          <p className="text-[12px] text-gray-400 font-medium">
                            {phase.endDate ? `Tugadi: ${phase.endDate.substring(0, 10)}` : 'Davom etmoqda'}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="pl-6 text-[13px] text-gray-400">Tarixiy ma'lumotlar mavjud emas</div>
                    )}
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-3xl">
                    <div className="flex gap-3">
                      <Info className="text-amber-500 shrink-0" size={18} />
                      <p className="text-[12px] text-amber-600/80 leading-relaxed font-medium">
                        Bu guruh tarixi qachon va kim tomonidan dars o'tilganini ko'rsatadi. O'tkazilgan guruhlarda joriy o'qituvchini ham shu yerda ko'rishingiz mumkin.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
              <Link 
                to={`/teacher/attendance?groupId=${selectedGroup?.id}`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] text-[14px] font-bold shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Davomatni ko'rish
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherGroups;
