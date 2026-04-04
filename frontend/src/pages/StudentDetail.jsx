import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, User, Phone, MapPin, Calendar,
  BookOpen, Trash2, Search, Info, Edit2, 
  CreditCard, ArrowRight, History, CheckCircle, 
  ChevronRight, Fingerprint, GraduationCap, Building
} from 'lucide-react';
import { getStudentById, getPaymentsByStudent } from '../services/api';

const StudentDetail = ({ fetchStudents }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [stRes, payRes] = await Promise.all([
        getStudentById(id),
        getPaymentsByStudent(id)
      ]);
      setStudent(stRes.data);
      setPayments(payRes.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
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
    <div className="h-full w-full bg-white/60 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      
      {/* macOS Title Bar Area */}
      <div className="h-12 border-b border-gray-200/50 dark:border-white/10 flex items-center px-4 justify-between shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center w-32">
          <button onClick={() => navigate('/students')} className="flex items-center gap-1 text-gray-500 hover:text-[#1d1d1f] dark:hover:text-white transition-colors text-[12px] font-medium">
            <ChevronLeft size={16} /> <span>O'quvchilar</span>
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
          {/* Actions can be added here */}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 shrink-0 flex justify-center sm:justify-start z-10">
        <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner">
          {[
            { id: 'info', label: 'Ma\'lumot', icon: <Info size={14} /> },
            { id: 'groups', label: 'Guruhlar', icon: <BookOpen size={14} /> },
            { id: 'payments', label: 'To\'lovlar', icon: <CreditCard size={14} /> }
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
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
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
                          <Link to={`/groups/${en.group?.id}`} className="inline-flex items-center gap-1 text-[#007aff] hover:underline font-medium text-[12px]">
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

        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
