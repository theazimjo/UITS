import React, { useState, useEffect } from 'react';
import { getStudents, syncStudents } from './api';
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
  ChevronRight
} from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
      setCurrentUser(user ? JSON.parse(user) : { username: 'Admin' });
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncStudents();
      fetchStudents();
    } catch (error) {
      console.error('Sinxronizatsiya xatosi:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const user = localStorage.getItem('user');
    setCurrentUser(user ? JSON.parse(user) : { username: 'Admin' });
    fetchStudents();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setStudents([]);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated && !loading) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d17]">
        <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="animate-fade-in">
       <div className="flex justify-between items-center mb-8 mt-2">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="text-sm text-gray-500">Bugungi sana: {new Date().toLocaleDateString()}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Jami talabalar', value: students.length, color: 'from-blue-500 to-indigo-600', sub: '+3 tasi o\'tgan haftada' },
          { label: 'Oylik tushum', value: '$4,250', color: 'from-purple-500 to-fuchsia-600', sub: '92% reja bajarildi' },
          { label: 'Faol guruhlar', value: '12 ta', color: 'from-emerald-500 to-teal-600', sub: 'O\'rtacha 95% davomat' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl border border-white/5 h-64 flex items-center justify-center text-gray-600 italic">
          Oylik hisobotlar grafigi (Tez orada...)
        </div>
        <div className="glass-card p-8 rounded-3xl border border-white/5 h-64 flex items-center justify-center text-gray-600 italic">
          Guruhlar bo'yicha taqsimot (Tez orada...)
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
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
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white">Talabalar</h3>
          <div className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">{students.length} ta o'quvchi</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-4 font-bold">Talaba</th>
                <th className="pb-4 font-bold">Ma'lumot</th>
                <th className="pb-4 font-bold">Yo'nalish / Maktab</th>
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
                        <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-tighter">#ID-{student.externalId || student.id + 1000}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="space-y-1">
                      {student.email && (
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Mail size={12} className="text-purple-500 opacity-60" /> {student.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <Phone size={12} className="text-emerald-500 opacity-60" /> {student.parentPhone || student.phone || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="text-xs">
                      <p className="text-gray-300 font-semibold">{student.classroom || 'Backend'}</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{student.schoolName || 'UITS Academy'}</p>
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <button className="p-3 text-gray-700 hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 italic text-xs">
                       Batafsil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-100 flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 glass-card border-r border-white/5 flex flex-col p-6 z-20 m-4 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <UserSquare2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            UITS CRM
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: 'groups', icon: <BookOpen size={20} />, label: 'Guruhlar' },
            { id: 'students', icon: <Users size={20} />, label: 'Talabalar' },
            { id: 'payments', icon: <Wallet size={20} />, label: 'To\'lovlar' },
            { id: 'staff', icon: <UserSquare2 size={20} />, label: 'Xodimlar' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                ${activeTab === item.id 
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/40 font-bold' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
            >
              <div className={activeTab === item.id ? 'text-white' : 'text-gray-600 group-hover:text-purple-400'}>
                {item.icon}
              </div>
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <button 
          onClick={handleLogout}
          className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all font-medium group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Chiqish</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Tizim bo'ylab qidirish..." 
                className="glass-input pl-12 pr-4 py-3 rounded-2xl w-80 focus:w-96 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-white transition-colors bg-white/5 p-3 rounded-2xl">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#0b0d17]"></span>
            </button>
            <div className="h-10 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-4 group cursor-pointer bg-white/5 py-2 px-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white uppercase tracking-tighter">{currentUser?.username}</p>
                <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white hover:rotate-12 transition-transform uppercase">
                {currentUser?.username?.substring(0, 2)}
              </div>
            </div>
          </div>
        </header>

        <div className="px-10 pb-10 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' ? renderDashboard() : 
           activeTab === 'students' ? renderStudents() : 
           <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600 opacity-50 uppercase tracking-[0.5em] font-black italic">
              Yaqinda qo'shiladi
           </div>}
        </div>
      </main>
    </div>
  );
}

export default App;
