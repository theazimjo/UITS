import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, Search, Plus, Trash2, Calendar,
  BookOpen, DollarSign, ChevronLeft, ChevronRight,
  Filter, User, Percent, AlertTriangle, X, CheckCircle
} from 'lucide-react';
import { getPayments, createPayment, deletePayment } from '../services/api';
import Modal from '../components/common/Modal'; // Ensure this uses a matching macOS design if possible

import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Payments = () => {
  const { students = [], groups = [], staff: staffList = [] } = useStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Qidiruv va Filtr state'lari
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  // Sahifalash state'lari
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal va Forma state'lari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    groupId: '',
    amount: '',
    discount: '0',
    penalty: '0',
    month: new Date().toISOString().substring(0, 7),
    teacherId: '',
    paymentType: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]); // [{id, name}]

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPayments();
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      if (isMultiSelect && selectedStudents.length > 0) {
        // Bulk creation
        const requests = selectedStudents.map(s => {
          const payload = {
            ...formData,
            student: { id: parseInt(s.id) },
            group: { id: parseInt(formData.groupId) },
            amount: parseFloat(formData.amount),
            discount: parseFloat(formData.discount || 0),
            penalty: parseFloat(formData.penalty || 0)
          };
          return createPayment(payload);
        });
        await Promise.all(requests);
      } else {
        // Single creation
        const payload = {
          ...formData,
          student: { id: parseInt(formData.studentId) },
          group: { id: parseInt(formData.groupId) },
          teacher: formData.teacherId ? { id: parseInt(formData.teacherId) } : undefined,
          amount: parseFloat(formData.amount),
          discount: parseFloat(formData.discount || 0),
          penalty: parseFloat(formData.penalty || 0)
        };
        await createPayment(payload);
      }

      await fetchPayments();
      setIsModalOpen(false);
      resetForm();
      toast.success("To'lov muvaffaqiyatli saqlandi");
    } catch (err) {
      console.error('Error creating payment:', err);
      toast.error("To'lovni saqlashda muammo yuzaga keldi.");
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      groupId: '',
      amount: '',
      discount: '0',
      penalty: '0',
      month: new Date().toISOString().substring(0, 7),
      teacherId: '',
      paymentType: 'CASH',
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setStudentSearch('');
    setSelectedStudents([]);
    setIsMultiSelect(false);
  };

  const getTeacherForMonth = (groupId, month) => {
    if (!groupId || !month) return "Noma'lum";
    const group = groups.find(g => g.id === parseInt(groupId));
    if (!group) return "Noma'lum";
    if (!group.phases || group.phases.length === 0) return group.teacher?.name || "Noma'lum";

    const [year, monthNum] = month.split('-').map(Number);
    const monthEnd = new Date(year, monthNum, 0).toISOString().split('T')[0];

    const relevantPhases = group.phases
      .filter(p => p.startDate <= monthEnd)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    if (relevantPhases.length > 0) {
      return relevantPhases[0].teacher?.name || group.teacher?.name || "Noma'lum";
    }

    return group.teacher?.name || "Noma'lum";
  };

  const getTeacherIdForMonth = (groupId, month) => {
    if (!groupId || !month) return '';
    const group = groups.find(g => g.id === parseInt(groupId));
    if (!group) return '';
    if (!group.phases || group.phases.length === 0) return group.teacher?.id?.toString() || '';

    const [year, monthNum] = month.split('-').map(Number);
    const monthEnd = new Date(year, monthNum, 0).toISOString().split('T')[0];

    const relevantPhases = group.phases
      .filter(p => p.startDate <= monthEnd)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    if (relevantPhases.length > 0) {
      return relevantPhases[0].teacher?.id?.toString() || group.teacher?.id?.toString() || '';
    }

    return group.teacher?.id?.toString() || '';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatdan ham bu to\'lovni o\'chirishni xohlaysizmi?')) {
      try {
        await deletePayment(id);
        await fetchPayments();
      } catch (err) {
        console.error('Error deleting payment:', err);
      }
    }
  };

  const handlePrevMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(date.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(date.toISOString().substring(0, 7));
  };

  const formattedMonth = new Date(selectedMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

  // Filtrlash va Qidiruv Mantiqiy qismi
  const filteredPayments = useMemo(() => {
    let result = payments.filter(p => p.month === selectedMonth);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.student?.name?.toLowerCase().includes(q) ||
        p.group?.name?.toLowerCase().includes(q) ||
        p.amount?.toString().includes(q)
      );
    }
    return result;
  }, [payments, selectedMonth, searchQuery]);

  // Qidiruv yoki oy o'zgarganda sahifani 1 ga qaytarish
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMonth]);

  const totalRevenue = filteredPayments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  // Sahifalash mantiqiy qismi
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedStudent = students.find(s => s.id === parseInt(formData.studentId));
  const studentGroups = useMemo(() => {
    if (isMultiSelect && selectedStudents.length > 0) {
      // In multi-select mode, show groups that ANY of the selected students belong to
      // or just show all groups for "testing" as the user requested
      // Let's show all groups to keep it simple for testing
      return groups;
    }
    return groups.filter(g => g.enrollments?.some(e => (e.studentId || e.student?.id) === parseInt(formData.studentId)));
  }, [students, groups, formData.studentId, isMultiSelect, selectedStudents]);

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'CASH': return 'Naqd';
      case 'CARD': return 'Karta';
      case 'TRANSFER': return "O'tkazma";
      case 'CLICK': return 'Click/Payme';
      default: return type;
    }
  };

  const getGroupMinMonth = (groupId) => {
    const g = groups.find(x => x.id === parseInt(groupId));
    if (!g) return '';
    if (g.phases && g.phases.length > 0) {
      const startDates = g.phases.map(p => p.startDate).filter(Boolean);
      if (startDates.length > 0) {
        return startDates.sort()[0].substring(0, 7);
      }
    }
    return g.startDate?.substring(0, 7) || '';
  };

  const existingPayment = useMemo(() => {
    if (isMultiSelect || !formData.studentId || !formData.groupId || !formData.month) return null;
    return payments.find(p => 
      p.student?.id === parseInt(formData.studentId) && 
      p.group?.id === parseInt(formData.groupId) && 
      p.month === formData.month
    );
  }, [payments, formData.studentId, formData.groupId, formData.month, isMultiSelect]);

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 lg:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4 z-20">

        {/* Title Area */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="p-1.5 bg-[#34c759] text-white rounded-md shadow-sm">
            <CreditCard size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">To'lovlar</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Ushbu oy uchun tushum: <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{totalRevenue.toLocaleString()} UZS</span></p>
          </div>
        </div>

        {/* Center/Right Actions Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">

          {/* Month Selector */}
          <div className="flex items-center bg-white/60 dark:bg-black/30 rounded-md border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
            <button onClick={handlePrevMonth} className="px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 border-r border-gray-200/50 dark:border-white/10"><ChevronLeft size={14} className="text-gray-600 dark:text-gray-300" /></button>
            <span className="px-4 text-[12px] font-medium text-center min-w-[120px] text-[#1d1d1f] dark:text-[#f5f5f7]">{formattedMonth}</span>
            <button onClick={handleNextMonth} className="px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 border-l border-gray-200/50 dark:border-white/10"><ChevronRight size={14} className="text-gray-600 dark:text-gray-300" /></button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="O'quvchi yoki guruh..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 backdrop-blur-md shadow-inner text-[#1d1d1f] dark:text-[#f5f5f7]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all shadow-sm bg-[#007aff] hover:bg-[#0062cc] text-white border border-[#005bb5]"
          >
            <Plus size={14} />
            <span>Yangi to'lov</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6">
        <div className="max-w-[1200px] mx-auto h-full flex flex-col">

          {/* macOS Table Container */}
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl z-10">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">O'quvchi</th>
                    <th className="px-5 py-2.5 font-medium">Guruh / O'qituvchi</th>
                    <th className="px-5 py-2.5 font-medium text-center">Asosiy / Chegirma / Jarima</th>
                    <th className="px-5 py-2.5 font-medium">Jami To'langan</th>
                    <th className="px-5 py-2.5 font-medium">Sana va Tur</th>
                    <th className="px-5 py-2.5 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-6 h-6 border-2 border-[#007aff] border-t-transparent rounded-full animate-spin mb-3"></div>
                          <span className="text-[12px] font-medium">Ma'lumotlar yuklanmoqda...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPayments.length > 0 ? (
                    paginatedPayments.map(p => (
                      <tr key={p.id} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-default">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-[11px] shadow-sm">
                              {p.student?.name?.substring(0, 1).toUpperCase()}
                            </div>
                            <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{p.student?.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1 text-[12px]">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                              <BookOpen size={14} className="text-gray-400" />
                              <span>{p.group?.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[10px]">
                              <User size={12} className="text-gray-400" />
                              <span>{p.teacher?.name || "Noma'lum"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col items-center gap-1.5 text-[11px] text-gray-500">
                            <span>{parseInt(p.amount).toLocaleString()}</span>
                            {parseFloat(p.discount) > 0 && (
                              <span className="text-[#007aff] flex items-center gap-0.5">
                                <Percent size={10} /> -{parseInt(p.discount).toLocaleString()}
                              </span>
                            )}
                            {parseFloat(p.penalty) > 0 && (
                              <span className="text-[#ff9500] flex items-center gap-0.5">
                                <AlertTriangle size={10} /> +{parseInt(p.penalty).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20">
                            {(parseInt(p.amount) - parseFloat(p.discount || 0) + parseFloat(p.penalty || 0)).toLocaleString()} <span className="text-[9px] ml-0.5 opacity-80 uppercase">UZS</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">{p.paymentDate}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{getPaymentTypeLabel(p.paymentType)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="inline-flex items-center justify-center w-7 h-7 bg-transparent hover:bg-[#ff3b30]/10 text-gray-400 hover:text-[#ff3b30] rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title="O'chirish"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                            {searchQuery ? <Search size={24} className="text-gray-400" /> : <CreditCard size={24} className="text-gray-400" />}
                          </div>
                          <p className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                            {searchQuery ? "Natija topilmadi" : "To'lovlar yo'q"}
                          </p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400">
                            {searchQuery
                              ? `Ushbu oyda "${searchQuery}" bo'yicha ma'lumot yo'q.`
                              : "Ushbu oy uchun hali to'lovlar kiritilmagan."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredPayments.length > 0 && (
              <div className="h-10 px-5 flex items-center justify-between border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-black/30 backdrop-blur-md shrink-0">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  Jami: {filteredPayments.length} ta to'lov
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 dark:text-gray-300 transition-colors"
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
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CREATE PAYMENT MODAL (Mac OS styling embedded for form) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yangi to'lov"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

          <div className="space-y-3.5">
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400">O'QUVCHI QIDIRISH</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-medium">KO'P TANLASH</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMultiSelect(!isMultiSelect);
                      setSelectedStudents([]);
                      setFormData({ ...formData, studentId: '', groupId: '' });
                      setStudentSearch('');
                    }}
                    className={`w-7 h-4 rounded-full transition-all relative ${isMultiSelect ? 'bg-[#34c759]' : 'bg-gray-300 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isMultiSelect ? 'left-3.5' : 'left-0.5 shadow-sm'}`} />
                  </button>
                </div>
              </div>

              {/* Selected students chips for multi-select */}
              {isMultiSelect && selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-gray-50 dark:bg-black/20 rounded-lg border border-dashed border-gray-300 dark:border-white/10">
                  {selectedStudents.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 px-2 py-1 bg-[#007aff]/10 text-[#007aff] rounded-md border border-[#007aff]/20 text-[11px] font-medium">
                      <span>{s.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedStudents(prev => prev.filter(x => x.id !== s.id))}
                        className="hover:text-[#ff3b30]"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder={isMultiSelect ? "Bir necha o'quvchini qo'shing..." : "Ism yoki telefon orqali izlang..."}
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setIsStudentListOpen(true);
                  }}
                  onFocus={() => setIsStudentListOpen(true)}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md pl-8 pr-10 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                />
                {!isMultiSelect && formData.studentId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData({ ...formData, studentId: '', groupId: '' });
                      setStudentSearch('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff3b30]"
                  >
                    <X size={14} />
                  </button>
                )}
                {isMultiSelect && studentSearch && (
                   <button 
                    type="button" 
                    onClick={() => setStudentSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Searchable Dropdown List */}
              {isStudentListOpen && studentSearch.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 rounded-md shadow-lg max-h-[180px] overflow-y-auto backdrop-blur-xl">
                  {students.filter(s => 
                    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                    s.phone?.includes(studentSearch)
                  ).slice(0, 10).map(s => {
                    const isAlreadySelected = selectedStudents.some(x => x.id === s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (isMultiSelect) {
                            if (!isAlreadySelected) {
                              setSelectedStudents([...selectedStudents, { id: s.id, name: s.name }]);
                            }
                            setStudentSearch('');
                          } else {
                            setFormData({ ...formData, studentId: s.id.toString(), groupId: '' });
                            setStudentSearch(s.name);
                            setIsStudentListOpen(false);
                          }
                        }}
                        className={`px-3 py-2 text-[13px] hover:bg-[#007aff] hover:text-white cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-0 ${isAlreadySelected ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                      >
                        <div className="font-medium">{s.name} {isAlreadySelected && '(Tanlangan)'}</div>
                        <div className="text-[10px] opacity-70">{s.phone}</div>
                      </div>
                    );
                  })}
                  {students.filter(s => 
                    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                    s.phone?.includes(studentSearch)
                  ).length === 0 && (
                    <div className="px-3 py-2 text-[12px] text-gray-500 italic">O'quvchi topilmadi</div>
                  )}
                </div>
              )}
              {!isMultiSelect && formData.studentId && !isStudentListOpen && (
                <div className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-[#34c759]/10 text-[#34c759] rounded-md border border-[#34c759]/20">
                  <User size={12} />
                  <span className="text-[11px] font-medium">Tanlandi: {students.find(s => s.id.toString() === formData.studentId)?.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">GURUH</label>
              <select
                value={formData.groupId}
                onChange={e => {
                  const g = groups.find(x => x.id === parseInt(e.target.value));
                  const minMonth = getGroupMinMonth(e.target.value);
                  let newMonth = formData.month;
                  if (minMonth && newMonth < minMonth) {
                    newMonth = minMonth;
                  }
                  const suggestedTeacherId = getTeacherIdForMonth(e.target.value, newMonth);
                  setFormData({ ...formData, groupId: e.target.value, amount: g ? g.monthlyPrice : formData.amount, month: newMonth, teacherId: suggestedTeacherId });
                }}
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner disabled:opacity-50"
                required
                disabled={!isMultiSelect ? !formData.studentId : selectedStudents.length === 0}
              >
                <option value="">Tanlang...</option>
                {studentGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              {formData.groupId && (
                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">O'QITUVCHI (AVTOMATIK TANLANDI)</label>
                  <select
                    value={formData.teacherId}
                    onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                    required
                  >
                    <option value="">Tanlang...</option>
                    {staffList
                      .filter(s => {
                        const roleName = s.role?.name?.toLowerCase() || '';
                        return roleName.includes('teacher') || roleName.includes("o'qituvchi") || roleName.includes("ustoz");
                      })
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    }
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">To'lov tanlangan oydagi o'qituvchiga avtomatik biriktirildi. Zarurat bo'lsa, qo'lda o'zgartirishingiz mumkin.</p>
                </div>
              )}
              {(!isMultiSelect ? !formData.studentId : selectedStudents.length === 0) && <p className="text-[10px] text-[#ffcc00] mt-1">Avval o'quvchi(lar)ni tanlang</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SUMMA</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md pl-8 pr-3 py-2 text-[13px] font-semibold text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                    placeholder="250000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#007aff] mb-1">CHEGIRMA</label>
                <div className="relative">
                   <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#007aff]/50" size={14} />
                   <input
                    type="number"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full bg-[#007aff]/5 dark:bg-[#007aff]/10 border border-[#007aff]/20 rounded-md pl-8 pr-3 py-2 text-[13px] font-medium text-[#007aff] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#ff9500] mb-1">JARIMA</label>
                <div className="relative">
                   <AlertTriangle className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#ff9500]/50" size={14} />
                   <input
                    type="number"
                    value={formData.penalty}
                    onChange={e => setFormData({ ...formData, penalty: e.target.value })}
                    className="w-full bg-[#ff9500]/5 dark:bg-[#ff9500]/10 border border-[#ff9500]/20 rounded-md pl-8 pr-3 py-2 text-[13px] font-medium text-[#ff9500] focus:ring-2 focus:ring-[#ff9500]/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-100/50 dark:bg-white/5 p-3 rounded-lg flex justify-between items-center">
              <span className="text-[12px] font-medium text-gray-500">YIKUNIY TO'LOV:</span>
              <span className="text-lg font-bold text-[#34c759]">
                {(parseFloat(formData.amount || 0) - parseFloat(formData.discount || 0) + parseFloat(formData.penalty || 0)).toLocaleString()} UZS
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">HISOBOT OYI</label>
                <input
                  type="month"
                  value={formData.month}
                  min={getGroupMinMonth(formData.groupId)}
                  onChange={e => {
                    const newMonth = e.target.value;
                    const suggestedTeacherId = getTeacherIdForMonth(formData.groupId, newMonth);
                    setFormData({ ...formData, month: newMonth, teacherId: suggestedTeacherId });
                  }}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  required
                />
                
                {/* Real-time Payment Status Feedback */}
                {formData.studentId && formData.groupId && formData.month && !isMultiSelect && (
                  <div className={`mt-1.5 p-1.5 rounded border text-[10px] font-medium flex items-center gap-1.5 transition-all
                    ${existingPayment 
                      ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' 
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
                    }`}
                  >
                    {existingPayment ? (
                      <>
                        <CheckCircle size={12} />
                        <span>Ushbu oy uchun {parseInt(existingPayment.amount).toLocaleString()} UZS to'langan</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={12} />
                        <span>Ushbu oy uchun hali to'lov kiritilmagan</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TO'LOV TURI</label>
                <select
                  value={formData.paymentType}
                  onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  required
                >
                  <option value="CASH">Naqd</option>
                  <option value="CARD">Karta</option>
                  <option value="TRANSFER">O'tkazma</option>
                  <option value="CLICK">Click/Payme</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SANA</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-[13px] font-medium bg-[#007aff] hover:bg-[#0062cc] text-white rounded-md shadow-sm border border-[#005bb5] transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Payments;