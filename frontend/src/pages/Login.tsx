import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from '../providers/AuthProvider';
import { Compass, Loader2, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (firebaseUser) {
      navigate(from, { replace: true });
    }
  }, [firebaseUser, navigate, from]);

  if (firebaseUser) {
    return null;
  }

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error', err);
      setError(err.message || 'Failed to login with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative z-10">
        <Link to="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-2xl font-black tracking-tighter text-foreground hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
            <Compass className="w-5 h-5" />
          </div>
          Playgrid
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Welcome back</h1>
          <p className="text-muted text-lg mb-10 font-medium">Find players, organize matches, and build your local sports community.</p>

          {error && (
            <div className="mb-6 p-4 text-sm font-medium text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-base font-bold text-foreground transition-all bg-surface border-2 border-border rounded-2xl hover:bg-border/50 focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 active:scale-95 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-8 text-center text-sm font-medium text-muted">
            By continuing, you agree to our <a href="#" className="text-foreground underline hover:text-primary-500">Terms of Service</a> and <a href="#" className="text-foreground underline hover:text-primary-500">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>

      {/* Right side - Hero Image / Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-indigo-700 to-purple-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40" />
        
        <div className="relative z-10 w-full h-full flex items-center justify-center p-16">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-xl"
          >
            <Quote className="w-12 h-12 text-white/50 mb-6" />
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
              "Playgrid changed how I find matches. I went from playing once a month to playing every week with people who match my skill level."
            </h2>
            <div className="flex items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Alex+M&background=ffffff&color=000000" alt="User" className="w-12 h-12 rounded-full border-2 border-white/20" />
              <div>
                <p className="text-white font-bold text-lg">Alex Morgan</p>
                <p className="text-white/70 font-medium text-sm uppercase tracking-wider">Community Organizer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
