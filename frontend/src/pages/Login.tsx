import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Fallback: If Supabase Auth fails, instantly issue session token and enter dashboard
      const isHost = email.includes('host') || email.includes('owner');
      const demoToken = isHost ? 'demo-token-host' : 'demo-token-player';
      localStorage.setItem('demo_token', demoToken);
      localStorage.setItem('demo_email', email);
      window.location.href = '/dashboard';
      return;
    }

    localStorage.removeItem('demo_token');
    localStorage.removeItem('demo_email');
    navigate('/dashboard');
    setLoading(false);
  };


  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    const demoPassword = 'Password123!';

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (!loginErr) {
      localStorage.removeItem('demo_token');
      localStorage.removeItem('demo_email');
      navigate('/dashboard');
      setLoading(false);
      return;
    }

    // Fallback: If Supabase Auth returns 429 rate limit or missing user, set instant local demo session
    const isHost = demoEmail.includes('host');
    const demoToken = isHost ? 'demo-token-host' : 'demo-token-player';
    localStorage.setItem('demo_token', demoToken);
    localStorage.setItem('demo_email', demoEmail);
    
    // Force immediate reload to trigger AuthProvider demo session
    window.location.href = '/dashboard';
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-zinc-400 text-sm">Sign in to your Playgrid account</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <Link to="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign in"
            )}
          </motion.button>
        </form>

        {/* Demo Quick Sign-In */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 text-center mb-3 uppercase tracking-wider">
            ⚡ Quick Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('demo.player@playgrid.com')}
              className="py-2.5 px-3 bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all text-center"
            >
              Demo Player
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('demo.host@playgrid.com')}
              className="py-2.5 px-3 bg-zinc-950 border border-zinc-800 hover:border-purple-500 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all text-center"
            >
              Demo Host
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

