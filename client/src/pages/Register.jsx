import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, User, Building2, Mail, Lock, Phone, UserCheck, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    return { message: text };
  }
};

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const tempUser = location.state?.tempUser || null;

  const [step, setStep] = useState(1); // 1 | 2 | 3
  const [role, setRole] = useState(''); // 'farmer' | 'buyer'
  
  // Step 2 Form States
  const [firstName, setFirstName] = useState(tempUser?.firstName || '');
  const [lastName, setLastName] = useState(tempUser?.lastName || '');
  const [email, setEmail] = useState(tempUser?.email || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleId, setGoogleId] = useState(tempUser?.googleId || null);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(!!tempUser);
  const [otpMessage, setOtpMessage] = useState('');
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  
  // Step 3 Specific States
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmLocationData, setFarmLocationData] = useState(null);
  const [farmAcres, setFarmAcres] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('retailer');
  const [city, setCity] = useState('');

  // Status and Error states
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  // Password Strength Logic
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-charcoal/10', width: 'w-0' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password);
    if (password.length >= 8 && hasNumbers && hasSpecial) {
      return { label: 'Strong', color: 'bg-primary', width: 'w-full' };
    }
    return { label: 'Good', color: 'bg-amber-500', width: 'w-2/3' };
  };

  const strength = getPasswordStrength();

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode('');
    setOtpMessage('');
  };

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address before sending OTP.');
      return;
    }

    setSendOtpLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP.');
      }

      setOtpSent(true);
      if (data.otp) {
        setOtpCode(data.otp);
      }
      setOtpMessage(data.message || 'OTP sent successfully. Please check your inbox and enter the code below.');
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Unable to send OTP.');
      setOtpSent(false);
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setStatus('error');
      setErrorMessage('Please enter the 6-digit OTP that was sent to your email.');
      return;
    }

    setVerifyOtpLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode.trim() })
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      setOtpVerified(true);
      setOtpMessage('Email verified successfully. You can continue to the next step.');
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to verify OTP code.');
      setOtpVerified(false);
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  // Navigation Logic
  const handleNextStep = () => {
    if (step === 1) {
      if (!role) {
        setStatus('error');
        setErrorMessage('Please select your platform role to continue.');
        return;
      }
      setStatus('idle');
      setStep(2);
    } else if (step === 2) {
      if (!firstName || !lastName || !email || !phone || (!googleId && (!password || !confirmPassword))) {
        setStatus('error');
        setErrorMessage('All fields are required to create your profile.');
        return;
      }
      if (!email.includes('@')) {
        setStatus('error');
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!otpVerified) {
        setStatus('error');
        setErrorMessage('Please verify your email with OTP before continuing.');
        return;
      }
      if (!googleId) {
        if (password !== confirmPassword) {
          setStatus('error');
          setErrorMessage('Passwords do not match.');
          return;
        }
        if (password.length < 6) {
          setStatus('error');
          setErrorMessage('Password must be at least 6 characters.');
          return;
        }
      }
      setStatus('idle');
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStatus('idle');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final Validation
    if (role === 'farmer') {
      if (!farmName || !farmLocation || !farmAcres || !primaryCrops) {
        setStatus('error');
        setErrorMessage('Please enter your farm name, location, size in acres, and primary crops.');
        return;
      }
    } else {
      if (!companyName || !city) {
        setStatus('error');
        setErrorMessage('Please enter your company name, business type, and city.');
        return;
      }
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const body = {
        firstName,
        lastName,
        email,
        phone,
        password: googleId ? undefined : password,
        role,
        farmName,
        farmLocation,
        farmAcres,
        primaryCrops,
        companyName,
        businessType,
        city,
        googleId
      };

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setStatus('success');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Unable to complete registration.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base grid-pattern flex flex-col justify-between py-12 selection:bg-primary/20 selection:text-primary font-sans relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-md mx-auto w-full px-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Sprout className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight text-charcoal dark:text-gray-100">
            Agri<span className="text-primary">Nova</span>
          </span>
        </Link>
        <span className="text-[10px] font-bold text-charcoal dark:text-gray-100-light/50 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" /> SECURED
        </span>
      </header>

      {/* Main Form Center Box */}
      <main className="max-w-xl mx-auto w-full px-4 sm:px-6 z-10 my-auto">
        
        {/* Progress Tracker */}
        <div className="mb-8 max-w-sm mx-auto flex items-center justify-between text-xs font-bold text-charcoal dark:text-gray-100-light/60">
          <div className="flex flex-col items-center gap-1.5 flex-1 relative">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${step >= 1 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-[#1E293B] border-charcoal/10 dark:border-white/10'}`}>1</div>
            <span>Select Role</span>
            <div className={`absolute top-4 left-[60%] right-[-40%] h-0.5 transition-colors -z-10 ${step >= 2 ? 'bg-primary' : 'bg-charcoal/10'}`} />
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1 relative">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${step >= 2 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-[#1E293B] border-charcoal/10 dark:border-white/10'}`}>2</div>
            <span>Credentials</span>
            <div className={`absolute top-4 left-[60%] right-[-40%] h-0.5 transition-colors -z-10 ${step >= 3 ? 'bg-primary' : 'bg-charcoal/10'}`} />
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${step >= 3 ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-[#1E293B] border-charcoal/10 dark:border-white/10'}`}>3</div>
            <span>Specifics</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          
          {/* Status overlays */}
          <AnimatePresence>
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white dark:bg-[#1E293B]/95 rounded-[32px] z-20 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100">Creating AgriNova Account</h3>
                <p className="text-xs text-charcoal dark:text-gray-100-light/60 mt-1">Configuring soil-mapping twins and telemetry parameters...</p>
              </motion.div>
            )}

            {status === 'success' && step === 3 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-white dark:bg-[#1E293B] rounded-[32px] z-20 flex flex-col items-center justify-center p-6 text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                <h3 className="font-display font-bold text-xl text-charcoal dark:text-gray-100">Account Configured!</h3>
                <p className="text-xs text-charcoal dark:text-gray-100-light/60 mt-1">Your farm logs are secure. Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form validation warning banner */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs font-semibold"
            >
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-bold">Verification alert</p>
                <p className="mt-0.5 text-red-800/80 leading-normal">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Step Panels */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: ROLE SELECTION */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Select your platform role</h2>
                    <p className="text-xs text-charcoal dark:text-gray-100-light/70 mt-1">Choose how you plan to use the AgriNova marketplace ecosystem.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {/* Farmer Role */}
                    <div
                      onClick={() => {
                        setRole('farmer');
                        if (status === 'error') setStatus('idle');
                      }}
                      className={`rounded-2xl p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
                        role === 'farmer'
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                          : 'border-charcoal/10 dark:border-white/10 bg-white dark:bg-[#1E293B] hover:border-primary/40'
                      }`}
                    >
                      <User className={`w-8 h-8 ${role === 'farmer' ? 'text-primary' : 'text-charcoal dark:text-gray-100-light/50'}`} />
                      <div>
                        <h3 className="font-display font-bold text-base text-charcoal dark:text-gray-100 mt-4">Farmer / Grower</h3>
                        <p className="text-[11px] text-charcoal dark:text-gray-100-light/75 leading-relaxed mt-1">Optimize crop yields, monitor soil NPK, and map field analytics.</p>
                      </div>
                    </div>

                    {/* Buyer Role */}
                    <div
                      onClick={() => {
                        setRole('buyer');
                        if (status === 'error') setStatus('idle');
                      }}
                      className={`rounded-2xl p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
                        role === 'buyer'
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                          : 'border-charcoal/10 dark:border-white/10 bg-white dark:bg-[#1E293B] hover:border-primary/40'
                      }`}
                    >
                      <Building2 className={`w-8 h-8 ${role === 'buyer' ? 'text-primary' : 'text-charcoal dark:text-gray-100-light/50'}`} />
                      <div>
                        <h3 className="font-display font-bold text-base text-charcoal dark:text-gray-100 mt-4">Enterprise Buyer</h3>
                        <p className="text-[11px] text-charcoal dark:text-gray-100-light/75 leading-relaxed mt-1">Procure organic crops directly, track logs, and verify certifications.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full mt-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: CREDENTIALS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Account credentials</h2>
                    <p className="text-xs text-charcoal dark:text-gray-100-light/70 mt-1">Please enter your basic identity details.</p>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">First Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                        <input
                          type="text"
                          required
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                        <input
                          type="text"
                          required
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email input and Send OTP row */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Email Address</label>
                    <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                        <input
                          type="email"
                          required
                          placeholder="you@email.com"
                          value={email}
                          readOnly={!!googleId}
                          onChange={(e) => {
                            if (googleId) return;
                            const newEmail = e.target.value;
                            setEmail(newEmail);
                            if (status === 'error') setStatus('idle');
                            if (otpSent || otpVerified) resetOtpState();
                          }}
                          className={`w-full pl-12 pr-4 py-3 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100 ${googleId ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      {!googleId && (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={sendOtpLoading || !email || !email.includes('@')}
                          className="inline-flex min-w-[120px] items-center justify-center rounded-2xl border border-primary bg-primary/10 text-primary px-4 py-3 text-xs font-bold uppercase tracking-wide transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:bg-charcoal/10 disabled:text-charcoal dark:text-gray-100/40"
                        >
                          {sendOtpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {otpMessage && (
                      <p className={`mt-2 text-xs ${otpVerified ? 'text-emerald-700' : 'text-charcoal dark:text-gray-100-light/80'}`}>
                        {otpMessage}
                      </p>
                    )}
                  </div>

                  {otpSent && (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mt-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Enter OTP</label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="••••••"
                            value={otpCode}
                            onChange={(e) => {
                              setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                              if (status === 'error') setStatus('idle');
                              if (otpVerified) setOtpVerified(false);
                            }}
                            className="w-full px-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={verifyOtpLoading || otpVerified || !otpCode || otpCode.length < 6}
                        className="inline-flex items-center justify-center rounded-2xl bg-primary text-white px-4 py-3 text-xs font-bold uppercase tracking-wide transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-charcoal/10 disabled:text-charcoal dark:text-gray-100/40"
                      >
                        {verifyOtpLoading ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
                      </button>
                    </div>
                  )}

                  {/* Phone number row */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (status === 'error') setStatus('idle');
                        }}
                        className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                      />
                    </div>
                  </div>

                  {/* Passwords (Only for normal registration) */}
                  {!googleId && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (status === 'error') setStatus('idle');
                            }}
                            className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal dark:text-gray-100-light/40" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (status === 'error') setStatus('idle');
                            }}
                            className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Strength Indicator */}
                  {!googleId && password && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-charcoal dark:text-gray-100-light/50">Password Strength:</span>
                        <span className={`text-[10px] font-bold uppercase ${
                          strength.label === 'Strong' ? 'text-primary' : strength.label === 'Good' ? 'text-amber-500' : 'text-red-500'
                        }`}>{strength.label}</span>
                      </div>
                      <div className="h-1 w-full bg-charcoal/5 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-3.5 rounded-2xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-[#1E293B] hover:bg-bg-base text-charcoal dark:text-gray-100 text-sm font-bold flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ArrowLeft className="w-4.5 h-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                    >
                      Continue
                      <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SPECIFICS BASED ON ROLE */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Platform details</h2>
                    <p className="text-xs text-charcoal dark:text-gray-100-light/70 mt-1">
                      {role === 'farmer' ? 'Tell us details about your farming fields.' : 'Provide details about your buying volumes.'}
                    </p>
                  </div>

                  {role === 'farmer' ? (
                    <>
                      {/* Farmer Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Farm Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. GreenValley Ranch"
                            value={farmName}
                            onChange={(e) => {
                              setFarmName(e.target.value);
                              if (status === 'error') setStatus('idle');
                            }}
                            className="w-full px-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Farm Location Configuration</label>
                          <LocationPicker
                            onChange={(loc) => {
                              setFarmLocationData(loc);
                              setFarmLocation(`${loc.address} (Lat: ${loc.lat.toFixed(6)}, Lng: ${loc.lng.toFixed(6)})`);
                              if (status === 'error') setStatus('idle');
                            }}
                            value={farmLocationData}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Farm Area (Acres)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 15"
                            value={farmAcres}
                            onChange={(e) => {
                              setFarmAcres(e.target.value);
                              if (status === 'error') setStatus('idle');
                            }}
                            className="w-full px-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Primary Crops</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Wheat, Potato, Soy"
                            value={primaryCrops}
                            onChange={(e) => {
                              setPrimaryCrops(e.target.value);
                              if (status === 'error') setStatus('idle');
                            }}
                            className="w-full px-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Buyer Inputs */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Company / Organization Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Indus Grain Exporters"
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          className="w-full px-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">Business Type</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100 select-none cursor-pointer"
                          >
                            <option value="retailer">Retailer / Supermarket</option>
                            <option value="wholesaler">Wholesale Distributor</option>
                            <option value="exporter">Export Merchant</option>
                            <option value="processing">Food Processing Plant</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider">City</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Indore"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (status === 'error') setStatus('idle');
                            }}
                            className="w-full px-4 py-2.5 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit buttons */}
                  <div className="flex gap-3 pt-6">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-3.5 rounded-2xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-[#1E293B] hover:bg-bg-base text-charcoal dark:text-gray-100 text-sm font-bold flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ArrowLeft className="w-4.5 h-4.5" />
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                    >
                      Create AgriNova Account
                      <UserCheck className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>

        </div>

      </main>

      {/* Footer link to login */}
      <footer className="max-w-md mx-auto w-full text-center px-6 z-10 pt-8">
        <p className="text-xs font-bold text-charcoal dark:text-gray-100-light/70">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark transition-colors">
            Log In
          </Link>
        </p>
      </footer>

    </div>
  );
}

