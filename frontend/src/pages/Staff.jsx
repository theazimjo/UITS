import React, { useState } from 'react';
import { Plus, Trash2, Phone, CreditCard, Percent, CheckCircle2, X, Users } from 'lucide-react';
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
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Xodimlar</h2>
          <p className="text-sm text-gray-400 mt-2">O'qituvchilar va ma'muriyat boshqaruvini nazorat qilish</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Xodim qo'shish
        </button>
      </div>

      {/* Tabs and Role Actions */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8">
        {['Barchasi', ...roles.map(r => r.name)].map((roleName) => (
          <button
            key={roleName}
            onClick={() => setActiveRoleTab(roleName)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${activeRoleTab === roleName
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
              : 'bg-[#131520] border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
          >
            {roleName}
          </button>
        ))}

        <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

        {showRoleInput ? (
          <div className="flex items-center gap-2 bg-[#131520] border border-white/10 p-1 rounded-xl animate-fade-in">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="bg-transparent px-3 py-1 text-sm text-white w-32 md:w-40 outline-none placeholder-gray-600"
              placeholder="Yangi lavozim"
              autoFocus
            />
            <button onClick={handleAddRole} className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors">
              <CheckCircle2 size={16} />
            </button>
            <button onClick={() => setShowRoleInput(false)} className="p-1.5 bg-white/5 text-gray-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowRoleInput(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
          >
            <Plus size={16} /> Lavozim qo'shish
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-[#131520] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Xodim ma'lumotlari</th>
                <th className="px-6 py-4">Aloqa</th>
                <th className="px-6 py-4">Maosh Turi</th>
                <th className="px-6 py-4">Oylik maosh / KPI</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {staff.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors">
                          {staff.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {staff.role?.name || 'Lavozim belgilanmagan'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone size={14} className="text-indigo-400" />
                      <span>{staff.phone || 'Kiritilmagan'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                      ${staff.salaryType === 'FIXED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        staff.salaryType === 'KPI' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {staff.salaryType === 'FIXED' ? 'Fiks (Oylik)' : staff.salaryType === 'KPI' ? 'KPI (%)' : 'Aralash'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      {(staff.salaryType === 'FIXED' || staff.salaryType === 'MIXED') && (
                        <div className="text-sm text-gray-300 font-medium flex items-center gap-2">
                          <CreditCard size={14} className="text-gray-500" />
                          {parseInt(staff.fixedAmount).toLocaleString()} <span className="text-xs text-gray-500">UZS</span>
                        </div>
                      )}
                      {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && (
                        <div className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                          <Percent size={14} className="text-emerald-500/70" />
                          {staff.kpiPercentage}% <span className="text-xs text-emerald-500/50">KPI</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={async () => { if (window.confirm("Haqiqatdan ham bu xodimni o'chirmoqchimisiz?")) { await deleteStaff(staff.id); fetchStaff(); } }}
                      className="p-2 text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="O'chirish"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={40} className="text-gray-600 mb-3" />
                      <p className="text-gray-400 text-sm font-medium">Ushbu lavozimda xodimlar topilmadi</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi xodim qo'shish">
        <form onSubmit={onAddStaffSubmit} className="space-y-5 p-1">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-1.5 block">F.I.SH</label>
            <input
              type="text" required
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Masalan: Aliyev Vali"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1.5 block">Lavozimi</label>
              <select
                required
                value={newStaff.roleId}
                onChange={(e) => setNewStaff({ ...newStaff, roleId: e.target.value })}
                className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Tanlang...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1.5 block">Telefon raqam</label>
              <input
                type="tel"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Maosh turi</label>
            <div className="flex bg-[#131520] border border-white/10 rounded-xl p-1 gap-1">
              {[
                { type: 'FIXED', label: 'Fiks (Oylik)' },
                { type: 'KPI', label: 'KPI (%)' },
                { type: 'MIXED', label: 'Aralash' }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewStaff({ ...newStaff, salaryType: type })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${newStaff.salaryType === type
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(newStaff.salaryType === 'FIXED' || newStaff.salaryType === 'MIXED') && (
              <div className="animate-fade-in">
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Fiks summa (UZS)</label>
                <input
                  type="number" required
                  value={newStaff.fixedAmount}
                  onChange={(e) => setNewStaff({ ...newStaff, fixedAmount: parseFloat(e.target.value) })}
                  className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
            )}
            {(newStaff.salaryType === 'KPI' || newStaff.salaryType === 'MIXED') && (
              <div className="animate-fade-in">
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">KPI ulushi (%)</label>
                <input
                  type="number" required
                  value={newStaff.kpiPercentage}
                  onChange={(e) => setNewStaff({ ...newStaff, kpiPercentage: parseFloat(e.target.value) })}
                  className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0" max="100"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 text-base"
          >
            Ma'lumotlarni saqlash
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;