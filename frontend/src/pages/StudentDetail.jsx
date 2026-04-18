import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft, User, Phone, MapPin, Calendar,
  BookOpen, Trash2, Search, Info, Edit2,
  CreditCard, ArrowRight, History, CheckCircle, RefreshCw,
  ChevronRight, Fingerprint, GraduationCap, Building
} from 'lucide-react';
import { getStudentById, getPaymentsByStudent, getStudentAttendance, updateStudent, getStudentExams } from '../services/api';
import { Award } from 'lucide-react';

import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { getStudents } from '../services/api';

const StudentDetail = () => {
  const { setStudents: setGlobalStudents } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacherPortal = location.pathname.startsWith('/teacher');
  const backPath = isTeacherPortal ? '/teacher/attendance' : '/students';
  const portalPrefix = isTeacherPortal ? '/teacher' : '';

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [viewDate, setViewDate] = useState(new Date());
  const [attCache, setAttCache] = useState({});
  const [attSource, setAttSource] = useState(null); // 'cache' | 'external'

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  // Speculative pre-fetching: load current month attendance in background as soon as student is ready
  useEffect(() => {
    if (student && !attCache[`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`]) {
      fetchAttendanceData();
    }
  }, [student]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceData();
    }
    if (activeTab === 'exams') {
      fetchExams();
    }
  }, [viewDate, activeTab]);

  const fetchExams = async () => {
    try {
      setAttLoading(true);
      const res = await getStudentExams(id);
      setExams(res.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setAttLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [stRes, payRes] = await Promise.all([
        getStudentById(id),
        getPaymentsByStudent(id)
      ]);
      setStudent(stRes.data);
      setPayments(payRes.data || []);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (force = false) => {
    // Format manually to avoid timezone shift
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const cacheKey = `${year}-${month}`;

    // Check cache first (unless forced)
    if (!force && attCache[cacheKey]) {
      setAttendance(attCache[cacheKey].attendance || []);
      setGrades(attCache[cacheKey].grades || []);
      return;
    }

    try {
      setAttLoading(true);
      setAttendance([]); // Clear old data to avoid confusion
      const dateStr = `${year}-${month}-01`;

      const attRes = await getStudentAttendance(id, dateStr);
      const data = attRes.data?.recent_attendance || [];
      const gradesData = attRes.data?.grades || [];
      const source = attRes.data?.fromCache ? 'cache' : 'external';
      setAttendance(data);
      setGrades(gradesData);
      setAttSource(source);
      setAttCache(prev => ({ ...prev, [cacheKey]: { attendance: data, grades: gradesData } }));
    } catch (err) {
      console.error('Error fetching attendance:', err);
      toast.error('Davomat ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setAttLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStudent(id, { status: newStatus });
      setStudent(prev => ({ ...prev, status: newStatus }));

      const allRes = await getStudents();
      if (allRes.data) setGlobalStudents(allRes.data);
      toast.success('Status yangilandi');
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Statusni yangilab bo\'mladi');
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000]">
      <div className="w-8 h-8 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!student) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">Talaba topilmadi</h2>
        <button onClick={() => navigate('/students')} className="text-[#007aff] hover:underline">Orqaga qaytish</button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] scroll-smooth">

      {/* macOS Title Bar Area */}
      <div className="h-12 border-b border-gray-200/50 dark:border-white/10 flex items-center px-4 justify-between shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center w-32">
          <button onClick={() => navigate(backPath)} className="flex items-center gap-1 text-gray-500 hover:text-[#1d1d1f] dark:hover:text-white transition-colors text-[12px] font-medium">
            <ChevronLeft size={16} /> <span>{isTeacherPortal ? 'Davomat' : "O'quvchilar"}</span>
          </button>
        </div>
        <div className="flex-1 text-center font-medium text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate px-4">
          Profil: {student.name}
        </div>
        <div className="w-32 flex justify-end"></div>
      </div>

      {/* Header / Profile Summary */}
      <div className="px-6 py-6 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0 z-10">
        <div className="relative">
          {student.photo ? (
            <img src={student.photo} alt={student.name} className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-white dark:border-gray-800 shadow-lg">
              <User size={32} />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#34c759] border-2 border-white dark:border-[#1e1e1e] shadow-sm flex items-center justify-center">
            <CheckCircle size={12} className="text-white" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl font-bold text-[#1d1d1f] dark:text-white mb-1">{student.name}</h1>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20">
              ID: {student.externalId || student.id}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
              <Phone size={14} /> {student.phone || '---'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={student.status || 'YANGI'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border outline-none cursor-pointer transition-all shadow-sm
              ${student.status === 'OQIYAPTI'
                ? 'bg-green-100/50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                : student.status === 'CHETLATILGAN'
                  ? 'bg-red-100/50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
                  : student.status === 'PAUZADA'
                    ? 'bg-orange-100/50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400'
                    : student.status === 'BITIRGAN'
                      ? 'bg-blue-100/50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                      : 'bg-gray-100/50 border-gray-200 text-gray-700 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-400'
              }`}
          >
            <option value="YANGI">YANGI</option>
            <option value="OQIYAPTI">O'QIYAPTI</option>
            <option value="PAUZADA">PAUZADA</option>
            <option value="BITIRGAN">BITIRGAN</option>
            <option value="CHETLATILGAN">CHETLATILGAN</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0 flex justify-center sm:justify-start z-10">
        <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner">
          {[
            { id: 'info', label: 'Ma\'lumot', icon: <Info size={14} /> },
            { id: 'groups', label: 'Guruhlar', icon: <BookOpen size={14} /> },
            { id: 'payments', label: 'To\'lovlar', icon: <CreditCard size={14} /> },
            { id: 'attendance', label: 'Davomat', icon: <History size={14} /> },
            { id: 'exams', label: 'Imtihonlar', icon: <Award size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-6 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${activeTab === t.id
                ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
            >
              <span className={activeTab === t.id ? 'text-[#007aff]' : 'opacity-70'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-[1000px] mx-auto">

          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2">
                  <User size={16} className="text-[#007aff]" /> Aloqa ma'lumotlari
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1">TELEFON RAQAM</p>
                    <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{student.phone || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1">OTA-ONASI RAQAMI</p>
                    <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{student.parentPhone || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1">MANZIL</p>
                    <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{student.address || 'Kiritilmagan'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl p-5 border border-gray-200/50 dark:border-white/10 shadow-sm">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2">
                  <Building size={16} className="text-[#34c759]" /> O'qish ma'lumotlari
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1">MAKTAB / O'QUV DARGOI</p>
                    <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">{student.schoolName || 'UITS Academy'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1">TIZIMGA QO'SHILGAN</p>
                    <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('uz-UZ') : '---'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase mb-1">SHAXSIY ID</p>
                    <p className="text-[13px] font-mono text-[#1d1d1f] dark:text-white">{student.externalId || student.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GROUPS */}
          {activeTab === 'groups' && (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">A'zo bo'lgan guruhlari</h3>
                <span className="text-[11px] font-medium text-gray-500">{student.enrollments?.length || 0} ta guruh</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Guruh nomi</th>
                      <th className="px-5 py-2.5 font-medium">Sana (Qo'shilgan)</th>
                      <th className="px-5 py-2.5 font-medium">Holat</th>
                      <th className="px-5 py-2.5 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {student.enrollments?.map(en => (
                      <tr key={en.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-5 py-3">
                          <p className="font-medium text-[#1d1d1f] dark:text-white">{en.group?.name}</p>
                          <p className="text-[11px] text-gray-500">{en.group?.course?.name}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {en.joinedDate || '---'}
                        </td>
                        <td className="px-5 py-3">
                          {(() => {
                            const isGroupCompleted = en.group?.status === 'COMPLETED';
                            const isActive = en.status === 'ACTIVE';
                            const isGraduated = en.status === 'GRADUATED';

                            let label = en.status;
                            let colorClass = 'bg-gray-100 text-gray-500 border-gray-200';

                            if (isActive && isGroupCompleted) {
                              label = 'Bitirgan';
                              colorClass = 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/20';
                            } else if (isActive) {
                              label = 'O\'qimoqda';
                              colorClass = 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20';
                            } else if (isGraduated) {
                              label = 'Bitirgan';
                              colorClass = 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/20';
                            } else if (en.status === 'DROPPED') {
                              label = 'Tark etgan';
                              colorClass = 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20';
                            }

                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${colorClass}`}>
                                {label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link to={`${portalPrefix}/groups/${en.group?.id}`} className="inline-flex items-center gap-1 text-[#007aff] hover:underline font-medium text-[12px]">
                            Guruhga o'tish <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {(!student.enrollments || student.enrollments.length === 0) && (
                      <tr><td colSpan="4" className="py-12 text-center text-gray-400">Hech qanday guruhga a'zo emas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">To'lovlar tarixi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Sana</th>
                      <th className="px-5 py-2.5 font-medium">Guruh</th>
                      <th className="px-5 py-2.5 font-medium">Oy</th>
                      <th className="px-5 py-2.5 font-medium">Summa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 text-gray-500">{p.paymentDate}</td>
                        <td className="px-5 py-3 font-medium text-[#1d1d1f] dark:text-white">{p.group?.name}</td>
                        <td className="px-5 py-3 text-gray-500">{p.month}</td>
                        <td className="px-5 py-3 font-semibold text-[#34c759]">
                          {parseFloat(p.amount).toLocaleString()} UZS
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr><td colSpan="4" className="py-12 text-center text-gray-400">Hali to'lovlar amalga oshirilmagan</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in p-6 relative">
              {attLoading && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-[#007aff]" size={30} />
                    <p className="text-[13px] font-medium text-[#1d1d1f] dark:text-white">Ma'lumotlar yuklanmoqda...</p>
                  </div>
                </div>
              )}

              {/* Statistics Summary at Top */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white">Davomat Kalendari</h3>
                  <p className="text-[12px] text-gray-500">Oylik davomat tarixi va vaqtlari</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-[#34c759]/10 to-[#34c759]/5 border border-[#34c759]/20 rounded-2xl px-5 py-2 flex items-center gap-3 shadow-sm transition-all hover:shadow-md">
                    <div className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
                    <div>
                      <p className="text-[#34c759] text-[10px] font-bold uppercase tracking-tight opacity-80 leading-none mb-1">Kelgan kunlar</p>
                      <p className="text-xl font-bold text-[#1d1d1f] dark:text-white leading-none">
                        {attendance.filter(a => a.status === 'present').length}
                      </p>
                    </div>
                  </div>

                  {attSource && (
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${attSource === 'cache'
                      ? 'bg-blue-100/50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-orange-100/50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800'
                      }`}>
                      {attSource === 'cache' ? 'Bazadan' : 'API dan'}
                    </div>
                  )}

                  <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-200 dark:border-white/10 shadow-inner">
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-full transition-all text-gray-600 dark:text-gray-400">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 text-[13px] font-bold text-[#1d1d1f] dark:text-white min-w-[120px] text-center">
                      {viewDate.toLocaleString('uz-UZ', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-full transition-all text-gray-600 dark:text-gray-400">
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => fetchAttendanceData(true)}
                    disabled={attLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/20 rounded-lg text-[12px] font-medium transition-all"
                  >
                    <RefreshCw size={14} className={attLoading ? "animate-spin" : ""} />
                    Yangilash
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-200/50 dark:bg-white/5 rounded-xl border border-gray-200/50 dark:border-white/10 overflow-hidden">
                {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Yak'].map(day => (
                  <div key={day} className="bg-gray-50/50 dark:bg-white/5 py-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                {(() => {
                  const days = [];
                  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
                  const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

                  // Empty slots before first day
                  let startingDay = firstDay.getDay();
                  startingDay = startingDay === 0 ? 6 : startingDay - 1; // Adjust to start from Monday

                  for (let i = 0; i < startingDay; i++) {
                    days.push(<div key={`empty-${i}`} className="bg-white/30 dark:bg-black/10 h-24" />);
                  }

                  for (let d = 1; d <= lastDay.getDate(); d++) {
                    const currentDayStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const att = attendance.find(a => {
                      if (!a.date) return false;
                      const aDate = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
                      return aDate === currentDayStr;
                    });

                    const grade = grades.find(g => {
                      if (!g.date) return false;
                      const gDate = typeof g.date === 'string' ? g.date.split('T')[0] : new Date(g.date).toISOString().split('T')[0];
                      return gDate === currentDayStr;
                    });

                    let bgClass = "bg-white/60 dark:bg-white/5";
                    let statusColor = "bg-transparent";

                    if (att) {
                      if (att.status === 'present') {
                        statusColor = "bg-[#34c759]";
                      } else {
                        statusColor = "bg-[#ff3b30]";
                      }
                    } else if (new Date(currentDayStr) < new Date() && firstDay.getDay() !== 0) {
                      // Optionally mark past days without data as absent
                      // statusColor = "bg-gray-200 dark:bg-gray-700";
                    }

                    const isToday = new Date().toDateString() === new Date(currentDayStr).toDateString();

                    days.push(
                      <div key={d} className={`${bgClass} h-24 p-2 border-t border-l border-gray-100/50 dark:border-white/5 relative group transition-all hover:z-10 hover:shadow-xl hover:scale-[1.02] cursor-default`}>
                        <span className={`text-[12px] font-medium ${isToday ? 'bg-[#007aff] text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-500'}`}>
                          {d}
                        </span>

                        {grade && (
                          <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                            {grade.score}
                          </div>
                        )}

                        {att && (
                          <div className="mt-2 flex flex-col gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusColor} shadow-[0_0_8px] ${att.status === 'present' ? 'shadow-[#34c759]/50' : 'shadow-[#ff3b30]/50'}`} />
                            <p className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{att.arrived_at || '---'}</p>
                            <p className="text-[9px] text-gray-400">{att.left_at || '---'}</p>
                          </div>
                        )}

                        {/* Tooltip on hover */}
                        {att && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black/80 backdrop-blur-md text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20 shadow-2xl border border-white/10">
                            <p className="font-bold border-b border-white/10 mb-1 pb-1">{att.status_display || att.status}</p>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Kelgan:</span>
                              <span className="font-mono">{att.arrived_at || '---'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Ketgan:</span>
                              <span className="font-mono">{att.left_at || '---'}</span>
                            </div>
                            {grade && (
                              <div className="flex justify-between mt-1 pt-1 border-t border-white/10">
                                <span className="text-gray-400">Baho:</span>
                                <span className="font-bold text-purple-400">{grade.score} izoh: {grade.comment || '-'}</span>
                              </div>
                            )}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/80" />
                          </div>
                        )}
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>

              {/* Calendar Grid */}
            </div>
          )}

          {/* TAB 5: EXAMS */}
          {activeTab === 'exams' && (
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">Imtihon natijalari</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Sana</th>
                      <th className="px-5 py-2.5 font-medium">Guruh</th>
                      <th className="px-5 py-2.5 font-medium text-center">Joriy</th>
                      <th className="px-5 py-2.5 font-medium text-center">Nazariy</th>
                      <th className="px-5 py-2.5 font-medium text-center">Amaliy</th>
                      <th className="px-5 py-2.5 font-medium text-center">Umumiy</th>
                      <th className="px-5 py-2.5 font-medium text-center">Foiz</th>
                      <th className="px-5 py-2.5 font-medium text-center">Natija</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {exams.map(ex => (
                      <tr key={ex.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 text-gray-500">{ex.month}</td>
                        <td className="px-5 py-3 font-medium text-[#1d1d1f] dark:text-white">{ex.group?.name}</td>
                        <td className="px-5 py-3 text-center text-blue-600 dark:text-blue-400 font-bold">{ex.currentAverage}</td>
                        <td className="px-5 py-3 text-center">{ex.theoryScore}</td>
                        <td className="px-5 py-3 text-center">{ex.practiceScore}</td>
                        <td className="px-5 py-3 text-center font-bold">{ex.totalScore}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-bold">
                            {ex.percentage}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-lg font-bold text-[11px] ${ex.status === "O'tdi" || !ex.status
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {ex.status || "O'tdi"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {exams.length === 0 && (
                      <tr><td colSpan="8" className="py-12 text-center text-gray-400">Imtihon natijalari topilmadi</td></tr>
                    )}
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

export default StudentDetail;
