import React from 'react';
import { RefreshCw, Trash2, Phone } from 'lucide-react';
import { getStudents, deleteAllStudents } from '../services/api';

const Students = ({ students, syncing, handleSync, setStudents }) => {
  return (
    <div className="animate-fade-in px-4 lg:px-8">
      <div className="flex justify-between items-center mb-8 mt-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-tighter font-black italic">O'quvchilar</h2>
          <p className="text-sm text-gray-500">Barcha o'quvchilar ro'yxati</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={async () => { 
              if(window.confirm('Barchasini o\'chirishni tasdiqlaysizmi?')) { 
                try {
                  await deleteAllStudents(); 
                  const res = await getStudents();
                  setStudents(res.data);
                  alert('Baza tozalandi!');
                } catch (err) {
                  alert('Xatolik: ' + (err.response?.data?.message || 'O\'chirib bo\'lmadi.'));
                }
              } 
            }}
            className="px-6 py-3 rounded-2xl text-xs font-black uppercase bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5 active:scale-95 italic text-center min-w-[120px]"
          >
            <Trash2 size={18} className="inline mr-2" /> Tozalash
          </button>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all
              ${syncing 
                ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-xl shadow-emerald-500/10 active:scale-95'}`}
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sinxronlanmoqda...' : 'API orqali yangilash'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-white/5 p-8">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
              <th className="pb-4 font-bold">Talaba</th>
              <th className="pb-4 font-bold">Ma'lumot</th>
              <th className="pb-4 font-bold text-right">Harakat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((student) => (
              <tr key={student.id} className="group hover:bg-white/[0.02] transition-all">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    {student.photo ? (
                      <img src={student.photo} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg shadow-black/40" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-sm uppercase">
                        {student.name.substring(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors uppercase italic">{student.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">{student.schoolName || 'UITS Academy'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <div className="space-y-1 text-xs text-gray-400 font-medium font-mono">
                    <div className="flex items-center gap-2"><Phone size={12} className="text-emerald-500" /> {student.parentPhone || student.phone || '—'}</div>
                    <div className="text-[10px] text-gray-600 uppercase italic">ID: {student.externalId || student.id}</div>
                  </div>
                </td>
                <td className="py-5 text-right">
                  <button className="p-3 text-gray-700 hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 italic text-xs font-black uppercase tracking-widest">Batafsil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
