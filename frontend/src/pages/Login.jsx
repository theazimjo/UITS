import { useState } from 'react';
import { login } from '../services/api';
import { User, Lock, AlertCircle, Loader2, Hexagon } from 'lucide-react';

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
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError('Kirish muvaffaqiyatsiz. Ma\'lumotlar xato!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1628156108168-cf890eb9385b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* Oyna (Window) Container */}
      <div className="w-full max-w-[360px] animate-fade-in relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white/70 dark:bg-[#1e1e1e]/80 backdrop-blur-2xl p-8 rounded-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            {/* App Icon (macOS squircle style) */}
            <div className="w-14 h-14 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 rounded-[14px] flex items-center justify-center mb-4 shadow-sm">
              <Hexagon className="text-[#007aff] dark:text-[#0a84ff] w-8 h-8" fill="currentColor" fillOpacity={0.2} strokeWidth={1.5} />
            </div>
            <h2 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-snug">
              UITS CRM
            </h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
              Tizimga kirish uchun ma'lumotlarni kiriting
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] px-3 py-2 rounded-md mb-5 text-[12px] font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Username Input */}
            <div className="group">
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">
                Foydalanuvchi
              </label>
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007aff] transition-colors pointer-events-none">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 backdrop-blur-md shadow-inner disabled:opacity-50"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">
                Parol
              </label>
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007aff] transition-colors pointer-events-none">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-md text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all placeholder-gray-400 backdrop-blur-md shadow-inner disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007aff] hover:bg-[#0062cc] text-white font-medium text-[13px] py-2 px-4 rounded-md mt-6 transition-colors shadow-sm flex items-center justify-center gap-1.5 border border-[#005bb5] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              'Kirish'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 mt-6 font-medium">
          &copy; 2026 UITS Management Systems.
        </p>
      </div>
    </div>
  );
};

export default Login;