import React, { useState } from 'react';
import {
  X,
  User,
  Globe,
  Receipt,
  ShieldCheck,
  LogOut,
  LogIn,
  Save,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { UserProfile, Language, SavedBillEstimate } from '../types';
import { SUPPORTED_LANGUAGES, t, CITY_NAMES } from '../i18n/translations';

interface UserPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  lang: Language;
  onSelectLanguage?: (newLang: Language) => void;
  onLanguageChange?: (newLang: Language) => void;
  onTriggerLoginGate?: () => void;
  onLogout?: () => void;
  onOpenTermsModal?: () => void;
  onOpenTerms?: () => void;
  onOpenPurityGuide?: () => void;
  cities?: any[];
}

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_default',
  name: '',
  phone: '',
  email: '',
  city: 'delhi',
  role: 'buyer',
  shopName: '',
  gstNumber: '',
  preferredLanguage: 'hi',
  isLoggedIn: false,
  savedEstimates: [],
  termsAcceptedAt: undefined,
};

export const UserPanelModal: React.FC<UserPanelModalProps> = ({
  isOpen,
  onClose,
  userProfile = DEFAULT_USER_PROFILE,
  onUpdateProfile,
  lang,
  onSelectLanguage,
  onLanguageChange,
  onTriggerLoginGate,
  onLogout,
  onOpenTermsModal,
  onOpenTerms,
  onOpenPurityGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'language' | 'saved' | 'terms'>('profile');

  // Edit form state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(userProfile?.name || '');
  const [phone, setPhone] = useState<string>(userProfile?.phone || '');
  const [email, setEmail] = useState<string>(userProfile?.email || '');
  const [city, setCity] = useState<string>(userProfile?.city || 'delhi');
  const [role, setRole] = useState<'buyer' | 'jeweller' | 'investor'>(userProfile?.role || 'buyer');
  const [shopName, setShopName] = useState<string>(userProfile?.shopName || '');
  const [gstNumber, setGstNumber] = useState<string>(userProfile?.gstNumber || '');

  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copiedEstimateId, setCopiedEstimateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerLanguageSelect = (newLang: Language) => {
    if (typeof onSelectLanguage === 'function') {
      onSelectLanguage(newLang);
    } else if (typeof onLanguageChange === 'function') {
      onLanguageChange(newLang);
    }
  };

  const triggerTermsModal = () => {
    if (typeof onOpenTermsModal === 'function') {
      onOpenTermsModal();
    } else if (typeof onOpenTerms === 'function') {
      onOpenTerms();
    }
  };

  const triggerLoginGate = () => {
    if (typeof onTriggerLoginGate === 'function') {
      onTriggerLoginGate();
    } else if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim() || 'उपयोगकर्ता (User)',
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      role,
      shopName: role === 'jeweller' ? shopName.trim() : undefined,
      gstNumber: role === 'jeweller' ? gstNumber.trim() : undefined,
      preferredLanguage: lang,
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    setIsEditing(false);
    setSaveSuccessMessage(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक सेव हो गई!' : 'Profile updated successfully!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleLogout = () => {
    const loggedOutProfile: UserProfile = {
      ...userProfile,
      isLoggedIn: false,
      name: '',
      phone: '',
      email: '',
      shopName: '',
      gstNumber: '',
    };
    if (onUpdateProfile) {
      onUpdateProfile(loggedOutProfile);
    }
    onClose();
    triggerLoginGate();
  };

  const handleDeleteEstimate = (id: string) => {
    const updatedEstimates = (userProfile.savedEstimates || []).filter((est) => est.id !== id);
    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        savedEstimates: updatedEstimates,
      });
    }
  };

  const handleCopyEstimate = (est: SavedBillEstimate) => {
    const text = `📋 ${est.title}\n📍 ${est.cityName}\n💎 ${est.metal.toUpperCase()} ${est.purity.toUpperCase()} (${est.weightGrams}g)\n💰 कुल मूल्य: ₹${est.totalPrice.toLocaleString('en-IN')}\n📅 ${est.createdAt}`;
    navigator.clipboard.writeText(text);
    setCopiedEstimateId(est.id);
    setTimeout(() => setCopiedEstimateId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900/95 border border-amber-400/30 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-2xl">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/70">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-slate-950 font-black text-lg">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              {userProfile.isLoggedIn && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Active"></span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">
                  {userProfile.isLoggedIn ? (userProfile.name || 'मेरी प्रोफ़ाइल') : (lang === 'hi' ? 'यूज़र पैनल एवं प्रोफ़ाइल' : 'User Panel & Profile')}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  userProfile.isLoggedIn
                    ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                }`}>
                  {userProfile.isLoggedIn ? (lang === 'hi' ? 'सक्रिय सत्र' : 'Logged In') : (lang === 'hi' ? 'अतिथि (Guest)' : 'Guest Mode')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {userProfile.phone ? `📱 +91 ${userProfile.phone}` : (lang === 'hi' ? 'भाषा बदलें, प्रोफ़ाइल प्रबंधित करें व बिल सहेजें' : 'Manage profile, change language & saved quotes')}
              </p>
            </div>
          </div>

          <button
            id="close-user-panel-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-4 pt-2 gap-1 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            id="user-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-300 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</span>
          </button>

          <button
            id="user-tab-language"
            onClick={() => setActiveTab('language')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'language'
                ? 'border-amber-400 text-amber-300 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'hi' ? 'भाषा बदलें (Language)' : 'Change Language'}</span>
          </button>

          <button
            id="user-tab-saved"
            onClick={() => setActiveTab('saved')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'saved'
                ? 'border-amber-400 text-amber-300 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{lang === 'hi' ? 'सेव किए गए बिल' : 'Saved Bills'}</span>
            {(userProfile.savedEstimates?.length || 0) > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {userProfile.savedEstimates.length}
              </span>
            )}
          </button>

          <button
            id="user-tab-terms"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition shrink-0 ${
              activeTab === 'terms'
                ? 'border-amber-400 text-amber-300 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'hi' ? 'नियम व शर्तें' : 'Terms & Legal'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-200 custom-scrollbar flex-1">
          
          {saveSuccessMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: USER PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Profile Card View */}
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">{lang === 'hi' ? 'नाम:' : 'Name:'}</span>
                        <strong className="text-white text-base">
                          {userProfile.name || (lang === 'hi' ? 'अतिथि उपयोगकर्ता' : 'Guest User')}
                        </strong>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold capitalize">
                        {userProfile.role === 'jeweller' ? '👑 सर्राफा व्यापारी (Jeweller)' : userProfile.role === 'investor' ? '📈 बुलियन निवेशक' : '🛍️ ग्राहक (Buyer)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-white/5">
                      <div>
                        <span className="text-slate-400 block">{lang === 'hi' ? 'मोबाइल नंबर:' : 'Phone:'}</span>
                        <span className="font-semibold text-slate-200">
                          {userProfile.phone ? `+91 ${userProfile.phone}` : (lang === 'hi' ? 'दर्ज नहीं किया' : 'Not added')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{lang === 'hi' ? 'ईमेल:' : 'Email:'}</span>
                        <span className="font-semibold text-slate-200">
                          {userProfile.email || (lang === 'hi' ? 'दर्ज नहीं किया' : 'Not added')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{lang === 'hi' ? 'पसंदीदा शहर:' : 'Preferred City:'}</span>
                        <span className="font-semibold text-slate-200 capitalize">
                          {CITY_NAMES[userProfile.city]?.[lang] || userProfile.city || 'Delhi NCR'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{lang === 'hi' ? 'पसंदीदा भाषा:' : 'Language:'}</span>
                        <span className="font-semibold text-amber-300">
                          {SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.name || 'हिंदी'}
                        </span>
                      </div>

                      {userProfile.role === 'jeweller' && (
                        <>
                          <div className="col-span-2 pt-2 border-t border-white/5">
                            <span className="text-slate-400 block">{lang === 'hi' ? 'दुकान / फर्म का नाम:' : 'Jewellery Firm:'}</span>
                            <span className="font-bold text-amber-300 text-sm">
                              {userProfile.shopName || (lang === 'hi' ? 'ज्वेलर्स शॉप' : 'Jewellers Shop')}
                            </span>
                          </div>
                          {userProfile.gstNumber && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block">GSTIN:</span>
                              <span className="font-mono text-slate-200">{userProfile.gstNumber}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Profile Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      id="edit-profile-btn"
                      onClick={() => {
                        setName(userProfile.name || '');
                        setPhone(userProfile.phone || '');
                        setEmail(userProfile.email || '');
                        setCity(userProfile.city || 'delhi');
                        setRole(userProfile.role || 'buyer');
                        setShopName(userProfile.shopName || '');
                        setGstNumber(userProfile.gstNumber || '');
                        setIsEditing(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      <span>✏️ {lang === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}</span>
                    </button>

                    {userProfile.isLoggedIn ? (
                      <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center space-x-1.5 transition ml-auto"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'लॉगआउट / खाता बदलें' : 'Log Out / Switch Account'}</span>
                      </button>
                    ) : (
                      <button
                        id="login-from-panel-btn"
                        onClick={() => {
                          onClose();
                          onTriggerLoginGate();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition ml-auto shadow-md"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'लॉगिन करें (Sign In)' : 'Sign In Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Edit Profile Form */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        {lang === 'hi' ? 'आपका पूरा नाम:' : 'Full Name:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. राहुल वर्मा / मुस्कान"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        {lang === 'hi' ? 'मोबाइल नंबर:' : 'Mobile Number:'}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        {lang === 'hi' ? 'ईमेल (Email):' : 'Email:'}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmail(val);
                          if (!name && val.includes('@')) {
                            const prefix = val.split('@')[0].replace(/[0-9]+/g, ' ').replace(/[._-]+/g, ' ').trim();
                            if (prefix) {
                              const extracted = prefix.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                              setName(extracted);
                            }
                          }
                        }}
                        placeholder="user@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        {lang === 'hi' ? 'आपका शहर:' : 'Your City:'}
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      >
                        <option value="delhi">दिल्ली एनसीआर (Delhi NCR)</option>
                        <option value="mumbai">मुंबई (Mumbai Zaveri)</option>
                        <option value="jaipur">जयपुर (Jaipur)</option>
                        <option value="ahmedabad">अहमदाबाद (Ahmedabad)</option>
                        <option value="surat">सूरत (Surat)</option>
                        <option value="kolkata">कोलकाता (Kolkata)</option>
                        <option value="chennai">चेन्नई (Chennai)</option>
                        <option value="bengaluru">बेंगलुरु (Bengaluru)</option>
                        <option value="lucknow">लखनऊ (Lucknow)</option>
                        <option value="hyderabad">हैदराबाद (Hyderabad)</option>
                        <option value="pune">पुणे (Pune)</option>
                        <option value="patna">पटना (Patna)</option>
                      </select>
                    </div>

                    {/* Role Selection */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        {lang === 'hi' ? 'आपकी श्रेणी / प्रकार:' : 'Your Role:'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'buyer', label: lang === 'hi' ? '🛍️ ग्राहक' : 'Buyer' },
                          { id: 'jeweller', label: lang === 'hi' ? '👑 ज्वेलर / सर्राफा' : 'Jeweller' },
                          { id: 'investor', label: lang === 'hi' ? '📈 निवेशक' : 'Investor' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id as any)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                              role === r.id
                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                                : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Jeweller specific fields */}
                    {role === 'jeweller' && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            {lang === 'hi' ? 'ज्वेलरी शोरूम / दुकान का नाम:' : 'Shop / Business Name:'}
                          </label>
                          <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="e.g. श्री लक्ष्मी ज्वैलर्स"
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            GSTIN (वैकल्पिक):
                          </label>
                          <input
                            type="text"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value)}
                            placeholder="07AAAAA0000A1Z5"
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
                    >
                      {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-400/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'प्रोफ़ाइल सेव करें' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Quick links & Guides */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenPurityGuide) onOpenPurityGuide();
                  }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center space-x-2 text-slate-200">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'hi' ? 'BIS हॉलमार्किंग व शुद्धता गाइड' : 'BIS Hallmarking Guide'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    triggerTermsModal();
                  }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center space-x-2 text-slate-200">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>{lang === 'hi' ? 'कोर्ट अस्वीकरण व कानूनी नियम' : 'Legal Court Disclaimer'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE LANGUAGE */}
          {activeTab === 'language' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-white text-sm">
                    {lang === 'hi' ? 'अपनी पसंदीदा भाषा चुनें (8 भारतीय भाषाएं)' : 'Select Your Preferred Language (8 Indian Languages)'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'hi' ? 'पूरा ऐप, भाव, कैलकुलेटर व इनवॉइस तुरंत आपकी भाषा में बदल जाएगा' : 'Instant live translation of entire app, live rates & billing'}
                  </p>
                </div>
                <span className="text-xs bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full font-bold">
                  8 Regional
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    id={`user-panel-lang-${item.code}`}
                    onClick={() => {
                      triggerLanguageSelect(item.code);
                      const updated: UserProfile = {
                        ...userProfile,
                        preferredLanguage: item.code,
                      };
                      if (onUpdateProfile) {
                        onUpdateProfile(updated);
                      }
                      setSaveSuccessMessage(
                        item.code === 'hi'
                          ? 'भाषा बदलकर हिंदी कर दी गई है!'
                          : `Language switched to ${item.englishName}!`
                      );
                      setTimeout(() => setSaveSuccessMessage(null), 2500);
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition backdrop-blur-md ${
                      lang === item.code
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <div className="font-extrabold text-sm flex items-center space-x-2">
                          <span>{item.name}</span>
                          <span className={`text-[11px] font-normal ${lang === item.code ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                            ({item.englishName})
                          </span>
                        </div>
                        <div className={`text-[10px] mt-0.5 ${lang === item.code ? 'text-slate-800' : 'text-slate-500'}`}>
                          {item.region}
                        </div>
                      </div>
                    </div>

                    {lang === item.code ? (
                      <div className="p-1 rounded-full bg-slate-950 text-amber-400">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">{item.shortCode}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED QUOTATIONS / BILLS */}
          {activeTab === 'saved' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-white text-sm">
                    {lang === 'hi' ? 'सेव किए गए बिल व कोटेशन पर्चे' : 'Saved Quotations & Invoices'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'hi' ? 'कैलकुलेटर से सेव किए गए गहनों के अनुमान' : 'Calculations and quotes saved on this device'}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {userProfile.savedEstimates?.length || 0} {lang === 'hi' ? 'सेव्ड' : 'Saved'}
                </span>
              </div>

              {(!userProfile.savedEstimates || userProfile.savedEstimates.length === 0) ? (
                <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/20">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-white text-sm">
                    {lang === 'hi' ? 'अभी कोई सेव किया गया बिल नहीं है' : 'No Saved Estimates Yet'}
                  </h5>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {lang === 'hi'
                      ? 'ज्वेलरी कैलकुलेटर में जाकर "सेव करें" बटन दबाएं ताकि आप बाद में यहां अपना कोटेशन देख सकें।'
                      : 'Create a jewellery calculation and click "Save Quote" to store estimates in your profile.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userProfile.savedEstimates.map((est) => (
                    <div
                      key={est.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-white text-sm block">{est.title}</strong>
                          <span className="text-[10px] text-slate-400">
                            {est.cityName} • {est.createdAt}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-amber-300 block">
                            ₹{est.totalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded font-bold">
                            3% GST सहित
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-black/30 p-2 rounded-xl text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">धातु / शुद्धता:</span>
                          <span className="font-bold text-white capitalize">{est.metal} {est.purity.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">वजन (Net):</span>
                          <span className="font-bold text-white">{est.weightGrams}g</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">मेकिंग चार्ज:</span>
                          <span className="font-bold text-amber-300">{est.makingCharges}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => handleCopyEstimate(est)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          {copiedEstimateId === est.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-400" />
                              <span>Copy Quote</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteEstimate(est.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TERMS & CONDITIONS & DISCLAIMER */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Acceptance Status Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {lang === 'hi'
                      ? 'नियम व शर्तें स्वीकृत (Terms Accepted)'
                      : 'Terms & Legal Disclaimer Verified'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  {userProfile.termsAcceptedAt || 'Active'}
                </span>
              </div>

              {/* Court Disclaimer reminder */}
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    {lang === 'hi'
                      ? 'कानूनी सूचना: किसी भी कोर्ट केस या विवाद में अमान्य'
                      : 'Court Non-Admissibility Notice'}
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {lang === 'hi'
                    ? 'इस ऐप में प्रदर्शित सभी दरें, चार्ट व बिल पर्चियां केवल सामान्य जानकारी के लिए हैं। यह किसी भी न्यायालय, उपभोक्ता फोरम या पुलिस विवाद में आधिकारिक साक्ष्य के रूप में मान्य नहीं हैं।'
                    : 'All bullion rates, analytics, and billing estimates in this app are strictly for reference only and cannot be used as legal proof in any court or dispute.'}
                </p>
              </div>

              {/* View detailed legal modal button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenTermsModal();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'hi' ? 'विस्तृत नियम, शर्तें व गोपनीयता नीति पढ़ें' : 'Read Full Privacy Policy & Terms of Use'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>{lang === 'hi' ? 'सोना चांदी लाइव v2.6' : 'Sona Chandi Live v2.6'}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
