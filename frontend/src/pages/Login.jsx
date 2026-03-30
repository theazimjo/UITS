import { useState } from 'react';
import { login } from '../services/api';
import { LogIn, User, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
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
      onLoginSuccess();
    } catch (err) {
      setError('Kirish muvaffaqiyatsiz bo\'ldi. Ma\'lumotlar xato!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0b0d17]">

      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[420px] animate-fade-in relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-[#131520] p-8 sm:p-10 rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
              <LogIn className="text-white w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tizimga kirish
            </h2>
            <p className="text-gray-400 text-sm mt-2">UITS CRM boshqaruv paneliga xush kelibsiz</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 animate-fade-in">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Username Input */}
            <div className="group">
              <label className="block text-gray-400 text-sm font-medium mb-1.5">
                Foydalanuvchi nomi
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0d17] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-gray-400 text-sm font-medium mb-1.5">
                Parol
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0d17] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl mt-8 transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              'Kirish'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          &copy; 2026 UITS Management Systems.<br className="sm:hidden" /> Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
};

export default Login;