import React from 'react';
import { RefreshCw, Trash2, Phone, Users, ChevronRight, Fingerprint, Search, ChevronLeft, CheckSquare, Square, MessageSquare, Filter, Send, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudents, deleteAllStudents } from '../services/api';

import { useState, useMemo, useEffect } from 'react';
import Skeleton from '../components/common/Skeleton';

import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { updateStudent, syncStudents, sendNotifications } from '../services/api';
import Modal from '../components/common/Modal';
import { Edit } from 'lucide-react';

const Students = () => {
  const { students: globalStudents, setStudents: setGlobalStudents, loading } = useStore();
  const students = Array.isArray(globalStudents) ? globalStudents : [];
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);

  // Qidiruv va Sahifalash state'lari
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [payFilter, setPayFilter] = useState('ALL'); // 'ALL', 'PAID', 'UNPAID'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageData, setMessageData] = useState({ title: '', message: '' });
  const [sendingMessage, setSendingMessage] = useState(false);

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    parentPhone: '',
    schoolName: '',
    externalId: '',
    status: 'YANGI'
  });

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      phone: student.phone || '',
      parentPhone: student.parentPhone || '',
      schoolName: student.schoolName || '',
      externalId: student.externalId || '',
      status: student.status || 'YANGI'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await updateStudent(editingStudent.id, editFormData);
      toast.success("O'quvchi ma'lumotlari yangilandi");
      setIsEditModalOpen(false);
      const res = await getStudents();
      if (res.data) setGlobalStudents(res.data);
    } catch (err) {
      console.error('Update error:', err);
      toast.error("Xatolik yuzaga keldi");
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncStudents();
      const res = await getStudents();
      if (res.data) setGlobalStudents(res.data);
      toast.success("Ma'lumotlar sinxronizatsiya qilindi");
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Sinxronizatsiyada xatolik');
    } finally {
      setSyncing(false);
    }
  };

  // Qidiruv va Status bo'yicha filtrlash
  const filteredStudents = useMemo(() => {
    return (students || []).filter(student => {
      // 1. Status bo'yicha filter
      if (selectedStatus !== 'ALL' && student.status !== selectedStatus) {
        return false;
      }

      // 2. To'lov bo'yicha filter
      const currentMonth = '2026-04'; // Per user local time
      const monthlyPayments = student.payments?.filter(p => p.month === currentMonth) || [];
      const paidAmt = monthlyPayments.reduce((sum, p) => sum + (Number(p.amount || 0) - Number(p.discount || 0) + Number(p.penalty || 0)), 0);
      const isPaid = paidAmt > 0;

      if (payFilter === 'PAID' && !isPaid) return false;
      if (payFilter === 'UNPAID' && (isPaid || student.status !== 'OQIYAPTI')) return false;

      // 3. Qidiruv bo'yicha filter
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name?.toLowerCase().includes(searchLower) ||
        student.phone?.includes(searchTerm) ||
        student.parentPhone?.includes(searchTerm) ||
        student.externalId?.toLowerCase().includes(searchLower)
      );
    });
  }, [students, searchTerm, selectedStatus, payFilter]);

  // Qidiruv yoki Status o'zgarganda birinchi sahifaga qaytish
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await updateStudent(studentId, { status: newStatus });
      const res = await getStudents();
      if (res.data) setGlobalStudents(res.data);
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Statusni yangilab bo\'lmadi');
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

  // Sahifalash mantiqiy qismi
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 sm:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4">
        <div className="flex-shrink-0">
          <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">O'quvchilar</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Baza: {students?.length || 0} ta</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Ism, tel yoki ID..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 backdrop-blur-md shadow-inner text-[#1d1d1f] dark:text-[#f5f5f7]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center p-1 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-lg backdrop-blur-md">
            {[
              { id: 'ALL', label: 'Barchasi', icon: Users },
              { id: 'PAID', label: 'To\'langan', icon: Filter },
              { id: 'UNPAID', label: 'Qarzdorlar', icon: Filter }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPayFilter(f.id)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5
                  ${payFilter === f.id 
                    ? 'bg-white dark:bg-white/10 text-[#007aff] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <f.icon size={12} />
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsMessageModalOpen(true)}
            disabled={selectedIds.size === 0}
            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all shadow-sm
              ${selectedIds.size > 0
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed opacity-50'}`}
          >
            <MessageSquare size={14} />
            Xabar yuborish {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>

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
                    <th className="px-5 py-3 font-medium w-10">
                      <button
                        onClick={() => {
                          const visibleIds = paginatedStudents.map(s => s.id);
                          const allSelected = visibleIds.every(id => selectedIds.has(id));
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            if (allSelected) {
                              visibleIds.forEach(id => next.delete(id));
                            } else {
                              visibleIds.forEach(id => next.add(id));
                            }
                            return next;
                          });
                        }}
                        className="text-gray-400 hover:text-[#007aff] transition-colors"
                      >
                        {paginatedStudents.length > 0 && paginatedStudents.every(s => selectedIds.has(s.id)) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </th>
                    <th className="px-5 py-3 font-medium min-w-[200px]">Talaba</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Guruh</th>
                    <th className="px-5 py-3 font-medium">To'lov (Aprel)</th>
                    <th className="px-5 py-3 font-medium">Aloqa va ID</th>
                    <th className="px-5 py-3 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                  {loading ? (
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
                  ) : paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => {
                      const activeEnrollment = student.enrollments?.find(e => e.status === 'ACTIVE');
                      const activeGroup = activeEnrollment?.group;
                      
                      const currentMonth = '2026-04'; // Per user local time
                      const monthlyPayments = student.payments?.filter(p => p.month === currentMonth) || [];
                      const paidAmt = monthlyPayments.reduce((sum, p) => sum + (Number(p.amount || 0) - Number(p.discount || 0) + Number(p.penalty || 0)), 0);
                      const isPaid = paidAmt > 0;

                      return (
                      <tr key={student.id} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                        <td className="px-5 py-3" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            if (next.has(student.id)) next.delete(student.id);
                            else next.add(student.id);
                            return next;
                          });
                        }}>
                          <button className={`text-gray-400 hover:text-[#007aff] transition-colors ${selectedIds.has(student.id) ? 'text-[#007aff]' : ''}`}>
                            {selectedIds.has(student.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        </td>
                        <td className="px-5 py-3" onClick={() => navigate(`/students/${student.id}`)}>
                          <div className="flex items-center gap-3">
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={student.name}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-white/10 shadow-sm"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-sm shadow-sm">
                                {student.name.substring(0, 1).toUpperCase()}
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
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEditClick(student); }}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-md transition-all"
                              title="Tahrirlash"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => navigate(`/students/${student.id}`)}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-all"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
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
                            {searchTerm ? <Search size={24} className="text-gray-400" /> : <Users size={24} className="text-gray-400" />}
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
            {filteredStudents.length > 0 && (
              <div className="h-10 px-5 flex items-center justify-between border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-black/30 backdrop-blur-md shrink-0">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  Jami: {filteredStudents.length} ta o'quvchi
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 dark:text-gray-300 transition-colors"
                    title="Oldingi"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-2 text-[11px] text-gray-600 dark:text-gray-300 font-medium min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
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

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="O'quvchi ma'lumotlarini tahrirlash"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">F.I.SH</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Telefon</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={e => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ota-ona teli</label>
                <input
                  type="text"
                  value={editFormData.parentPhone}
                  onChange={e => setEditFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Maktab / O'quv maskani</label>
              <input
                type="text"
                value={editFormData.schoolName}
                onChange={e => setEditFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={editFormData.status}
                  onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                >
                  <option value="YANGI">Yangi</option>
                  <option value="OQIYAPTI">O'qiyapti</option>
                  <option value="PAUZADA">Pauzada</option>
                  <option value="BITIRGAN">Bitirgan</option>
                  <option value="CHETLATILGAN">Chetlatilgan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 bg-[#007aff] hover:bg-[#0062cc] text-white rounded-xl text-[14px] font-bold shadow-lg shadow-[#007aff]/20 transition-all"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Messaging Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !sendingMessage && setIsMessageModalOpen(false)}></div>
          
          <div className="bg-white dark:bg-[#1d1d1f] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">Xabar yuborish</h3>
                  <p className="text-[11px] text-gray-500">{selectedIds.size} ta o'quvchi tanlangan</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mavzu</label>
                <input
                  type="text"
                  value={messageData.title}
                  onChange={e => setMessageData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Xabar sarlavhasi..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Xabar matni</label>
                <textarea
                  value={messageData.message}
                  onChange={e => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Xabar matnini kiriting..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all min-h-[150px] resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-3">
              <button
                disabled={sendingMessage}
                onClick={() => setIsMessageModalOpen(false)}
                className="flex-1 py-3 text-[14px] font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                disabled={sendingMessage || !messageData.title || !messageData.message}
                onClick={async () => {
                  try {
                    setSendingMessage(true);
                    await sendNotifications({
                      studentIds: Array.from(selectedIds),
                      title: messageData.title,
                      message: messageData.message
                    });
                    toast.success("Xabarlar yuborildi! ✅");
                    setIsMessageModalOpen(false);
                    setMessageData({ title: '', message: '' });
                    setSelectedIds(new Set());
                  } catch (e) {
                    toast.error("Xabar yuborishda xatolik!");
                  } finally {
                    setSendingMessage(false);
                  }
                }}
                className="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 text-white rounded-xl text-[14px] font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {sendingMessage ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;