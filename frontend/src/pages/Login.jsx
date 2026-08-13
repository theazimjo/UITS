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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* Earth video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
        >
          <source src="/earth.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/45"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80"></div>
      </div>

      {/* Login Card — iOS glass style */}
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in duration-700">

        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-[1.5rem] bg-white/10 backdrop-blur-2xl border border-white/25 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-60"></div>
             <Sparkles className="text-white w-8 h-8 relative z-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">UITS Tizimi</h1>
          <p className="text-[14px] text-white/70 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">Boshqaruv paneliga hush kelibsiz</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative bg-white/10 backdrop-blur-[32px] backdrop-saturate-[180%] p-10 rounded-[3rem] border border-white/25 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] space-y-8 overflow-hidden"
        >
          {/* Glass specular highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/25 via-white/5 to-transparent"></div>
          <div className="pointer-events-none absolute -top-1/2 -left-1/4 w-[80%] h-[80%] rounded-full bg-white/10 blur-[60px]"></div>

          <div className="relative space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-400/30 text-rose-100 px-4 py-3 rounded-2xl text-[13px] font-bold flex items-center gap-3 animate-shake backdrop-blur-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-white/60 uppercase tracking-[0.15em] ml-1">
                Foydalanuvchi
              </label>
              <div className="relative group">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/10 border border-white/20 group-focus-within:border-white/50 group-focus-within:bg-white/15 rounded-2xl py-4 pl-14 pr-6 text-[15px] text-white outline-none transition-all placeholder-white/40 hover:bg-white/[0.14]"
                  placeholder="Ismingiz yoki ID"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-white/60 uppercase tracking-[0.15em] ml-1">
                Parol
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/10 border border-white/20 group-focus-within:border-white/50 group-focus-within:bg-white/15 rounded-2xl py-4 pl-14 pr-6 text-[15px] text-white outline-none transition-all placeholder-white/40 hover:bg-white/[0.14]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white/90 hover:bg-white active:scale-[0.98] py-4 rounded-2xl text-black font-black text-[15px] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
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
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[12px] text-white/50 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">Muammolar bo'lsa administratorga murojaat qiling</p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center opacity-40">
         <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">&copy; 2026 UITS Management Systems</p>
      </div>
    </div>
  );
};

export default Login;
