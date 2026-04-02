import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Trash2, Phone, Users, ChevronRight, Fingerprint, Search, ChevronLeft } from 'lucide-react';
import { getStudents, deleteAllStudents } from '../services/api';

const Students = ({ students, syncing, handleSync, setStudents }) => {
  // Qidiruv va Sahifalash state'lari
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Bitta sahifada nechta o'quvchi chiqishi

  // Qidiruv bo'yicha filtrlash
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name?.toLowerCase().includes(searchLower) ||
        student.phone?.includes(searchTerm) ||
        student.parentPhone?.includes(searchTerm) ||
        student.externalId?.toLowerCase().includes(searchLower)
      );
    });
  }, [students, searchTerm]);

  // Qidiruv o'zgarganda birinchi sahifaga qaytish
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Barcha o'quvchilar bazasi: {students?.length || 0} ta</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Ism, tel yoki ID bo'yicha..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 backdrop-blur-md shadow-inner text-[#1d1d1f] dark:text-[#f5f5f7]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (window.confirm("Barcha o'quvchilarni o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.")) {
                  try {
                    await deleteAllStudents();
                    const res = await getStudents();
                    setStudents(res.data);
                    alert("Baza muvaffaqiyatli tozalandi!");
                  } catch (err) {
                    alert("Xatolik: " + (err.response?.data?.message || "O'chirib bo'lmadi."));
                  }
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#ff3b30] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 transition-colors border border-[#ff3b30]/20"
            >
              <Trash2 size={14} />
              <span>Tozalash</span>
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
                    <th className="px-5 py-2.5 font-medium">Talaba ma'lumotlari</th>
                    <th className="px-5 py-2.5 font-medium">Aloqa va ID</th>
                    <th className="px-5 py-2.5 font-medium text-right">Harakat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-default">
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
                    ))
                  ) : (
                    /* Empty State or No Search Results */
                    <tr>
                      <td colSpan="3" className="px-5 py-16 text-center">
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
    </div>
  );
};

export default Students;