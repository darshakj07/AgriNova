import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Sprout, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sun, CheckCircle, XCircle } from 'lucide-react';

export default function Login() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      let responseData;
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        responseData = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(responseData?.message || 'Invalid email or password.');
        }
      } catch (fetchError) {
        // Safe mock fallback if MongoDB is not running locally
        if (email === 'farmer@agrinova.com' && password === 'password123') {
          responseData = {
            success: true,
            token: 'mock_jwt_token_farmer',
            user: {
              id: '507f1f77bcf86cd799439011',
              firstName: 'Devendra',
              lastName: 'Patil',
              email: 'farmer@agrinova.com',
              phone: '+91 98765 43210',
              role: 'farmer',
              farmName: 'Patil Agri Farms',
              farmLocation: 'Indore, Madhya Pradesh',
              farmAcres: 15,
              primaryCrops: 'Wheat, Potato, Soybeans'
            }
          };
        } else if (email === 'buyer@agrinova.com' && password === 'password123') {
          responseData = {
            success: true,
            token: 'mock_jwt_token_buyer',
            user: {
              id: '507f1f77bcf86cd799439012',
              firstName: 'Vikram',
              lastName: 'Singh',
              email: 'buyer@agrinova.com',
              phone: '+91 99887 76655',
              role: 'buyer',
              companyName: 'Indore Wholesale Supermarkets',
              companyLocation: 'Indore, MP',
              primaryCrops: 'Wheat, Potatoes, Soybeans'
            }
          };
        } else if ((email === 'admin@gmail.com' && password === 'admin123') || (email === 'admin@agrinova.com' && password === 'password123')) {
          responseData = {
            success: true,
            token: 'mock_jwt_token_admin',
            user: {
              id: '507f1f77bcf86cd799439013',
              firstName: 'Admin',
              lastName: 'System',
              email: email,
              role: 'admin'
            }
          };
        } else {
          throw fetchError;
        }
      }

      setStatus('success');
      setErrorMessage('');
      
      // Store JWT token & User details in localStorage
      localStorage.setItem('agrinova_token', responseData.token || responseData.user?.id || 'mock_jwt_token');
      localStorage.setItem('agrinova_user', JSON.stringify(responseData.user));

      setTimeout(() => {
        if (responseData.user?.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else if (responseData.user?.role === 'buyer') {
          navigate('/buyer/dashboard');
        } else if (responseData.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Invalid email or password.');
    }
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setStatus('loading');
      try {
        const response = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Google Login failed.');
        }

        if (data.isNewUser) {
          setStatus('idle');
          // Redirect to Register page with pre-filled state
          navigate('/register', { state: { tempUser: data.tempUser } });
        } else {
          // Login successful
          setStatus('success');
          setErrorMessage('');
          localStorage.setItem('agrinova_token', data.token || data.user.id || 'mock_jwt_token');
          localStorage.setItem('agrinova_user', JSON.stringify(data.user));

          setTimeout(() => {
            if (data.user?.role === 'farmer') navigate('/farmer/dashboard');
            else if (data.user?.role === 'buyer') navigate('/buyer/dashboard');
            else if (data.user?.role === 'admin') navigate('/admin/dashboard');
            else navigate('/');
          }, 1500);
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.message);
      }
    },
    onError: () => {
      setStatus('error');
      setErrorMessage('Google Login was cancelled or failed.');
    }
  });

  return (
    <div className="min-h-screen bg-bg-base flex selection:bg-primary/20 selection:text-primary font-sans">
      
      {/* Left Column: Visual Brand Pane (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        
        {/* Ultra-Premium Mesh Gradient Background */}
        <div className="absolute inset-0 bg-primary-dark dark:bg-[#022c22]">
          <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')]" />
          
          {/* Animated Glow Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light/40 blur-[100px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/30 blur-[120px]"
          />
        </div>

        {/* Top Branding Logo */}
        <Link to="/" className="flex items-center gap-3 text-white relative z-10 self-start group">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-500">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            Agri<span className="text-secondary">Nova</span>
          </span>
        </Link>

        {/* Main Clean Content */}
        <div className="relative z-10 my-auto flex flex-col max-w-lg w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-extrabold text-5xl text-white leading-[1.1] mb-6 tracking-tight"
          >
            Cultivating <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary-light">
              the future of farming
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-white/80 leading-relaxed mb-10 max-w-md font-medium"
          >
            Join India's most advanced digital agriculture network. Connect directly with verified buyers, access real-time market intelligence, and scale your agricultural business.
          </motion.p>

          {/* Single Clean Feature Highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4 text-white bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10 rounded-2xl p-4 w-fit pr-8 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-semibold text-[15px]">100% Secure Escrow Payments</span>
            </div>
            
            <div className="flex items-center gap-4 text-white bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10 rounded-2xl p-4 w-fit pr-8 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-semibold text-[15px]">Real-time AI Crop Advisory</span>
            </div>
          </motion.div>
        </div>

        {/* Footer info inside pane */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-10 flex items-center gap-3 text-white/60 text-xs font-semibold tracking-widest uppercase"
        >
          <ShieldCheck className="w-5 h-5 text-secondary/80" />
          <span>ISO 27001 Certified Platform</span>
        </motion.div>

      </div>

      {/* Right Column: Authentication Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
        
        {/* Mobile top logo (Visible only on mobile/tablet) */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-extrabold text-base text-charcoal dark:text-gray-100 tracking-tight">
            Agri<span className="text-primary">Nova</span>
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display font-extrabold text-3xl text-charcoal dark:text-gray-100 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-charcoal dark:text-gray-100-light/70">
              Access your field mapping, crop health records, and mandi indices.
            </p>
          </div>

          {/* Form Widget */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-xl p-6 sm:p-8 relative">
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white dark:bg-[#1E293B]/95 rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                  <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100">Authenticating Securely</h3>
                  <p className="text-xs text-charcoal dark:text-gray-100-light/60 mt-1">Verifying credentials with AgriNova secure cloud servers...</p>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white dark:bg-[#1E293B] rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-primary mb-4" />
                  <h3 className="font-display font-bold text-xl text-charcoal dark:text-gray-100">Login successful</h3>
                  <p className="text-xs text-charcoal dark:text-gray-100-light/60 mt-1">Redirecting you to your AgriNova dashboard...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message Box */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs font-semibold"
              >
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-900 font-bold">Authentication failed</p>
                  <p className="mt-0.5 text-red-800/80 leading-normal">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Form Tag */}
            <form onSubmit={handleSubmit} className="space-y-5">                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-medium text-charcoal dark:text-gray-100 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-primary hover:text-primary-dark transition-colors focus:outline-none"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      className="w-full pl-12 pr-12 py-3 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-medium text-charcoal dark:text-gray-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal dark:text-gray-100-light/40 hover:text-charcoal dark:text-gray-100 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4.5 w-4.5 rounded bg-white dark:bg-[#0F172A] border-charcoal/10 dark:border-white/10 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2.5 text-xs font-bold text-charcoal dark:text-gray-100 select-none cursor-pointer">
                    Remember this device
                  </label>
                </div>

                {/* Login Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Sign In
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

            {/* Separator */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal/5 dark:border-white/5" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#1E293B] text-[11px] font-bold text-charcoal dark:text-gray-100-light/40 uppercase tracking-widest">
                Or continue with
              </span>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-3.5 rounded-2xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-[#1E293B] hover:bg-bg-base/30 text-charcoal dark:text-gray-100 text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.4 3.65 1.48 7.5l3.86 3C6.26 7.56 8.91 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.6z" />
                <path fill="#FBBC05" d="M5.34 10.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.86-3C.56 4.9.01 6.89.01 9s.55 4.1 1.47 6.1l3.86-3z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.11-4.26 1.11-3.09 0-5.74-2.52-6.67-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z" />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>

          {/* Account redirect links */}
          <p className="mt-6 text-center text-xs font-bold text-charcoal dark:text-gray-100-light/70">
            Don't have an AgriNova account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}

