import React, { useState, useEffect } from 'react';
import { getTeacherGroups } from '../../services/api';
import { BookOpen, Users, Clock, Calendar, Loader2, MapPin } from 'lucide-react';

const statusMap = {
  ACTIVE: { label: "Faol", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  WAITING: { label: "Kutilmoqda", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  COMPLETED: { label: "Tugallangan", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
};

const TeacherGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await getTeacherGroups();
      setGroups(res.data);
    } catch (err) {
      console.error('Groups fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeEnrollments = (group) => group.enrollments?.filter(e => e.status === 'ACTIVE') || [];

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      {/* Toolbar */}
      <div className="min-h-[56px] flex items-center px-6 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm">
            <BookOpen size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Guruhlarim</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Jami {groups.length} ta guruh</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-[14px]">Sizga biriktirilgan guruhlar yo'q</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {groups.map((group) => {
              const active = activeEnrollments(group);
              const st = statusMap[group.status] || statusMap.ACTIVE;
              const isExpanded = expandedId === group.id;

              return (
                <div key={group.id} className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  {/* Group Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : group.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[16px] font-black text-[#1d1d1f] dark:text-white">{group.name}</h3>
                        <p className="text-[12px] text-gray-500 mt-1">{group.course?.name || 'Kurs belgilanmagan'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${st.color}`}>{st.label}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-[12px]">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Users size={14} className="text-emerald-500" />
                        <span className="font-semibold">{active.length} talaba</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="text-blue-500" />
                        <span className="font-semibold">{group.startTime} - {group.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar size={14} className="text-amber-500" />
                        <span className="font-semibold">{group.days?.join(', ')}</span>
                      </div>
                    </div>

                    {group.room && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-3">
                        <MapPin size={12} />
                        <span>{group.room.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Student List */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02] p-4">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Talabalar ro'yxati</p>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {active.length > 0 ? active.map((e, i) => (
                          <div key={e.id || i} className="flex items-center gap-3 p-2.5 bg-white/60 dark:bg-white/5 rounded-xl">
                            {e.student?.photo ? (
                              <img src={e.student.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">
                                {e.student?.name?.charAt(0) || '?'}
                              </div>
                            )}
                            <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{e.student?.name}</span>
                          </div>
                        )) : (
                          <p className="text-[12px] text-gray-400 text-center py-3">Faol talabalar yo'q</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherGroups;
