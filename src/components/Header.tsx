import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCw, Globe, Bell, FileText, Info, ChevronDown, Check, User, ShieldCheck } from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES, t } from '../i18n/translations';
import { UserProfile } from '../types';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenPurityGuide: () => void;
  onOpenAlertModal: () => void;
  onOpenTermsModal?: () => void;
  onOpenReceiptModal?: () => void;
  userProfile: UserProfile;
  onOpenUserPanel: () => void;
  isOnline?: boolean;
  isUsingCache?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  lastUpdated,
  onRefresh,
  isRefreshing,
  onOpenPurityGuide,
  onOpenAlertModal,
  onOpenTermsModal,
  userProfile,
  onOpenUserPanel,
  isOnline = true,
  isUsingCache = false,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur-2xl border-b border-white/10 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-br from-amber-400/40 via-yellow-200/20 to-slate-800 border border-amber-400/50 shadow-lg shadow-amber-500/20 shrink-0">
              <img
                src="/logo.png"
                alt="सोना चांदी लाइव लोगो"
                className="w-full h-full object-cover rounded-[14px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>{t('appTitle', lang)}</span>
                  <span className="text-amber-400 underline underline-offset-4 decoration-2">
                    {t('live', lang)}
                  </span>
                </h1>
                {!isOnline || isUsingCache ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 backdrop-blur-md shadow-sm shadow-rose-500/20 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
                    {lang === 'hi' ? '🔴 ऑफ़लाइन मोड (Offline)' : '🔴 Offline Mode'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    {t('liveMCX', lang)}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-0.5 tracking-wide hidden sm:block">
                {t('appSubtitle', lang)}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Price Alert Button */}
            <button
              id="header-price-alert-btn"
              onClick={onOpenAlertModal}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-slate-200 hover:text-amber-300 transition flex items-center space-x-1.5 text-xs sm:text-sm font-medium shadow-sm"
              title={t('rateAlerts', lang)}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">{t('rateAlerts', lang)}</span>
            </button>

            {/* Purity & HUID Guide Button */}
            <button
              id="header-purity-guide-btn"
              onClick={onOpenPurityGuide}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-slate-200 hover:text-amber-300 transition flex items-center space-x-1.5 text-xs sm:text-sm font-medium shadow-sm"
              title={t('purityGuide', lang)}
            >
              <Info className="w-4 h-4 text-yellow-400" />
              <span className="hidden md:inline">{t('purityGuide', lang)}</span>
            </button>

            {/* Privacy Policy & Disclaimer Button */}
            {onOpenTermsModal && (
              <button
                id="header-terms-btn"
                onClick={onOpenTermsModal}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-slate-200 hover:text-amber-300 transition flex items-center space-x-1.5 text-xs sm:text-sm font-medium shadow-sm hidden lg:flex"
                title={t('policy', lang)}
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="hidden xl:inline">{t('policy', lang)}</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              id="header-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-full bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 backdrop-blur-md transition flex items-center space-x-1.5 text-xs sm:text-sm font-medium shadow-sm ${
                isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              title={t('refresh', lang)}
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('refresh', lang)}</span>
            </button>

            {/* 8-Language Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="language-selector-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-400/20 to-yellow-500/10 hover:from-amber-400/30 hover:to-yellow-500/20 text-amber-300 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-amber-400/40 backdrop-blur-md transition shadow-md font-bold text-xs sm:text-sm"
                title="भाषा चुनें / Select Language"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{currentLangObj.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Menu Popover */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl border border-amber-400/30 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>भाषा चुनें (8 Languages)</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                      Regional
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 mt-1 max-h-72 overflow-y-auto no-scrollbar">
                    {SUPPORTED_LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        id={`lang-option-${item.code}`}
                        onClick={() => {
                          setLang(item.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                          lang === item.code
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                            : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{item.flag}</span>
                          <div>
                            <span className="font-extrabold text-sm">{item.name}</span>
                            <span className={`text-[10px] ml-1.5 ${lang === item.code ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                              ({item.englishName})
                            </span>
                          </div>
                        </div>
                        {lang === item.code && <Check className="w-4 h-4 text-slate-950" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Panel Button */}
            <button
              id="header-user-panel-btn"
              onClick={onOpenUserPanel}
              className="flex items-center space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm hover:brightness-110 transition shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/60"
              title={lang === 'hi' ? 'यूज़र पैनल एवं प्रोफ़ाइल' : 'User Panel & Profile'}
            >
              <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center text-[10px] font-black">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-3 h-3 text-amber-300" />}
              </div>
              <span className="hidden sm:inline font-black truncate max-w-[100px]">
                {userProfile?.name || (lang === 'hi' ? 'यूज़र पैनल' : 'User Panel')}
              </span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

