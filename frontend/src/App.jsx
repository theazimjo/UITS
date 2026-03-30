import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, deleteStudent } from './api';
import Login from './Login';
import { 
  Users, 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  UserSquare2, 
  LogOut, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  Phone,
  MoreVertical,
  Bell,
  Menu
} from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await createStudent(newStudent);
      setNewStudent({ name: '', email: '', phone: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) {
      try {
        await deleteStudent(id);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
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

  return (
    <div className="min-h-screen text-gray-100 flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 glass-card border-r border-white/5 flex flex-col p-6 z-20 m-4 rounded-3xl">
        <div className="flex items-center gap-3 mb-10 px-2 lg:px-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <UserSquare2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            UITS CRM
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {[
            { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
            { icon: <BookOpen size={20} />, label: 'Guruhlar' },
            { icon: <Users size={20} />, label: 'Talabalar' },
            { icon: <Wallet size={20} />, label: 'To\'lovlar' },
            { icon: <UserSquare2 size={20} />, label: 'Xodimlar' },
          ].map((item, i) => (
            <button
              key={i}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                ${item.active 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
            >
              <div className={item.active ? 'text-white' : 'text-gray-500 group-hover:text-purple-400'}>
                {item.icon}
              </div>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-medium">Chiqish</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-24 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-white hidden sm:block">Talabalarni boshqarish</h1>
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                className="glass-input pl-12 pr-4 py-2.5 rounded-xl w-64 focus:w-80 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0b0d17]"></span>
            </button>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors uppercase">{currentUser?.username}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{currentUser?.role || 'Administrator'}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[2px] group-active:scale-95 transition-transform">
                <div className="w-full h-full rounded-2xl bg-[#0b0d17] flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden">
                  {currentUser?.username?.substring(0, 2)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-8 pb-8 flex-1 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 mt-2">
            {[
              { label: 'Jami talabalar', value: students.length, color: 'from-blue-500 to-indigo-600', sub: '+3 tasi bugun' },
              { label: 'Faol guruhlar', value: '12', color: 'from-purple-500 to-fuchsia-600', sub: 'O\'rtacha 95% davomat' },
              { label: 'To\'lovlar', value: '$4,250', color: 'from-emerald-500 to-teal-600', sub: '92% yig\'ildi' },
            ].map((stat, i) => (
              <div key={i} className="glass-card relative overflow-hidden p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform`}></div>
                <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Student List */}
            <div className="xl:col-span-2 glass-card rounded-3xl border border-white/5 p-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Talabalar ro'yxati</h2>
                  <p className="text-sm text-gray-500">Hozirda {students.length} ta o'quvchi mavjud</p>
                </div>
                <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
                      <th className="pb-4 font-bold">F.I.SH</th>
                      <th className="pb-4 font-bold">Aloqa</th>
                      <th className="pb-4 font-bold text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map((student, i) => (
                      <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs">
                              {student.name.substring(0, 1)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-200 group-hover:text-purple-400 transition-colors">{student.name}</p>
                              <p className="text-[10px] text-gray-500 mt-1 uppercase">ID: {student.id + 1000}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <Mail size={12} className="text-purple-500" /> {student.email}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <Phone size={12} className="text-emerald-500" /> {student.phone || 'Noma\'lum'}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end gap-2">
                             <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                              title="O'chirish"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-600">
                             <Users size={48} className="opacity-20" />
                             <p className="text-sm italic">Hozirda hech qanday talaba yo'q.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Student Form */}
            <div className="glass-card rounded-3xl border border-white/5 p-8 h-fit animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 font-bold">
                  <Plus size={22} />
                </div>
                <h2 className="text-xl font-bold text-white">Yangi talaba</h2>
              </div>
              
              <form onSubmit={handleAddStudent} className="space-y-5">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 ml-1">To'liq ism (F.I.SH)</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 outline-none transition-all text-sm"
                    placeholder="Masalan: Aziz Azizov"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 ml-1">Email manzili</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 outline-none transition-all text-sm"
                    placeholder="aziz@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 ml-1">Telefon raqami</label>
                  <input
                    type="tel"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 outline-none transition-all text-sm"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl mt-6 transition-all shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Ro'yxatdan o'tkazish
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
