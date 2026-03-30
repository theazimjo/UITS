import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  getStudents, syncStudents, 
  getStaff, createStaff, deleteStaff, 
  getRoles, createRole,
  getGroups, createGroup, deleteGroup,
  getFields, createField, deleteField,
  getCourses, createCourse, deleteCourse,
  getRooms, createRoom, deleteRoom
} from './api';
import Login from './Login';
import { 
  Users, LayoutDashboard, BookOpen, Wallet, UserSquare2, LogOut, 
  Search, Mail, Phone, MoreVertical, Bell, RefreshCw, ChevronRight, 
  Plus, Trash2, DollarSign, Briefcase, X, CreditCard, Percent, 
  CheckCircle2, Calendar, Clock, MapPin, Layers, BookMarked
} from 'lucide-react';

// --- Shared Components ---

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="glass-card w-full max-w-xl rounded-[2.5rem] border border-white/10 p-10 relative overflow-hidden shadow-2xl">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h3>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-gray-500 hover:text-white transition-all"><X size={20} /></button>
         </div>
         {children}
      </div>
    </div>
  );
};

const Layout = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen text-gray-100 flex font-sans overflow-hidden bg-[#07080e]">
      <aside className="w-72 glass-card border-r border-white/5 flex flex-col p-6 z-20 m-4 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <UserSquare2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 italic">UITS CRM</span>
        </div>
        <nav className="flex-1 flex flex-col gap-3">
          {[
            { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { to: '/groups', icon: <BookOpen size={20} />, label: 'Guruhlar' },
            { to: '/students', icon: <Users size={20} />, label: 'Talabalar' },
            { to: '/payments', icon: <Wallet size={20} />, label: 'To\'lovlar' },
            { to: '/staff', icon: <UserSquare2 size={20} />, label: 'Xodimlar' },
          ].map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/60 font-black' : 'text-gray-500 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}>
              <div className="group-hover:text-purple-400 transition-colors">{item.icon}</div>
              <span className="text-sm tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={onLogout} className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all font-medium group"><LogOut size={20} className="group-hover:-translate-x-1" /><span className="text-sm">Chiqish</span></button>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input type="text" placeholder="Tizim bo'ylab qidirish..." className="glass-input pl-12 pr-4 py-3 rounded-2xl w-80 focus:w-96 outline-none text-sm transition-all shadow-lg border-white/5" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl border border-white/5"><Bell size={20} /></button>
            <div className="flex items-center gap-4 bg-white/5 py-1.5 px-3 rounded-2xl border border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white uppercase tracking-tighter leading-none">{currentUser?.username}</p>
                <p className="text-[8px] text-purple-500 font-black uppercase tracking-[0.2em] mt-1">Status: Active</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-10 pb-10"><Outlet /></div>
      </main>
    </div>
  );
};

// --- Pages ---

const DashboardPage = ({ students, staffCount, groupsCount }) => (
  <div className="animate-fade-in px-4 lg:px-8">
     <h2 className="text-2xl font-bold text-white mb-8 mt-2 uppercase tracking-tighter italic font-black">Asosiy panel</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {[
        { label: 'Jami talabalar', value: students.length, color: 'from-blue-500 to-indigo-600', sub: '+3 tasi o\'tgan haftada' },
        { label: 'Oylik tushum', value: '$4,250', color: 'from-purple-500 to-fuchsia-600', sub: '92% reja bajarildi' },
        { label: 'Jami xodimlar', value: staffCount, color: 'from-emerald-500 to-teal-600', sub: 'Hamma faol holatda' },
      ].map((stat, i) => (
        <div key={i} className="glass-card relative overflow-hidden p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all group shadow-2xl">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform`}></div>
          <div className="text-sm text-gray-400 mb-2 font-medium">{stat.label}</div>
          <div className="text-5xl font-black text-white mb-3 tracking-tighter">{stat.value}</div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
            <ChevronRight size={10} className="text-purple-500" /> {stat.sub}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StudentsPage = ({ students, handleSync, syncing, fetchStudents }) => (
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
                getStudents().then(res => setStudents(res.data)); // Faqat o'chganini ko'rish uchun ro'yxatni yangilaymiz
                alert('Baza tozalandi!');
              } catch (err) {
                alert('Xatolik: ' + (err.response?.data?.message || 'O\'chirib bo\'lmadi.'));
              }
            } 
          }}
          className="px-6 py-3 rounded-2xl text-xs font-black uppercase bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5 active:scale-95 italic"
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

const StaffPage = ({ staffList, roles, fetchStaff, fetchRoles }) => {
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
          <div className="flex items-center gap-2 animate-fade-in"><input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="glass-input px-4 py-2 rounded-xl text-xs w-32 outline-none" placeholder="Lavozim..." autoFocus/><button onClick={handleAddRole} className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={16} /></button><button onClick={() => setShowRoleInput(false)} className="p-2 text-gray-500"><X size={16} /></button></div>
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
                  <button onClick={async () => { if(window.confirm('O\'chirmoqchisiz?')){ await deleteStaff(staff.id); fetchStaff(); } }} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi xodim qo'shish">
        <form onSubmit={onAddStaffSubmit} className="space-y-6">
          <div className="relative">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">F.I.SH</label>
            <input type="text" required value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} className="w-full glass-input rounded-2xl px-5 py-4 outline-none text-sm border-white/5 focus:border-purple-500/40" placeholder="Ali Valiev"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Lavozimi</label>
              <select required value={newStaff.roleId} onChange={(e) => setNewStaff({...newStaff, roleId: e.target.value})} className="w-full glass-input rounded-2xl px-4 py-4 outline-none text-sm bg-[#0b0d17] appearance-none cursor-pointer">
                <option value="">Tanlang...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Telefon</label>
              <input type="tel" value={newStaff.phone} onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})} className="w-full glass-input rounded-2xl px-5 py-4 outline-none text-sm" placeholder="+998 ..."/>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3 block ml-1">Maosh Turi</label>
            <div className="grid grid-cols-3 gap-2">
               {['FIXED', 'KPI', 'MIXED'].map(type => (
                 <button key={type} type="button" onClick={() => setNewStaff({...newStaff, salaryType: type})} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all ${newStaff.salaryType === type ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                   {type === 'FIXED' ? 'Fiks' : type === 'KPI' ? 'KPI' : 'Aralash'}
                 </button>
               ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {(newStaff.salaryType === 'FIXED' || newStaff.salaryType === 'MIXED') && (
              <div className="animate-fade-in"><label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Summa (UZS)</label><input type="number" required value={newStaff.fixedAmount} onChange={(e) => setNewStaff({...newStaff, fixedAmount: parseFloat(e.target.value)})} className="glass-input p-4 rounded-2xl w-full" placeholder="UZS"/></div>
            )}
            {(newStaff.salaryType === 'KPI' || newStaff.salaryType === 'MIXED') && (
              <div className="animate-fade-in"><label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">KPI (%)</label><input type="number" required value={newStaff.kpiPercentage} onChange={(e) => setNewStaff({...newStaff, kpiPercentage: parseFloat(e.target.value)})} className="glass-input p-4 rounded-2xl w-full" placeholder="%"/></div>
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

const GroupsPage = ({ 
  groups, fields, courses, rooms, staffList, 
  fetchGroups, fetchFields, fetchCourses, fetchRooms 
}) => {
  const [activeTab, setActiveTab] = useState('guruhlar');
  const [modalType, setModalType] = useState(null); 
  const [formData, setFormData] = useState({
    field: { name: '', duration: '' },
    course: { name: '', duration: '', monthlyPrice: '', fieldId: '' },
    room: { name: '', capacity: '' },
    group: { name: '', fieldsId: '', courseId: '', roomId: '', teacherId: '', days: [], startTime: '', endTime: '', startDate: '', endDate: '', monthlyPrice: '' }
  });

  useEffect(() => {
    if (formData.group.startDate && formData.group.courseId) {
      const course = courses.find(c => c.id === parseInt(formData.group.courseId));
      if (course) {
        const start = new Date(formData.group.startDate);
        const end = new Date(start.setMonth(start.getMonth() + parseInt(course.duration)));
        setFormData(prev => ({ 
          ...prev, 
          group: { ...prev.group, endDate: end.toISOString().split('T')[0], monthlyPrice: course.monthlyPrice } 
        }));
      }
    }
  }, [formData.group.startDate, formData.group.courseId]);

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      if (type === 'field') await createField(formData.field);
      if (type === 'course') await createCourse({ ...formData.course, field: { id: parseInt(formData.course.fieldId) } });
      if (type === 'room') await createRoom(formData.room);
      if (type === 'group') await createGroup({ 
        ...formData.group, 
        course: { id: parseInt(formData.group.courseId) },
        room: { id: parseInt(formData.group.roomId) },
        teacher: { id: parseInt(formData.group.teacherId) }
      });
      setModalType(null); fetchGroups(); fetchFields(); fetchCourses(); fetchRooms();
    } catch (err) { console.error(err); }
  };

  const teachers = staffList.filter(s => s.role?.name?.toLowerCase().includes('o\'qituvchi'));

  return (
    <div className="animate-fade-in px-4 lg:px-8">
      <div className="flex justify-between items-center mb-8 mt-2">
        <div><h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">O'quv tizimi</h2><p className="text-sm text-gray-500">Guruhlar va dars jadvali</p></div>
        <div className="flex gap-4">
          <button onClick={() => setModalType('field')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all">+ Soha</button>
          <button onClick={() => setModalType('course')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all">+ Kurs</button>
          <button onClick={() => setModalType('group')} className="px-6 py-2.5 bg-purple-600 rounded-xl text-xs font-black uppercase text-white shadow-xl shadow-purple-600/20 active:scale-95 transition-all italic">Guruh yaratish</button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {['guruhlar', 'sohalar', 'xonalar'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === t ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
        ))}
      </div>

      {activeTab === 'guruhlar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {groups.map(g => (
            <div key={g.id} className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group transition-all hover:border-purple-600/20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-bl-full"></div>
              <div className="flex justify-between items-start mb-6">
                <div><h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{g.name}</h4><p className="text-[10px] text-purple-500 font-black uppercase mt-1 tracking-widest">{g.course?.field?.name} / {g.course?.name}</p></div>
                <div className="text-right"><p className="text-lg font-black text-emerald-400 font-mono tracking-tighter">{g.monthlyPrice} <span className="text-[10px] text-gray-500 font-medium">UZS</span></p></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 font-bold font-mono uppercase italic">
                <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 rounded-2xl"><Clock size={16} className="text-blue-500" /><p className="text-gray-200">{g.startTime} - {g.endTime}</p></div>
                <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 rounded-2xl"><MapPin size={16} className="text-emerald-500" /><p className="text-gray-200">{g.room?.name || '—'}</p></div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl flex flex-wrap gap-2 mb-6">
                {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(day => (
                  <span key={day} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${g.days.includes(day) ? 'bg-purple-600 text-white' : 'bg-black/20 text-gray-700'}`}>{day}</span>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5 font-black uppercase text-[10px] tracking-widest">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-[10px]">{g.teacher?.name?.substring(0, 1)}</div><p className="text-gray-400">{g.teacher?.name}</p></div>
                <p className="text-gray-600 italic">{g.startDate} — {g.endDate}</p>
              </div>
            </div>
          ))}
          {groups.length === 0 && <div className="col-span-2 py-20 text-center text-gray-700 italic text-sm border-2 border-dashed border-white/5 rounded-[2.5rem]">Hali guruhlar mavjud emas</div>}
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={modalType === 'field' ? 'Yangi Soha' : modalType === 'course' ? 'Yangi Kurs' : modalType === 'room' ? 'Yangi Xona' : 'Guruh Yaratish'}>
         {modalType === 'field' && (
          <form onSubmit={(e) => handleSubmit(e, 'field')} className="space-y-6">
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Soha Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, field: {...formData.field, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="Masalan: Backend"/></div>
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Davomiyligi (oy)</label><input type="number" required onChange={(e) => setFormData({...formData, field: {...formData.field, duration: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="9"/></div>
            <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] italic shadow-2xl">SAQLASH</button>
          </form>
        )}
        {modalType === 'course' && (
          <form onSubmit={(e) => handleSubmit(e, 'course')} className="space-y-6">
             <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Sohani tanlang</label><select required onChange={(e) => setFormData({...formData, course: {...formData.course, fieldId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
             <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Kurs Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, course: {...formData.course, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="Masalan: Node.js"/></div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Davomiyligi (oy)</label><input type="number" required onChange={(e) => setFormData({...formData, course: {...formData.course, duration: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="2"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Oylik Narxi</label><input type="number" required onChange={(e) => setFormData({...formData, course: {...formData.course, monthlyPrice: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="500,000"/></div>
             </div>
             <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase italic shadow-2xl">SAQLASH</button>
          </form>
        )}
        {modalType === 'room' && (
          <form onSubmit={(e) => handleSubmit(e, 'room')} className="space-y-6">
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Xona Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, room: {...formData.room, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" /></div>
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Sig'imi</label><input type="number" onChange={(e) => setFormData({...formData, room: {...formData.room, capacity: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" /></div>
            <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase italic shadow-2xl">SAQLASH</button>
          </form>
        )}
        {modalType === 'group' && (
          <form onSubmit={(e) => handleSubmit(e, 'group')} className="space-y-6 scrollbar-hide max-h-[70vh] overflow-y-auto px-1">
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Guruh Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, group: {...formData.group, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Kursni tanlang</label><select required onChange={(e) => setFormData({...formData, group: {...formData.group, courseId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{courses.map(c => <option key={c.id} value={c.id}>{c.field?.name} - {c.name}</option>)}</select></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">O'qituvchi</label><select required onChange={(e) => setFormData({...formData, group: {...formData.group, teacherId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Xona</label><select required onChange={(e) => setFormData({...formData, group: {...formData.group, roomId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
             </div>
             <div><label className="text-[10px] text-gray-500 font-black mb-3 block uppercase tracking-widest">Kunlar</label><div className="flex flex-wrap gap-2">{['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(d => <button key={d} type="button" onClick={() => { const days = formData.group.days.includes(d) ? formData.group.days.filter(x => x !== d) : [...formData.group.days, d]; setFormData({...formData, group: {...formData.group, days}}); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${formData.group.days.includes(d) ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-600'}`}>{d}</button>)}</div></div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Boshlanish vaqti</label><input type="time" required onChange={(e) => setFormData({...formData, group: {...formData.group, startTime: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Tugash vaqti</label><input type="time" required onChange={(e) => setFormData({...formData, group: {...formData.group, endTime: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Boshlanish sanasi</label><input type="date" required onChange={(e) => setFormData({...formData, group: {...formData.group, startDate: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Tugash sanasi (Auto)</label><input type="date" required value={formData.group.endDate} onChange={(e) => setFormData({...formData, group: {...formData.group, endDate: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
             </div>
             <button type="submit" className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-3xl uppercase italic shadow-2xl tracking-widest text-xs">TASDIQLASH</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

// --- Main App ---

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [fields, setFields] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token) {
      setCurrentUser(user ? JSON.parse(user) : { username: 'Admin' });
      fetchInitialData();
    } else if (location.pathname !== '/login') {
      navigate('/login');
    }
    setLoading(false);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [st, sf, rl, gr, fl, cr, rm] = await Promise.all([
        getStudents(), getStaff(), getRoles(), getGroups(), getFields(), getCourses(), getRooms()
      ]);
      setStudents(st.data); setStaffList(sf.data); setRoles(rl.data); setGroups(gr.data);
      setFields(fl.data); setCourses(cr.data); setRooms(rm.data);
    } catch (e) { console.error('Initial fetch error:', e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token'); localStorage.removeItem('user');
    setCurrentUser(null); navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0b0d17]"><div className="w-12 h-12 border-4 border-t-purple-600 rounded-full animate-spin"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={<Login onLoginSuccess={() => { setCurrentUser(JSON.parse(localStorage.getItem('user'))); fetchInitialData(); navigate('/dashboard'); }} />} />
      <Route element={<ProtectedRoute><Layout currentUser={currentUser} onLogout={handleLogout} /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage students={students} staffCount={staffList.length} groupsCount={groups.length} />} />
        <Route path="/students" element={<StudentsPage students={students} syncing={syncing} handleSync={async () => { setSyncing(true); await syncStudents(); getStudents().then(res => setStudents(res.data)); setSyncing(false); }} />} />
        <Route path="/staff" element={<StaffPage staffList={staffList} roles={roles} fetchStaff={() => getStaff().then(res => setStaffList(res.data))} fetchRoles={() => getRoles().then(res => setRoles(res.data))} />} />
        <Route path="/groups" element={<GroupsPage groups={groups} fields={fields} courses={courses} rooms={rooms} staffList={staffList} fetchGroups={() => getGroups().then(res => setGroups(res.data))} fetchFields={() => getFields().then(res => setFields(res.data))} fetchCourses={() => getCourses().then(res => setCourses(res.data))} fetchRooms={() => getRooms().then(res => setRooms(res.data))} />} />
        <Route path="/payments" element={<div className="h-[70vh] flex flex-col items-center justify-center text-gray-700 italic font-black uppercase tracking-[0.4em] gap-4"><Wallet size={48} className="opacity-20"/><p>To'lovlar bo'limi tez orada...</p></div>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
