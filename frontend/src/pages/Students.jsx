import React from 'react';
import { RefreshCw, Trash2, Phone, Users, ChevronRight, Fingerprint } from 'lucide-react';
import { getStudents, deleteAllStudents } from '../services/api';

const Students = ({ students, syncing, handleSync, setStudents }) => {
  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">O'quvchilar</h2>
          <p className="text-sm text-gray-400 mt-2">Barcha o'quvchilar bazasi va sinxronizatsiya</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200 border border-transparent hover:border-rose-400/20"
          >
            <Trash2 size={16} />
            <span>Tozalash</span>
          </button>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg
              ${syncing
                ? 'bg-[#1e2030] text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95'}`}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sinxronlanmoqda...' : 'API orqali yangilash'}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#131520] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Talaba ma'lumotlari</th>
                <th className="px-6 py-4">Aloqa va ID</th>
                <th className="px-6 py-4 text-right">Harakat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((student) => (
                <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-sm shadow-sm">
                          {student.name.substring(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {student.schoolName || 'UITS Academy'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone size={14} className="text-emerald-500/80" />
                        <span>{student.parentPhone || student.phone || 'Kiritilmagan'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <Fingerprint size={14} className="text-gray-600" />
                        <span>ID: {student.externalId || student.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 rounded-lg text-xs font-medium transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <span>Batafsil</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {students.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Users size={32} className="text-gray-600" />
                      </div>
                      <p className="text-gray-300 font-medium mb-1">O'quvchilar topilmadi</p>
                      <p className="text-gray-500 text-sm">Hali hech qanday talaba qo'shilmagan yoki sinxronizatsiya qilinmagan.</p>
                      <button
                        onClick={handleSync}
                        className="mt-4 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Sinxronizatsiya qilish &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;