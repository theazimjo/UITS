import React, { useState } from 'react';
import { Plus, Phone, CheckCircle2, X, Users, ChevronRight, UserSquare2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createStaff, createRole } from '../services/api';
import Modal from '../components/common/Modal';

import Skeleton from '../components/common/Skeleton';

import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { getStaff, getRoles } from '../services/api';

const Staff = () => {
  const { staff: staffList = [], roles = [], setStaff: setGlobalStaff, setRoles: setGlobalRoles, loading } = useStore();
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState('Barchasi');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    roleId: '',
    phone: '',
    salaryType: 'FIXED',
    fixedAmount: '0',
    kpiPercentage: '0'
  });
  const [newRoleName, setNewRoleName] = useState('');
  const [showRoleInput, setShowRoleInput] = useState(false);

  const filteredStaff = (staffList || [])
    .filter(s => activeRoleTab === 'Barchasi' || s.role?.name === activeRoleTab);

  const handleAddRole = async () => {
    if (!newRoleName) return;
    try {
      await createRole({ name: newRoleName });
      setNewRoleName('');
      setShowRoleInput(false);
      const rolesRes = await getRoles();
      if (rolesRes.data) setGlobalRoles(rolesRes.data);
      toast.success('Yangi lavozim qo\'shildi');
    } catch (err) {
      console.error('Role creation error:', err);
      toast.error('Lavozim qo\'shishda xatolik');
    }
  };

  const onAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStaff,
        role: { id: parseInt(newStaff.roleId) },
        fixedAmount: parseFloat(newStaff.fixedAmount || 0),
        kpiPercentage: parseFloat(newStaff.kpiPercentage || 0)
      };
      await createStaff(payload);
      setNewStaff({
        name: '',
        roleId: '',
        phone: '',
        salaryType: 'FIXED',
        fixedAmount: '0',
        kpiPercentage: '0'
      });
      setIsModalOpen(false);
      
      const staffRes = await getStaff();
      if (staffRes.data) setGlobalStaff(staffRes.data);
      toast.success('Xodim qo\'shildi');
    } catch (err) {
      console.error('Error creating staff:', err);
      toast.error("Ma'lumotlarni saqlashda muammo yuzaga keldi.");
    }
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 lg:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4 z-20">

        {/* Title Area */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="p-1.5 bg-[#af52de] text-white rounded-md shadow-sm">
            <UserSquare2 size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Xodimlar</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Jami xodimlar: {filteredStaff.length} ta</p>
          </div>
        </div>

        {/* Center/Right Actions Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">

          {/* Segmented Control for Roles */}
          <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {['Barchasi', ...(Array.isArray(roles) ? roles.map(r => r.name) : [])].map((roleName) => (
              <button
                key={roleName}
                onClick={() => setActiveRoleTab(roleName)}
                className={`relative px-4 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${activeRoleTab === roleName
                  ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                  : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                  }`}
              >
                {roleName}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-white/10 hidden sm:block"></div>

          {/* Add Role / Add Staff */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {showRoleInput ? (
              <div className="flex items-center gap-1 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 p-1 rounded-md backdrop-blur-md shadow-inner animate-fade-in w-full sm:w-auto">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="bg-transparent px-2 py-0.5 text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] w-32 outline-none placeholder-gray-400"
                  placeholder="Yangi lavozim"
                  autoFocus
                />
                <button onClick={handleAddRole} className="p-1 text-[#34c759] hover:bg-[#34c759]/10 rounded transition-colors"><CheckCircle2 size={14} /></button>
                <button onClick={() => setShowRoleInput(false)} className="p-1 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded transition-colors"><X size={14} /></button>
              </div>
            ) : (
              <button
                onClick={() => setShowRoleInput(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#007aff] hover:bg-[#007aff]/10 transition-colors border border-transparent"
              >
                <Plus size={14} /> <span>Lavozim</span>
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all shadow-sm bg-[#007aff] hover:bg-[#0062cc] text-white border border-[#005bb5]"
            >
              <Plus size={14} />
              <span>Xodim</span>
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
                    <th className="px-5 py-2.5 font-medium">Xodim ma'lumotlari</th>
                    <th className="px-5 py-2.5 font-medium">Aloqa</th>
                    <th className="px-5 py-2.5 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                  {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton variant="circle" width="36px" height="36px" />
                            <div className="space-y-2 flex-1">
                              <Skeleton width="140px" height="14px" />
                              <Skeleton width="90px" height="10px" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><Skeleton width="120px" height="14px" /></td>
                        <td className="px-5 py-3"></td>
                      </tr>
                    ))
                  ) : filteredStaff.length > 0 ? filteredStaff.map((staff) => (
                    <tr
                      key={staff.id}
                      onClick={() => navigate(`/staff/${staff.id}`)}
                      className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-[12px] shadow-sm">
                            {(staff.name || 'X').substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#007aff] transition-colors">
                              {staff.name}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {staff.role?.name || 'Lavozim yo\'q'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-[12px]">
                          <Phone size={13} className="text-gray-400" />
                          <span>{staff.phone || 'Kiritilmagan'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="inline-flex items-center justify-center w-7 h-7 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[#1d1d1f] dark:hover:text-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="px-5 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                            <Users size={24} className="text-gray-400" />
                          </div>
                          <p className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Xodimlar topilmadi</p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400">"{activeRoleTab}" bo'limida xodimlar yo'q.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi xodim">
        <form onSubmit={onAddStaffSubmit} className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">F.I.SH</label>
              <input
                type="text" required
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                placeholder="Masalan: Aliyev Vali"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">LAVOZIM</label>
                <select
                  required
                  value={newStaff.roleId}
                  onChange={(e) => setNewStaff({ ...newStaff, roleId: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                >
                  <option value="" disabled>Tanlang...</option>
                  {(Array.isArray(roles) ? roles : []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TELEFON</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">MAOSH SOZLAMALARI</label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg border border-black/5 dark:border-white/10">
                  {['FIXED', 'KPI', 'MIXED'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewStaff({ ...newStaff, salaryType: type })}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all ${newStaff.salaryType === type
                        ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {type === 'FIXED' ? 'Fiks' : type === 'KPI' ? 'KPI' : 'Aralash'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(newStaff.salaryType === 'FIXED' || newStaff.salaryType === 'MIXED') && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="block text-[10px] font-medium text-gray-400 mb-1 caps">FIKS SUMMA</label>
                      <input
                        type="number"
                        value={newStaff.fixedAmount}
                        onChange={(e) => setNewStaff({ ...newStaff, fixedAmount: e.target.value })}
                        className="w-full bg-[#007aff]/5 dark:bg-[#007aff]/10 border border-[#007aff]/10 rounded-md px-3 py-2 text-[13px] font-medium text-[#007aff] outline-none"
                        placeholder="0"
                      />
                    </div>
                  )}
                  {(newStaff.salaryType === 'KPI' || newStaff.salaryType === 'MIXED') && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="block text-[10px] font-medium text-gray-400 mb-1 caps">KPI (%)</label>
                      <input
                        type="number"
                        value={newStaff.kpiPercentage}
                        onChange={(e) => setNewStaff({ ...newStaff, kpiPercentage: e.target.value })}
                        className="w-full bg-[#af52de]/5 dark:bg-[#af52de]/10 border border-[#af52de]/10 rounded-md px-3 py-2 text-[13px] font-medium text-[#af52de] outline-none"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
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

export default Staff;