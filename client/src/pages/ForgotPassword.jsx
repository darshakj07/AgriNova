import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, ArrowLeft, CheckCircle, XCircle, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function ForgotPassword() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
  const otpInputsRef = useRef([]);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const updateOtpDigit = (index, value) => {
    const digits = otpCode.split('').slice(0, 6);
    const nextDigits = [...Array(6).fill('')];

    for (let i = 0; i < 6; i += 1) {
      nextDigits[i] = digits[i] ?? '';
    }

    nextDigits[index] = value;
    setOtpCode(nextDigits.join(''));

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedValue) return;

    setOtpCode(pastedValue.padEnd(6, ''));
    const nextIndex = Math.min(pastedValue.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  const resetState = () => {
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setStep(1);
    setStatus('idle');
    setMessage('');
    setErrorMessage('');
  };

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to send OTP.');
      }

      setStatus('success');
      setMessage('OTP sent to your email address. Enter the 6-digit code below.');
      setStep(2);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send OTP.');
    }
  };

  const verifyOtp = async () => {
    if (otpCode.length !== 6) {
      setStatus('error');
      setErrorMessage('Please enter the 6-digit OTP.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCode }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'OTP verification failed.');
      }

      setStatus('verified');
      setMessage('OTP verified. Enter your new password below.');
      setStep(3);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'OTP verification failed.');
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCode, password: newPassword, confirmPassword }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to reset password.');
      }

      setStatus('success');
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base dark:bg-[#0F172A] flex selection:bg-primary/20 selection:text-primary font-sans transition-colors duration-300">
      
      {/* Left Column: Visual Brand Pane (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        
        {/* Ultra-Premium Mesh Gradient Background */}
        <div className="absolute inset-0 bg-primary-dark dark:bg-[#022c22]">
          <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')]" />
          
          {/* Animated Glow Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.35, 0.55, 0.35],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-light/40 blur-[100px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/35 blur-[120px]"
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

        {/* Feature Highlights Center Content */}
        <div className="relative z-10 my-auto flex flex-col gap-6 max-w-md w-full">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display font-extrabold text-4xl lg:text-5xl text-white leading-tight mb-3"
            >
              Recover access <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary-light">
                quickly & securely
              </span>
            </motion.h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Follow the simple 3-step verification to safely reset your credentials and protect your agricultural marketplace account.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/15 transition-all duration-300 shadow-lg"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary/25 border border-secondary/30 text-white flex items-center justify-center shrink-0 shadow-inner">
                <KeyRound className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-white/70 block uppercase tracking-wider">Email-Based Recovery</span>
                <span className="font-display font-bold text-base text-white">Secure OTP reset flow</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/15 transition-all duration-300 shadow-lg"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary/25 border border-secondary/30 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-white/70 block uppercase tracking-wider">One-Time Password</span>
                <span className="font-display font-bold text-base text-white">Check your inbox for a 6-digit code</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/15 transition-all duration-300 shadow-lg"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary/25 border border-secondary/30 text-white flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-white/70 block uppercase tracking-wider">Account Protection</span>
                <span className="font-display font-bold text-base text-white">256-bit encrypted credential reset</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer info inside pane */}
        <div className="relative z-10 flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>AgriNova • Secure farm data and account recovery</span>
        </div>
      </div>

      {/* Right Column: Authentication Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
        
        {/* Floating Theme Toggle (Top-Right) */}
        <div className="absolute top-6 right-6 z-30">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-slate-700/80 rounded-2xl p-1 shadow-sm hover:shadow transition-all">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile top logo (Visible only on mobile/tablet) */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
            Agri<span className="text-primary">Nova</span>
          </span>
        </div>

        <div className="w-full max-w-md pt-8 lg:pt-0">
          
          {/* Header */}
          <div className="mb-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              Step {step} of 3 • {step === 1 ? 'Email Entry' : step === 2 ? 'OTP Verification' : 'Set New Password'}
            </div>
            <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white mb-2">
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {step === 1 && 'Enter your email address and we will send a 6-digit verification code.'}
              {step === 2 && 'Enter the 6-digit code sent to your email to verify your identity.'}
              {step === 3 && 'Choose a strong new password to regain access to your account.'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 relative transition-colors duration-300">
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 dark:bg-[#1E293B]/95 rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                  <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                    {step === 1 ? 'Sending Secure OTP' : step === 2 ? 'Verifying Code' : 'Updating Password'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Communicating with AgriNova secure authentication servers...</p>
                </motion.div>
              )}

              {status === 'success' && step === 3 && (
                <motion.div
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white dark:bg-[#1E293B] rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-primary mb-4" />
                  <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Password Reset Successful</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your password has been changed. Redirecting to login...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Alert */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-red-800 dark:text-red-300 text-xs font-semibold"
              >
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Success / Status Message */}
            {message && status !== 'loading' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}

            <form onSubmit={resetPassword} className="space-y-5">
              
              {/* Step 1: Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    required
                    disabled={step > 1}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all ${
                      step > 1 ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-slate-800' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Step 2: 6-Digit OTP */}
              {step >= 2 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={sendOtp}
                        className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 6 }, (_, index) => (
                      <input
                        key={index}
                        ref={(element) => { otpInputsRef.current[index] = element; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        disabled={step > 2}
                        value={otpCode[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          updateOtpDigit(index, value);
                        }}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className={`w-full text-center px-1 sm:px-2 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg font-bold text-gray-900 dark:text-white transition-all ${
                          step > 2 ? 'opacity-70 bg-gray-100 dark:bg-slate-800' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: New Password & Confirm Password */}
              {step === 3 && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid gap-3 pt-2">
                {step === 1 && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {step === 2 && (
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Verify OTP</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Reset Password</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      navigate('/login');
                    } else {
                      resetState();
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{step === 1 ? 'Back to Sign In' : 'Restart Recovery'}</span>
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
              Remembered your password?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
