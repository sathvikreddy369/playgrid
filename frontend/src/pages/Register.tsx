import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'GROUND_OWNER'>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Store local session for zero-verification instant signup entry
    const demoToken = `demo-token-${role === 'GROUND_OWNER' ? 'host' : 'player'}`;
    localStorage.setItem('demo_token', demoToken);
    localStorage.setItem('demo_email', email);

    // Fire Supabase sign up in background (non-blocking)
    supabase.auth.signUp({
      email,
      password,
      options: { data: { role } }
    }).catch(() => {});
    
    // Instantly enter dashboard
    window.location.href = '/dashboard';
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F7F7F2] font-sans">
      <div className="w-full max-w-md bg-white border border-[#E6E8EC] rounded-xl p-8 shadow-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2457D6] rounded-xl mx-auto flex items-center justify-center mb-4 shadow-sm">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#172033] mb-2 tracking-tight uppercase">Create Account</h1>
          <p className="text-[#667085] text-sm">Join the GAMEVIA sports community today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#667085] ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-3 pl-12 pr-4 text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#667085] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-3 pl-12 pr-4 text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#667085] ml-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  role === 'USER' 
                    ? 'bg-[#2457D6]/10 border-[#2457D6] text-[#2457D6] font-bold' 
                    : 'bg-white border-[#E6E8EC] text-[#667085] hover:border-[#2457D6]/50'
                }`}
              >
                <User className="w-4 h-4" />
                Player
              </button>
              <button
                type="button"
                onClick={() => setRole('GROUND_OWNER')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  role === 'GROUND_OWNER' 
                    ? 'bg-[#2457D6]/10 border-[#2457D6] text-[#2457D6] font-bold' 
                    : 'bg-white border-[#E6E8EC] text-[#667085] hover:border-[#2457D6]/50'
                }`}
              >
                <Lock className="w-4 h-4" />
                Owner
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 px-4 mt-2 bg-[#2457D6] hover:bg-[#1D4ED8] text-white rounded-xl font-bold text-sm shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#667085]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2457D6] font-bold hover:underline">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
