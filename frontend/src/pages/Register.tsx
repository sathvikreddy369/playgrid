import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'GROUND_OWNER'>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Pass role to user metadata for initial setup
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role
        }
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      // In production, might show a verification message. For now, navigate to dashboard.
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      
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
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-zinc-400 text-sm">Join the Playgrid community today</p>
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

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300 ml-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${
                  role === 'USER' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <User className="w-4 h-4" />
                Player
              </button>
              <button
                type="button"
                onClick={() => setRole('GROUND_OWNER')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${
                  role === 'GROUND_OWNER' 
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Lock className="w-4 h-4" />
                Owner
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        <p className="text-center mt-8 text-sm text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
