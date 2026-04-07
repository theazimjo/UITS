import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Phone, Users, ChevronRight, Fingerprint, Search, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { syncStudents, updateStudent } from '../services/api';
import Skeleton from '../components/common/Skeleton';

const Students = () => {
  const navigate = useNavigate();
  const { 
    students, studentPagination, loadingStudents, fetchStudents, setStudents 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [syncing, setSyncing] = useState(false);

  // Initial fetch and on status/page change
  useEffect(() => {
    fetchStudents({ 
      page: studentPagination.page, 
      status: selectedStatus,
      search: searchTerm 
    });
  }, [selectedStatus, studentPagination.page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents({ page: 1, search: searchTerm, status: selectedStatus });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncStudents();
      fetchStudents({ page: 1 });
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await updateStudent(studentId, { status: newStatus });
      fetchStudents({ page: studentPagination.page, status: selectedStatus, search: searchTerm });
    } catch (err) {
      console.error('Status update error:', err);
      alert('Statusni yangilab bo\'lmadi');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OQIYAPTI':
        return 'bg-green-100/50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
      case 'CHETLATILGAN':
        return 'bg-red-100/50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400';
      case 'PAUZADA':
        return 'bg-orange-100/50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400';
      case 'BITIRGAN':
        return 'bg-blue-100/50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-100/50 border-gray-200 text-gray-700 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-400';
    }
  };

  const { page, totalPages, total } = studentPagination;

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 sm:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4">
        <div className="flex-shrink-0">
          <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">O'quvchilar</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Baza: {total} ta</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Ism qidirish..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 backdrop-blur-md shadow-inner text-[#1d1d1f] dark:text-[#f5f5f7]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 shadow-sm
              ${syncing
                ? 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-not-allowed border border-transparent'
                : 'bg-[#007aff] hover:bg-[#0062cc] text-white border border-[#005bb5]'}`}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sinxron...' : 'Sinxronlash'}
          </button>
        </div>
      </div>

      {/* macOS-style Tab bar */}
      <div className="px-6 py-2 border-b border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/10 backdrop-blur-sm overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center gap-1">
        {[
          { id: 'ALL', label: 'Hammasi' },
          { id: 'YANGI', label: 'Yangi' },
          { id: 'OQIYAPTI', label: 'O\'qiyapti' },
          { id: 'PAUZADA', label: 'Pauzada' },
          { id: 'BITIRGAN', label: 'Bitirgan' },
          { id: 'CHETLATILGAN', label: 'Chetlatilgan' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all
              ${selectedStatus === tab.id 
                ? 'bg-[#007aff] text-white shadow-sm' 
                : 'text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5 hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6">
        <div className="max-w-[1400px] mx-auto h-full flex flex-col">

          {/* macOS Table Container */}
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl z-10">
                  <tr>
                    <th className="px-5 py-3 font-medium min-w-[200px]">Talaba</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Guruh</th>
                    <th className="px-5 py-3 font-medium">To'lov (Aprel)</th>
                    <th className="px-5 py-3 font-medium">Aloqa va ID</th>
                    <th className="px-5 py-3 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                  {loadingStudents ? (
                    Array(8).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton variant="circle" width="36px" height="36px" />
                            <div className="space-y-2 flex-1">
                              <Skeleton width="120px" height="14px" />
                              <Skeleton width="80px" height="10px" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><Skeleton width="80px" height="20px" className="rounded-full" /></td>
                        <td className="px-5 py-3"><Skeleton width="100px" height="14px" /></td>
                        <td className="px-5 py-3"><Skeleton width="90px" height="14px" /></td>
                        <td className="px-5 py-3"><Skeleton width="120px" height="14px" /></td>
                        <td className="px-5 py-3"></td>
                      </tr>
                    ))
                  ) : students.length > 0 ? (
                    students.map((student) => {
                      const activeEnrollment = student.enrollments?.find(e => e.status === 'ACTIVE');
                      const activeGroup = activeEnrollment?.group;
                      
                      const currentMonth = '2026-04'; // Per user local time
                      const monthlyPayments = student.payments?.filter(p => p.month === currentMonth) || [];
                      const paidAmt = monthlyPayments.reduce((sum, p) => sum + (Number(p.amount || 0) - Number(p.discount || 0) + Number(p.penalty || 0)), 0);
                      const isPaid = paidAmt > 0;

                      return (
                      <tr key={student.id} onClick={() => navigate(`/students/${student.id}`)} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={student.name}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-white/10 shadow-sm"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-sm shadow-sm">
                                {student.name ? student.name.substring(0, 1).toUpperCase() : '?'}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                                {student.name}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {student.schoolName || 'UITS Academy'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <select
                            value={student.status || 'YANGI'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border outline-none cursor-pointer transition-all ${getStatusStyle(student.status || 'YANGI')}`}
                          >
                            <option value="YANGI">YANGI</option>
                            <option value="OQIYAPTI">O'QIYAPTI</option>
                            <option value="PAUZADA">PAUZADA</option>
                            <option value="BITIRGAN">BITIRGAN</option>
                            <option value="CHETLATILGAN">CHETLATILGAN</option>
                          </select>
                        </td>

                        <td className="px-5 py-3">
                          {activeGroup ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{activeGroup.name}</span>
                              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                {activeGroup.course?.name || '---'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px] italic">Guruh yo'q</span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          {isPaid ? (
                            <div className="flex flex-col">
                              <span className="text-green-600 dark:text-green-400 font-semibold text-[12px]">
                                {paidAmt.toLocaleString()} UZS
                              </span>
                              <span className="text-[10px] text-gray-400">To'langan</span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-medium rounded border border-red-100 dark:border-red-800/50">
                              To'lanmagan
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[12px] text-gray-600 dark:text-gray-300">
                              <Phone size={13} className="text-gray-400" />
                              <span>{student.parentPhone || student.phone || 'Kiritilmagan'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                              <Fingerprint size={13} className="text-gray-400" />
                              <span>ID: {student.externalId || student.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button className="inline-flex items-center justify-center w-7 h-7 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[#1d1d1f] dark:hover:text-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                    /* Empty State or No Search Results */
                    <tr>
                      <td colSpan="6" className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                            <Search size={24} className="text-gray-400" />
                          </div>
                          <p className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                            {searchTerm ? "Natija topilmadi" : "O'quvchilar topilmadi"}
                          </p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-4">
                            {searchTerm
                              ? `"${searchTerm}" bo'yicha hech qanday ma'lumot yo'q.`
                              : "Hali hech qanday talaba qo'shilmagan."}
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={handleSync}
                              className="text-[13px] font-medium text-[#007aff] hover:text-[#005bb5] transition-colors"
                            >
                              Sinxronizatsiya qilish &rarr;
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer (macOS Status Bar Style) */}
            {students.length > 0 && (
              <div className="h-10 px-5 flex items-center justify-between border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-black/30 backdrop-blur-md shrink-0">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {total} tadan {students.length} tasi ko'rsatilmoqda
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchStudents({ page: Math.max(1, page - 1) })}
                    disabled={page === 1}
                    className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 dark:text-gray-300 transition-colors"
                    title="Oldingi"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-2 text-[11px] text-gray-600 dark:text-gray-300 font-medium min-w-[60px] text-center">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => fetchStudents({ page: Math.min(totalPages, page + 1) })}
                    disabled={page === totalPages}
                    className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 dark:text-gray-300 transition-colors"
                    title="Keyingi"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Students;