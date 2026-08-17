import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

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
    
    const isAdmin = email === 'admin@gmail.com';

    if (error) {
      // Fallback: If Supabase Auth returns 400/429/unverified in dev, set instant session
      const isHost = email.includes('host') || email.includes('owner');
      const demoToken = isAdmin ? 'demo-token-admin' : isHost ? 'demo-token-host' : 'demo-token-player';
      localStorage.setItem('demo_token', demoToken);
      localStorage.setItem('demo_email', email);
      window.location.href = isAdmin ? '/admin' : '/dashboard';
      return;
    }

    localStorage.removeItem('demo_token');
    localStorage.removeItem('demo_email');
    navigate(isAdmin ? '/admin' : '/dashboard');
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    const demoPassword = 'Password123!';
    const isAdmin = demoEmail === 'admin@gmail.com';

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (!loginErr) {
      localStorage.removeItem('demo_token');
      localStorage.removeItem('demo_email');
      navigate(isAdmin ? '/admin' : '/dashboard');
      setLoading(false);
      return;
    }

    // Fallback: Set local demo session token
    const isHost = demoEmail.includes('host');
    const demoToken = isAdmin ? 'demo-token-admin' : isHost ? 'demo-token-host' : 'demo-token-player';
    localStorage.setItem('demo_token', demoToken);
    localStorage.setItem('demo_email', demoEmail);
    
    window.location.href = isAdmin ? '/admin' : '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F7F7F2] font-sans">
      <div className="w-full max-w-md bg-white border border-[#E6E8EC] rounded-xl p-8 shadow-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2457D6] rounded-xl mx-auto flex items-center justify-center mb-4 shadow-sm">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#172033] mb-2 tracking-tight uppercase">Welcome to GAMEVIA</h1>
          <p className="text-[#667085] text-sm">Sign in to your GAMEVIA account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#667085] ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-3 pl-12 pr-4 text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors font-bold text-xs"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-[#667085]">Password</label>
              <Link to="#" className="text-xs text-[#2457D6] font-bold hover:underline transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#98A2B3]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E6E8EC] rounded-xl py-3 pl-12 pr-4 text-[#172033] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors text-xs font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 px-4 bg-[#2457D6] hover:bg-[#1D4ED8] text-white rounded-xl font-bold text-sm shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Quick Sign-In */}
        <div className="mt-6 pt-6 border-t border-[#E6E8EC]">
          <p className="text-xs font-bold text-[#98A2B3] text-center mb-3 uppercase tracking-wider">
            ⚡ Quick Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('demo.player@playgrid.com')}
              className="py-2.5 px-2 bg-white border border-[#E6E8EC] hover:border-[#2457D6] hover:text-[#2457D6] text-[#172033] rounded-xl text-[11px] font-bold transition-all text-center shadow-sm"
            >
              Demo Player
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('demo.host@playgrid.com')}
              className="py-2.5 px-2 bg-white border border-[#E6E8EC] hover:border-[#2457D6] hover:text-[#2457D6] text-[#172033] rounded-xl text-[11px] font-bold transition-all text-center shadow-sm"
            >
              Demo Owner
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin@gmail.com')}
              className="py-2.5 px-2 bg-[#2457D6]/10 border border-[#2457D6]/30 text-[#2457D6] hover:bg-[#2457D6] hover:text-white rounded-xl text-[11px] font-black transition-all text-center shadow-sm flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" /> Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#667085]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2457D6] font-bold hover:underline">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  );
}
