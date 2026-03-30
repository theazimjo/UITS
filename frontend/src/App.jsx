import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { getStudents, syncStudents, getStaff, createStaff, deleteStaff, getRoles, createRole } from './api';
import Login from './Login';
import { 
  Users, 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  UserSquare2, 
  LogOut, 
  Search, 
  Mail, 
  Phone,
  MoreVertical,
  Bell,
  RefreshCw,
  ChevronRight,
  Plus,
  Trash2,
  DollarSign,
  Briefcase,
  X,
  CreditCard,
  Percent,
  CheckCircle2
} from 'lucide-react';

// --- Shared Components ---

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const Layout = ({ currentUser, onLogout }) => {
  return (
    <div className="min-h-screen text-gray-100 flex font-sans overflow-hidden bg-[#07080e]">
      {/* Sidebar */}
      <aside className="w-72 glass-card border-r border-white/5 flex flex-col p-6 z-20 m-4 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <UserSquare2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 italic">
            UITS CRM
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          {[
            { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { to: '/groups', icon: <BookOpen size={20} />, label: 'Guruhlar' },
            { to: '/students', icon: <Users size={20} />, label: 'Talabalar' },
            { to: '/payments', icon: <Wallet size={20} />, label: 'To\'lovlar' },
            { to: '/staff', icon: <UserSquare2 size={20} />, label: 'Xodimlar' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/60 font-black' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
            >
              <div className="group-hover:text-purple-400 transition-colors">
                {item.icon}
              </div>
              <span className="text-sm tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <button onClick={onLogout} className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all font-medium group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Chiqish</span>
        </button>
      </aside>

      {/* Main Content Area */}
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

        <div className="flex-1 overflow-y-auto px-10 pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- Pages ---

const DashboardPage = ({ students, staffCount }) => (
  <div className="animate-fade-in">
    <div className="flex justify-between items-center mb-8 mt-2">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      <div className="text-sm text-gray-500">Bugungi sana: {new Date().toLocaleDateString()}</div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {[
        { label: 'Jami talabalar', value: students.length, color: 'from-blue-500 to-indigo-600', sub: '+3 tasi o\'tgan haftada' },
        { label: 'Oylik tushum', value: '$4,250', color: 'from-purple-500 to-fuchsia-600', sub: '92% reja bajarildi' },
        { label: 'Jami xodimlar', value: staffCount, color: 'from-emerald-500 to-teal-600', sub: 'Hamma faol holatda' },
      ].map((stat, i) => (
        <div key={i} className="glass-card relative overflow-hidden p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all group shadow-2xl">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform`}></div>
          <div className="text-sm text-gray-400 mb-2 font-medium">{stat.label}</div>
          <div className="text-5xl font-black text-white mb-3 tracking-tighter">
            {stat.value}
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
            <ChevronRight size={10} className="text-purple-500" /> {stat.sub}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StudentsPage = ({ students, handleSync, syncing }) => (
  <div className="animate-fade-in">
    <div className="flex justify-between items-center mb-8 mt-2">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Talabalar boshqaruvi</h2>
        <p className="text-sm text-gray-500">Barcha o'quvchilar ro'yxati</p>
      </div>
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

    <div className="glass-card rounded-3xl border border-white/5 p-8">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
            <th className="pb-4 font-bold">Talaba</th>
            <th className="pb-4 font-bold">Ma'lumot</th>
            <th className="pb-4 font-bold">O'quv markazi</th>
            <th className="pb-4 font-bold text-right">Harakat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {students.map((student) => (
            <tr key={student.id} className="group hover:bg-white/[0.02] transition-all">
              <td className="py-5">
                <div className="flex items-center gap-4">
                  {student.photo ? (
                    <img src={student.photo} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-sm uppercase">
                      {student.name.substring(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors">{student.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-tighter">ID: {student.externalId || student.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-5">
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><Mail size={12} className="text-purple-500" /> {student.email || '—'}</div>
                  <div className="flex items-center gap-2 font-medium"><Phone size={12} className="text-emerald-500" /> {student.parentPhone || student.phone || '—'}</div>
                </div>
              </td>
              <td className="py-5 text-xs text-gray-300 font-semibold uppercase tracking-widest">
                {student.schoolName || 'UITS Academy'}
              </td>
              <td className="py-5 text-right">
                <button className="p-3 text-gray-700 hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 italic text-xs">Batafsil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StaffPage = ({ staffList, roles, fetchStaff, fetchRoles, handleDeleteStaff }) => {
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
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Xodimlar boshqaruvi</h2>
          <p className="text-sm text-gray-500">Lavozimlar bo'yicha tahlil va boshqaruv</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/20 transition-all">
          <Plus size={18} /> Xodim qo'shish
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['Barchasi', ...roles.map(r => r.name)].map((roleName) => (
          <button key={roleName} onClick={() => setActiveRoleTab(roleName)} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${activeRoleTab === roleName ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
            {roleName}
          </button>
        ))}
        {showRoleInput ? (
          <div className="flex items-center gap-2"><input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="glass-input px-4 py-1.5 rounded-lg text-xs w-32 outline-none" placeholder="Lavozim..." autoFocus/><button onClick={handleAddRole} className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white"><Plus size={16} /></button></div>
        ) : (
          <button onClick={() => setShowRoleInput(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] uppercase font-black text-purple-500 hover:bg-purple-500/10"><Plus size={14} /> Lavozim qo'shish</button>
        )}
      </div>
      
      <div className="glass-card rounded-3xl border border-white/5 p-8">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
              <th className="pb-4 font-bold">Xodim</th>
              <th className="pb-4 font-bold">Ma'lumot</th>
              <th className="pb-4 font-bold">Maosh</th>
              <th className="pb-4 font-bold text-right">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStaff.map((staff) => (
              <tr key={staff.id} className="group hover:bg-white/[0.02] transition-all">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-sm uppercase">{staff.name.substring(0, 1)}</div>
                    <div><p className="font-bold text-gray-200 group-hover:text-indigo-400 transition-colors uppercase italic">{staff.name}</p><p className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.1em]">{staff.role?.name || '—'}</p></div>
                  </div>
                </td>
                <td className="py-5 text-xs text-gray-400 font-medium"><Phone size={12} className="inline mr-2 text-emerald-500" /> {staff.phone || '—'}</td>
                <td className="py-5">
                  <div className="space-y-1">
                    {(staff.salaryType === 'FIXED' || staff.salaryType === 'MIXED') && <div className="text-sm text-gray-200 font-bold"><CreditCard size={14} className="inline mr-1 text-blue-500" /> {staff.fixedAmount} UZS</div>}
                    {(staff.salaryType === 'KPI' || staff.salaryType === 'MIXED') && <div className="text-sm text-emerald-400 font-bold"><Percent size={14} className="inline mr-1 text-emerald-500" /> {staff.kpiPercentage}%</div>}
                  </div>
                </td>
                <td className="py-5 text-right"><button onClick={() => handleDeleteStaff(staff.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="glass-card w-full max-w-lg rounded-[2.5rem] border border-white/10 p-10 relative overflow-hidden shadow-2xl">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-white uppercase italic">Yangi xodim</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10"><X size={20} /></button>
               </div>
               <form onSubmit={onAddStaffSubmit} className="space-y-6">
                  <div><label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block">Ism</label><input type="text" required value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} className="w-full glass-input rounded-2xl px-5 py-4 outline-none"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block">Lavozimi</label><select required value={newStaff.roleId} onChange={(e) => setNewStaff({...newStaff, roleId: e.target.value})} className="w-full glass-input rounded-2xl px-4 py-4 outline-none bg-[#0b0d17]">{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                    <div><label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block">Telefon</label><input type="tel" value={newStaff.phone} onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})} className="w-full glass-input rounded-2xl px-5 py-4 outline-none"/></div>
                  </div>
                  <div><label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block">Maosh Turi</label><div className="grid grid-cols-3 gap-2">{['FIXED', 'KPI', 'MIXED'].map(type => <button key={type} type="button" onClick={() => setNewStaff({...newStaff, salaryType: type})} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${newStaff.salaryType === type ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>{type}</button>)}</div></div>
                  <div className="grid grid-cols-2 gap-4">{(newStaff.salaryType === 'FIXED' || newStaff.salaryType === 'MIXED') && <input type="number" value={newStaff.fixedAmount} onChange={(e) => setNewStaff({...newStaff, fixedAmount: parseFloat(e.target.value)})} className="glass-input p-4 rounded-2xl w-full" placeholder="Summa"/>}{(newStaff.salaryType === 'KPI' || newStaff.salaryType === 'MIXED') && <input type="number" value={newStaff.kpiPercentage} onChange={(e) => setNewStaff({...newStaff, kpiPercentage: parseFloat(e.target.value)})} className="glass-input p-4 rounded-2xl w-full" placeholder="KPI %"/>}</div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-3xl mt-4 shadow-2xl">SAQLASH</button>
               </form>
            </div>
          </div>
      )}
    </div>
  );
};

// --- Main App ---

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
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
    await Promise.all([
      getStudents().then(res => setStudents(res.data)),
      getStaff().then(res => setStaffList(res.data)),
      getRoles().then(res => setRoles(res.data))
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0d17]">
      <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={
        <Login onLoginSuccess={() => {
          const user = JSON.parse(localStorage.getItem('user'));
          setCurrentUser(user);
          fetchInitialData();
          navigate('/dashboard');
        }} />
      } />

      <Route element={
        <ProtectedRoute>
          <Layout currentUser={currentUser} onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage students={students} staffCount={staffList.length} />} />
        <Route path="/students" element={<StudentsPage students={students} syncing={syncing} handleSync={async () => {
          setSyncing(true);
          await syncStudents();
          getStudents().then(res => setStudents(res.data));
          setSyncing(false);
        }} />} />
        <Route path="/staff" element={<StaffPage staffList={staffList} roles={roles} fetchStaff={() => getStaff().then(res => setStaffList(res.data))} fetchRoles={() => getRoles().then(res => setRoles(res.data))} handleDeleteStaff={async (id) => {
          if (window.confirm('Xodimni o\'chirmoqchimisiz?')) {
            await deleteStaff(id);
            getStaff().then(res => setStaffList(res.data));
          }
        }} />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* Placeholder for missing tabs */}
        <Route path="/groups" element={<div className="h-[70vh] flex items-center justify-center text-gray-700 italic uppercase tracking-[0.4em]">Guruhlar bo'limi tez orada...</div>} />
        <Route path="/payments" element={<div className="h-[70vh] flex items-center justify-center text-gray-700 italic uppercase tracking-[0.4em]">To'lovlar bo'limi tez orada...</div>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
