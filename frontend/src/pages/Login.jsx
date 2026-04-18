import { useState } from 'react';
import { login } from '../services/api';
import { User, Lock, AlertCircle, Loader2, Sparkles, ChevronRight } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ username, password });
      const { user } = response.data;
      
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLoginSuccess(user);
    } catch (err) {
      setError('Ma\'lumotlar noto\'g\'ri kiritildi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#000] relative overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale brightness-50"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in duration-700">
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-[1.5rem] bg-white/5 backdrop-blur-xl border border-white/10 mb-6 shadow-2xl relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <Sparkles className="text-blue-400 w-8 h-8 relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">UITS Tizimi</h1>
          <p className="text-[14px] text-gray-500 font-medium">Boshqaruv paneliga hush kelibsiz</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-[40px] p-10 rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] space-y-8"
        >
          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-[13px] font-bold flex items-center gap-3 animate-shake">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.15em] ml-1">
                Foydalanuvchi
              </label>
              <div className="relative group">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/5 group-focus-within:border-blue-500/50 rounded-2xl py-4 pl-14 pr-6 text-[15px] text-white outline-none transition-all placeholder-gray-600 hover:bg-white/10"
                  placeholder="Ismingiz yoki ID"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.15em] ml-1">
                Parol
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/5 group-focus-within:border-blue-500/50 rounded-2xl py-4 pl-14 pr-6 text-[15px] text-white outline-none transition-all placeholder-gray-600 hover:bg-white/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] py-4 rounded-2xl text-white font-black text-[15px] shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Kirish</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Support Links */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button className="text-[12px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Parolni unutdingizmi?</button>
          <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
          <button className="text-[12px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Yordam</button>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center opacity-30">
         <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">&copy; 2026 UITS Management Systems</p>
      </div>
    </div>
  );
};

export default Login;