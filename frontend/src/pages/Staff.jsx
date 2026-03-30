import React, { useState } from 'react';
import { Plus, Trash2, Phone, CreditCard, Percent, CheckCircle2, X } from 'lucide-react';
import { createStaff, deleteStaff, createRole } from '../services/api';
import Modal from '../components/common/Modal';

const Staff = ({ staffList, roles, fetchStaff, fetchRoles }) => {
  const [activeRoleTab, setActiveRoleTab] = useState('Barchasi');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', roleId: '', phone: '', salaryType: 'FIXED', fixedAmount: 0, kpiPercentage: 0 });
  const [newRoleName, setNewRoleName] = useState('');
  const [showRoleInput, setShowRoleInput] = useState(false);

  const filteredStaff = activeRoleTab === 'Barchasi'
    ? staffList
    : staffList.filter(s => s.role?.name === activeRoleTab);

  const handleAddRole = async () => {
    if (!newRoleName) return;
    await createRole({ name: newRoleName });
    setNewRoleName('');
    setShowRoleInput(false);
    fetchRoles();
  };

  const onAddStaffSubmit = async (e) => {
    e.preventDefault();
    await createStaff({ ...newStaff, role: { id: parseInt(newStaff.roleId) } });
    setNewStaff({ name: '', roleId: '', phone: '', salaryType: 'FIXED', fixedAmount: 0, kpiPercentage: 0 });
    setIsModalOpen(false);
    fetchStaff();
  };

  return (
    <div className="animate-fade-in px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-tighter font-black italic">Xodimlar</h2>
          <p className="text-sm text-gray-500">O'qituvchilar va ma'muriyat boshqaruvi</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/20 transition-all active:scale-95 italic">
          <Plus size={18} /> Xodim qo'shish
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['Barchasi', ...roles.map(r => r.name)].map((roleName) => (
          <button key={roleName} onClick={() => setActiveRoleTab(roleName)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${activeRoleTab === roleName ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
            {roleName}
          </button>
        ))}
        {showRoleInput ? (
          <div className="flex items-center gap-2 animate-fade-in">
            <input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="glass-input px-4 py-2 rounded-xl text-xs w-32 outline-none" placeholder="Lavozim..." autoFocus />
            <button onClick={handleAddRole} className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={16} /></button>
            <button onClick={() => setShowRoleInput(false)} className="p-2 text-gray-500"><X size={16} /></button>
          </div>
        ) : (
          <button onClick={() => setShowRoleInput(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase font-black text-purple-500 hover:bg-purple-500/10 transition-all">
            <Plus size={14} /> Lavozim qo'shish
          </button>
        )}
      </div>

      <div className="glass-card rounded-3xl border border-white/5 p-8">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
              <th className="pb-4 font-bold">Xodim</th>
              <th className="pb-4 font-bold">Ma'lumot</th>
              <th className="pb-4 font-bold">Maosh Turi</th>
              <th className="pb-4 font-bold">Oylik maosh / KPI</th>
              <th className="pb-4 font-bold text-right">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStaff.map((staff) => (
              <tr key={staff.id} className="group hover:bg-white/[0.02] transition-all">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm uppercase">{staff.name.substring(0, 1)}</div>
                    <div><p className="font-bold text-gray-200 group-hover:text-indigo-400 transition-colors uppercase italic tracking-tight">{staff.name}</p><p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">{staff.role?.name || 'Lavozim yo\'q'}</p></div>
                  </div>
                </td>
                <td className="py-5 text-xs text-gray-400 font-bold font-mono italic"><Phone size={12} className="inline mr-2 text-emerald-500" /> {staff.phone || '—'}</td>
                <td className="py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm
                    ${staff.salaryType === 'FIXED' ? 'bg-blue-500/10 text-blue-400' :
                      staff.salaryType === 'KPI' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                    {staff.salaryType === 'FIXED' ? 'Fiks (Oylik)' : staff.salaryType === 'KPI' ? 'KPI (%)' : 'Aralash'}
                  </span>
                </td>
                <td className="py-5">
                  <div className="space-y-1">
                    {(staff.salaryType === 'FIXED' || staff.salaryType === 'MIXED') && (
                      <div className="text-sm text-gray-200 font-black flex items-center gap-1.5"><CreditCard size={14} className="text-blue-500" /> {staff.fixedAmount} <span className="text-[10px] text-gray-500 font-medium">UZS</span></div>
                    )}
                    {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && (
                      <div className="text-sm text-emerald-400 font-black flex items-center gap-1.5 italic"><Percent size={14} className="text-emerald-500" /> {staff.kpiPercentage}% <span className="text-[10px] text-gray-500 italic">KPI</span></div>
                    )}
                  </div>
                </td>
                <td className="py-5 text-right">
                  <button onClick={async () => { if (window.confirm('O\'chirmoqchisiz?')) { await deleteStaff(staff.id); fetchStaff(); } }} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi xodim qo'shish">        <form onSubmit={onAddStaffSubmit} className="space-y-6">
        <div className="relative">
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">F.I.SH</label>
          <input type="text" required value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full glass-input rounded-2xl px-5 py-4 outline-none text-sm border-white/5 focus:border-purple-500/40" placeholder="Ali Valiev" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Lavozimi</label>
            <select required value={newStaff.roleId} onChange={(e) => setNewStaff({ ...newStaff, roleId: e.target.value })} className="w-full glass-input rounded-2xl px-4 py-4 outline-none text-sm bg-[#0b0d17] appearance-none cursor-pointer">
              <option value="">Tanlang...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Telefon</label>
            <input type="tel" value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} className="w-full glass-input rounded-2xl px-5 py-4 outline-none text-sm" placeholder="+998 ..." />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3 block ml-1">Maosh Turi</label>
          <div className="grid grid-cols-3 gap-2">
            {['FIXED', 'KPI', 'MIXED'].map(type => (
              <button key={type} type="button" onClick={() => setNewStaff({ ...newStaff, salaryType: type })} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${newStaff.salaryType === type ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                {type === 'FIXED' ? 'Fiks' : type === 'KPI' ? 'KPI' : 'Aralash'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          {(newStaff.salaryType === 'FIXED' || newStaff.salaryType === 'MIXED') && (
            <div className="animate-fade-in">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Summa (UZS)</label>
              <input type="number" required value={newStaff.fixedAmount} onChange={(e) => setNewStaff({ ...newStaff, fixedAmount: parseFloat(e.target.value) })} className="glass-input p-4 rounded-2xl w-full" placeholder="UZS" />
            </div>
          )}
          {(newStaff.salaryType === 'KPI' || newStaff.salaryType === 'MIXED') && (
            <div className="animate-fade-in">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">KPI (%)</label>
              <input type="number" required value={newStaff.kpiPercentage} onChange={(e) => setNewStaff({ ...newStaff, kpiPercentage: parseFloat(e.target.value) })} className="glass-input p-4 rounded-2xl w-full" placeholder="%" />
            </div>
          )}
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-5 rounded-[1.5rem] mt-4 shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-xs italic flex items-center justify-center gap-2">
          <CheckCircle2 size={18} /> Saqlash
        </button>
      </form>
      </Modal>
    </div>
  );
};

export default Staff;
