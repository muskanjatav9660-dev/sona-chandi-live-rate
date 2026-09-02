import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Check,
  Globe,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { SUPPORTED_LANGUAGES, CITY_NAMES } from '../i18n/translations';
import { auth, GoogleAuthProvider, signInWithPopup } from '../firebase';

// Helper to extract clean human name from email address
export function extractNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) return '';
  const prefix = email.split('@')[0];
  const clean = prefix.replace(/[0-9]+/g, ' ').replace(/[._-]+/g, ' ').trim();
  if (!clean) return prefix;
  return clean
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface LoginTermsGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAcceptAndLogin?: (profile: UserProfile) => void;
  onAcceptAndEnter?: (profile: UserProfile) => void;
  lang: Language;
  onSelectLanguage?: (lang: Language) => void;
  onLanguageChange?: (lang: Language) => void;
  currentProfile?: UserProfile;
  userProfile?: UserProfile;
  onOpenTerms?: () => void;
}

export const LoginTermsGateModal: React.FC<LoginTermsGateModalProps> = ({
  isOpen,
  onClose,
  onAcceptAndLogin,
  onAcceptAndEnter,
  lang,
  onSelectLanguage,
  onLanguageChange,
  currentProfile,
  userProfile: altProfile,
  onOpenTerms,
}) => {
  const profileToUse = currentProfile || altProfile;
  
  // Login mode: Email / OTP or Details form
  const [loginMethod, setLoginMethod] = useState<'email_otp' | 'direct'>('email_otp');
  const [email, setEmail] = useState<string>(profileToUse?.email || '');
  const [otp, setOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [name, setName] = useState<string>(profileToUse?.name || '');
  const [phone, setPhone] = useState<string>(profileToUse?.phone || '');
  const [city, setCity] = useState<string>(profileToUse?.city || 'delhi');
  const [role, setRole] = useState<'buyer' | 'jeweller' | 'investor'>(profileToUse?.role || 'buyer');
  const [shopName, setShopName] = useState<string>(profileToUse?.shopName || '');
  const [gstNumber, setGstNumber] = useState<string>(profileToUse?.gstNumber || '');
  const [agreed, setAgreed] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleCallback = (profile: UserProfile) => {
    if (typeof onAcceptAndLogin === 'function') {
      onAcceptAndLogin(profile);
    } else if (typeof onAcceptAndEnter === 'function') {
      onAcceptAndEnter(profile);
    }
  };

  const handleLangSelect = (selectedLang: Language) => {
    if (typeof onSelectLanguage === 'function') {
      onSelectLanguage(selectedLang);
    } else if (typeof onLanguageChange === 'function') {
      onLanguageChange(selectedLang);
    }
  };

  // Auto extract name when user types email
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (!name || name === 'सोना ग्राहक' || name === 'Gold Customer') {
      const derived = extractNameFromEmail(newEmail);
      if (derived) {
        setName(derived);
      }
    }
  };

  // Google Sign In handler with Firebase
  const handleGoogleLogin = async () => {
    setIsVerifying(true);
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const gName = user.displayName || extractNameFromEmail(user.email || '') || (lang === 'hi' ? 'सोना ग्राहक' : 'Gold Customer');
        const gEmail = user.email || email;
        const newProfile: UserProfile = {
          id: user.uid || profileToUse?.id || `google_${Date.now()}`,
          name: gName,
          email: gEmail ? gEmail.toLowerCase() : undefined,
          phone: user.phoneNumber || phone.trim(),
          city: city.trim() || 'delhi',
          role,
          shopName: role === 'jeweller' ? shopName.trim() : undefined,
          gstNumber: role === 'jeweller' ? gstNumber.trim() : undefined,
          preferredLanguage: lang,
          termsAcceptedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          isLoggedIn: true,
          savedEstimates: profileToUse?.savedEstimates || [],
        };
        setIsVerifying(false);
        handleCallback(newProfile);
        return;
      }
    } catch (err: any) {
      console.warn('Google sign in popup notice:', err);
    }
    // Fallback if popup blocked in preview iframe
    const fallbackProfile: UserProfile = {
      id: `google_user_${Date.now()}`,
      name: name || (email ? extractNameFromEmail(email) : (lang === 'hi' ? 'Google यूजर' : 'Google User')),
      email: email || 'user@gmail.com',
      phone: phone.trim(),
      city: city.trim() || 'delhi',
      role,
      preferredLanguage: lang,
      termsAcceptedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      isLoggedIn: true,
      savedEstimates: profileToUse?.savedEstimates || [],
    };
    setIsVerifying(false);
    handleCallback(fallbackProfile);
  };

  // Send OTP handler
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsOtpSent(true);
      setIsVerifying(false);
      // Auto pre-populate derived name
      if (!name) {
        setName(extractNameFromEmail(email));
      }
    }, 600);
  };

  // Verify OTP and complete login
  const handleVerifyOtpAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      const finalName = name.trim() || extractNameFromEmail(email) || (lang === 'hi' ? 'सोना ग्राहक' : 'Gold Customer');
      const newProfile: UserProfile = {
        id: profileToUse?.id || `firebase_user_${Date.now()}`,
        name: finalName,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        city: city.trim() || 'delhi',
        role,
        shopName: role === 'jeweller' ? shopName.trim() : undefined,
        gstNumber: role === 'jeweller' ? gstNumber.trim() : undefined,
        preferredLanguage: lang,
        termsAcceptedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        isLoggedIn: true,
        savedEstimates: profileToUse?.savedEstimates || [],
      };
      setIsVerifying(false);
      handleCallback(newProfile);
    }, 500);
  };

  // Standard Direct Form Submit
  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (email ? extractNameFromEmail(email) : (lang === 'hi' ? 'सोना ग्राहक' : 'Gold Customer'));
    const newProfile: UserProfile = {
      id: profileToUse?.id || `user_${Date.now()}`,
      name: finalName,
      email: email.trim() ? email.trim().toLowerCase() : undefined,
      phone: phone.trim(),
      city: city.trim(),
      role,
      shopName: role === 'jeweller' ? shopName.trim() : undefined,
      gstNumber: role === 'jeweller' ? gstNumber.trim() : undefined,
      preferredLanguage: lang,
      termsAcceptedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      isLoggedIn: true,
      savedEstimates: profileToUse?.savedEstimates || [],
    };
    handleCallback(newProfile);
  };

  const handleSkipOrClose = () => {
    if (onClose) {
      onClose();
    } else {
      const guestProfile: UserProfile = {
        id: profileToUse?.id || `guest_${Date.now()}`,
        name: profileToUse?.name || (lang === 'hi' ? 'अतिथि' : 'Guest'),
        phone: profileToUse?.phone || '',
        city: city || 'delhi',
        role: role || 'buyer',
        preferredLanguage: lang,
        isLoggedIn: false,
        savedEstimates: profileToUse?.savedEstimates || [],
      };
      handleCallback(guestProfile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-400/30 rounded-3xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden backdrop-blur-2xl text-slate-100 relative z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/40 p-0.5 bg-black/40 shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-300">
                {lang === 'hi' ? 'लॉगिन / प्रोफ़ाइल' : 'Login / Profile'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'hi' ? 'ईमेल या OTP से एक बार लॉगिन करें' : 'Sign in once with Email or OTP'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={lang}
                onChange={(e) => handleLangSelect(e.target.value as Language)}
                className="bg-transparent text-[11px] font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSkipOrClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fast Google Login Button */}
        <div className="p-3.5 pb-2 bg-black/20 border-b border-white/5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isVerifying}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center space-x-2.5 transition shadow-md shadow-white/5 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{lang === 'hi' ? 'Google खाते से 1-क्लिक लॉगिन' : 'Continue with Google Account'}</span>
          </button>
          <div className="flex items-center space-x-2 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {lang === 'hi' ? 'या ईमेल से भरें' : 'OR WITH EMAIL'}
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </div>

        {/* Auth Method Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-black/30 border-b border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setLoginMethod('email_otp')}
            className={`py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
              loginMethod === 'email_otp'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'ईमेल / OTP लॉगिन' : 'Email / OTP'}</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('direct')}
            className={`py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
              loginMethod === 'direct'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'सीधा विवरण भरें' : 'Direct Details'}</span>
          </button>
        </div>

        {/* Tab 1: Email + OTP Flow (Auto Extract details) */}
        {loginMethod === 'email_otp' && (
          <div className="p-4 sm:p-5 space-y-4 text-xs">
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {lang === 'hi' ? 'अपना ईमेल दर्ज करें:' : 'Enter your Email:'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="e.g. muskanjatav9660@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  {email && (
                    <p className="mt-1 text-[11px] text-amber-300/80 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>
                        {lang === 'hi' ? 'पहचान:' : 'Identified as:'}{' '}
                        <strong>{extractNameFromEmail(email) || email}</strong>
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      {lang === 'hi' ? 'शहर (City):' : 'City:'}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="delhi">दिल्ली (Delhi)</option>
                      <option value="mumbai">मुंबई (Mumbai)</option>
                      <option value="jaipur">जयपुर (Jaipur)</option>
                      <option value="ahmedabad">अहमदाबाद</option>
                      <option value="surat">सूरत</option>
                      <option value="kolkata">कोलकाता</option>
                      <option value="chennai">चेन्नई</option>
                      <option value="bengaluru">बेंगलुरु</option>
                      <option value="lucknow">लखनऊ</option>
                      <option value="hyderabad">हैदराबाद</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      {lang === 'hi' ? 'उपयोगकर्ता:' : 'Role:'}
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="buyer">🛍️ ग्राहक (Buyer)</option>
                      <option value="jeweller">👑 ज्वेलर (Jeweller)</option>
                      <option value="investor">📈 निवेशक (Investor)</option>
                    </select>
                  </div>
                </div>

                {/* Read Terms Option */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-amber-400 accent-amber-400 cursor-pointer"
                    />
                    <span>{lang === 'hi' ? 'नियम स्वीकार हैं' : 'I agree'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenTerms) onOpenTerms();
                    }}
                    className="text-amber-400 hover:text-amber-300 underline text-[11px] font-bold"
                  >
                    Read Terms & Privacy Policy
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !agreed || !email}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:brightness-110 transition shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>{lang === 'hi' ? 'OTP भेजा जा रहा है...' : 'Sending OTP...'}</span>
                  ) : (
                    <>
                      <span>{lang === 'hi' ? 'OTP कोड भेजें' : 'Send OTP Code'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP */
              <form onSubmit={handleVerifyOtpAndLogin} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {lang === 'hi'
                      ? `OTP आपके ईमेल (${email}) पर भेजा गया है:`
                      : `OTP sent to your email (${email}):`}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {lang === 'hi' ? '6-अंकों का OTP कोड दर्ज करें:' : 'Enter 6-digit OTP:'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm font-mono tracking-widest font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === 'hi' ? 'डेमो / टेस्ट कोड: कोई भी 4 या 6 अंक (जैसे 123456)' : 'Test code: Any 6 digits (e.g. 123456)'}
                  </p>
                </div>

                {/* Extracted / Confirmed Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {lang === 'hi' ? 'आपका नाम (ईमेल से स्वतः लिया गया):' : 'Your Name (auto-extracted):'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                  >
                    {lang === 'hi' ? 'ईमेल बदलें' : 'Change Email'}
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:brightness-110 transition shadow-md shadow-amber-500/20"
                  >
                    {isVerifying
                      ? (lang === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying...')
                      : (lang === 'hi' ? 'लॉगिन करें और याद रखें' : 'Verify & Remember')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Direct Details Form */}
        {loginMethod === 'direct' && (
          <form onSubmit={handleDirectSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {lang === 'hi' ? 'नाम (Name):' : 'Name:'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. राहुल शर्मा' : 'e.g. Rahul Sharma'}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {lang === 'hi' ? 'ईमेल (वैकल्पिक):' : 'Email (Optional):'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {lang === 'hi' ? 'मोबाइल नंबर:' : 'Mobile:'}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {lang === 'hi' ? 'शहर (City):' : 'City:'}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="delhi">दिल्ली एनसीआर (Delhi)</option>
                  <option value="mumbai">मुंबई (Mumbai)</option>
                  <option value="jaipur">जयपुर (Jaipur)</option>
                  <option value="ahmedabad">अहमदाबाद (Ahmedabad)</option>
                  <option value="surat">सूरत (Surat)</option>
                  <option value="kolkata">कोलकाता (Kolkata)</option>
                  <option value="chennai">चेन्नई (Chennai)</option>
                  <option value="bengaluru">बेंगलुरु (Bengaluru)</option>
                  <option value="lucknow">लखनऊ (Lucknow)</option>
                  <option value="hyderabad">हैदराबाद (Hyderabad)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {lang === 'hi' ? 'उपयोगकर्ता प्रकार:' : 'User Role:'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="buyer">🛍️ ग्राहक (Buyer)</option>
                  <option value="jeweller">👑 ज्वेलर (Jeweller)</option>
                  <option value="investor">📈 निवेशक (Investor)</option>
                </select>
              </div>
            </div>

            {/* Jeweller details if selected */}
            {role === 'jeweller' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-amber-400/10 rounded-xl border border-amber-400/20">
                <div>
                  <label className="text-[11px] font-bold text-amber-200 block mb-1">
                    {lang === 'hi' ? 'दुकान का नाम:' : 'Shop Name:'}
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. अलंकार ज्वेलर्स"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-amber-400/40 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-amber-200 block mb-1">
                    GSTIN:
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-amber-400/40 text-white text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Clean Terms Option */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400 accent-amber-400 cursor-pointer"
                />
                <span>{lang === 'hi' ? 'नियम स्वीकार हैं' : 'I agree to Terms'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (onOpenTerms) onOpenTerms();
                }}
                className="text-amber-400 hover:text-amber-300 underline text-xs font-bold"
              >
                Read Terms & Conditions and Privacy Policy
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleSkipOrClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={!agreed}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs hover:brightness-110 transition shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {lang === 'hi' ? 'सेव करें और आगे बढ़ें' : 'Save & Continue'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
