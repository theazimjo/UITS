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
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      
      <div className="w-full max-w-md animate-fade-in">
        <form 
          onSubmit={handleSubmit}
          className="glass-card p-10 rounded-3xl border border-white/10"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-purple-500/20">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Tizimga kirish
            </h2>
            <p className="text-gray-400 text-sm mt-2">UITS CRM tizimiga xush kelibsiz</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div className="relative group">
              <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider ml-1">
                Foydalanuvchi nomi
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 glass-input rounded-xl focus:outline-none"
                  placeholder="admin"
                  required
                />
              </div>
            </div>
            
            <div className="relative group">
              <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider ml-1">
                Parol
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 glass-input rounded-xl focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl mt-8 transition-all shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Tekshirilmoqda...
              </>
            ) : (
              'Kirish'
            )}
          </button>
        </form>
        
        <p className="text-center text-gray-500 text-sm mt-8">
          &copy; 2026 UITS Management Systems. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
};

export default Login;
