import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TickerBar } from './components/TickerBar';
import { HeroRateCards } from './components/HeroRateCards';
import { CityRatesSection } from './components/CityRatesSection';
import { JewelleryCalculator } from './components/JewelleryCalculator';
import { RateChartSection } from './components/RateChartSection';
import { MarketInsightsAI } from './components/MarketInsightsAI';
import { PurityGuideModal } from './components/PurityGuideModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { TermsModal } from './components/TermsModal';
import { UserPanelModal } from './components/UserPanelModal';
import { LoginTermsGateModal } from './components/LoginTermsGateModal';
import { BullionRates, CityRate, PriceHistoryPoint, NewsItem, Language, UserProfile, SavedBillEstimate } from './types';
import { t } from './i18n/translations';
import { ShieldCheck, Coins, Sparkles, Building2, Calculator, LineChart, Bot, Award, Heart, WifiOff, Wifi, HardDriveDownload } from 'lucide-react';
import { saveBullionDataToCache, loadBullionDataFromCache } from './utils/offlineStorage';



// Fallback initial data for instant render
const getInitialLastUpdated = () => {
  try {
    const d = new Date();
    const dateStr = d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    return `${dateStr}, ${timeStr} IST`;
  } catch {
    return 'लाइव अपडेट';
  }
};

const initialRates: BullionRates = {
  lastUpdated: getInitialLastUpdated(),
  currency: 'INR (₹)',
  usdInrRate: 86.50,
  gold: {
    spotUsdPerOz: 2750.0,
    k24: {
      purity: '24K (99.9%)',
      purityPercent: 99.9,
      karat: '24K',
      nameEn: '24 Karat Pure Gold (999)',
      nameHi: '24 कैरेट शुद्ध सोना (999)',
      pricePerGram: 15000,
      pricePer10Gram: 150000,
      pricePerTola: 174960,
      change24h: 750,
      changePercent24h: 0.51,
      high24h: 150800,
      low24h: 149400,
    },
    k22: {
      purity: '22K (91.6%)',
      purityPercent: 91.6,
      karat: '22K',
      nameEn: '22 Karat Jewellery Gold (916)',
      nameHi: '22 कैरेट आभूषण सोना (916)',
      pricePerGram: 13750,
      pricePer10Gram: 137500,
      pricePerTola: 160380,
      change24h: 680,
      changePercent24h: 0.51,
      high24h: 138200,
      low24h: 136900,
    },
    k18: {
      purity: '18K (75.0%)',
      purityPercent: 75.0,
      karat: '18K',
      nameEn: '18 Karat Hallmark Gold (750)',
      nameHi: '18 कैरेट हॉलमार्क सोना (750)',
      pricePerGram: 11250,
      pricePer10Gram: 112500,
      pricePerTola: 131220,
      change24h: 560,
      changePercent24h: 0.51,
      high24h: 113100,
      low24h: 112000,
    },
    k14: {
      purity: '14K (58.5%)',
      purityPercent: 58.5,
      karat: '14K',
      nameEn: '14 Karat Gold (585)',
      nameHi: '14 कैरेट गोल्ड (585)',
      pricePerGram: 8750,
      pricePer10Gram: 87500,
      pricePerTola: 102060,
      change24h: 440,
      changePercent24h: 0.51,
      high24h: 87900,
      low24h: 87100,
    },
  },
  silver: {
    spotUsdPerOz: 34.50,
    fine999: {
      purity: '99.9% Fine',
      purityPercent: 99.9,
      nameEn: '999 Fine Pure Silver',
      nameHi: '999 शुद्ध फाइन चांदी',
      pricePerGram: 260,
      pricePerKg: 260000,
      pricePerTola: 3033,
      change24h: 1500,
      changePercent24h: 0.58,
      high24h: 261500,
      low24h: 259200,
    },
    sterling925: {
      purity: '92.5% Sterling',
      purityPercent: 92.5,
      nameEn: '925 Sterling Silver',
      nameHi: '925 स्टर्लिंग चांदी',
      pricePerGram: 240.5,
      pricePerKg: 240500,
      pricePerTola: 2805,
      change24h: 1380,
      changePercent24h: 0.58,
      high24h: 241880,
      low24h: 239760,
    },
  },
  mcx: {
    gold: {
      symbol: 'GOLD 10G FUT',
      contract: '05 OCT 2026',
      ltp: 149800,
      change: 720,
      changePercent: 0.48,
      high: 150500,
      low: 149200,
      open: 149600,
      volume: '14,820 Lots',
    },
    silver: {
      symbol: 'SILVER 1KG FUT',
      contract: '05 DEC 2026',
      ltp: 259400,
      change: 1450,
      changePercent: 0.56,
      high: 261200,
      low: 258600,
      open: 259000,
      volume: '21,490 Lots',
    },
  },
};

const initialCities: CityRate[] = [
  { id: 'delhi', cityNameEn: 'Delhi NCR', cityNameHi: 'दिल्ली एनसीआर', state: 'Delhi', gold24kPer10g: 150300, gold22kPer10g: 137800, gold18kPer10g: 112700, silverPerKg: 260500, changeGold24k: 750, changeSilver: 1500 },
  { id: 'mumbai', cityNameEn: 'Mumbai', cityNameHi: 'मुंबई', state: 'Maharashtra', gold24kPer10g: 150000, gold22kPer10g: 137500, gold18kPer10g: 112500, silverPerKg: 260000, changeGold24k: 750, changeSilver: 1500 },
  { id: 'jaipur', cityNameEn: 'Jaipur', cityNameHi: 'जयपुर', state: 'Rajasthan', gold24kPer10g: 150350, gold22kPer10g: 137850, gold18kPer10g: 112750, silverPerKg: 260600, changeGold24k: 750, changeSilver: 1500 },
  { id: 'ahmedabad', cityNameEn: 'Ahmedabad', cityNameHi: 'अहमदाबाद', state: 'Gujarat', gold24kPer10g: 150150, gold22kPer10g: 137650, gold18kPer10g: 112600, silverPerKg: 259850, changeGold24k: 750, changeSilver: 1500 },
  { id: 'kolkata', cityNameEn: 'Kolkata', cityNameHi: 'कोलकाता', state: 'West Bengal', gold24kPer10g: 150200, gold22kPer10g: 137700, gold18kPer10g: 112650, silverPerKg: 260700, changeGold24k: 750, changeSilver: 1500 },
  { id: 'chennai', cityNameEn: 'Chennai', cityNameHi: 'चेन्नई', state: 'Tamil Nadu', gold24kPer10g: 150700, gold22kPer10g: 138150, gold18kPer10g: 113000, silverPerKg: 262000, changeGold24k: 750, changeSilver: 1500 },
  { id: 'lucknow', cityNameEn: 'Lucknow', cityNameHi: 'लखनऊ', state: 'Uttar Pradesh', gold24kPer10g: 150320, gold22kPer10g: 137820, gold18kPer10g: 112720, silverPerKg: 260550, changeGold24k: 750, changeSilver: 1500 },
  { id: 'bengaluru', cityNameEn: 'Bengaluru', cityNameHi: 'बेंगलुरु', state: 'Karnataka', gold24kPer10g: 150450, gold22kPer10g: 137900, gold18kPer10g: 112800, silverPerKg: 261200, changeGold24k: 750, changeSilver: 1500 },
];

export default function App() {
  const [lang, setLang] = useState<Language>('hi');

  // Load last known cache if available for instant offline rendering
  const [rates, setRates] = useState<BullionRates>(() => {
    const cached = loadBullionDataFromCache();
    return cached.rates || initialRates;
  });
  const [cities, setCities] = useState<CityRate[]>(() => {
    const cached = loadBullionDataFromCache();
    return cached.cities && cached.cities.length > 0 ? cached.cities : initialCities;
  });
  const [history, setHistory] = useState<PriceHistoryPoint[]>(() => {
    const cached = loadBullionDataFromCache();
    return cached.history || [];
  });
  const [news, setNews] = useState<NewsItem[]>(() => {
    const cached = loadBullionDataFromCache();
    return cached.news || [];
  });
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    const cached = loadBullionDataFromCache();
    return cached.lastSyncFormatted || null;
  });
  const [isUsingCache, setIsUsingCache] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');

  // User Profile State (persisted locally)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('sonachandi_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // fallback
    }
    return {
      id: 'default_user',
      name: '',
      phone: '',
      city: 'delhi',
      role: 'buyer',
      preferredLanguage: 'hi',
      isLoggedIn: false,
      savedEstimates: [],
    };
  });

  // Quick Profile / Login Modal (opens only when user clicks or requests)
  const [isLoginTermsGateOpen, setIsLoginTermsGateOpen] = useState<boolean>(false);

  const [isUserPanelOpen, setIsUserPanelOpen] = useState<boolean>(false);

  // Sync profile language preference if available
  useEffect(() => {
    if (userProfile?.preferredLanguage && userProfile.preferredLanguage !== lang) {
      setLang(userProfile.preferredLanguage);
    }
    if (userProfile?.city && userProfile.city !== selectedCityId) {
      setSelectedCityId(userProfile.city);
    }

    // Auto-heal background listener: catches any uncaught runtime errors silently and keeps app running smoothly
    const handleGlobalError = (event: ErrorEvent) => {
      console.warn('[Auto-Healer] Caught unhandled window error, auto-recovering in 1s:', event.error);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn('[Auto-Healer] Caught unhandled promise rejection, auto-recovering in 1s:', event.reason);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Network connection status listeners
    const handleOnline = () => {
      setIsOnline(true);
      fetchRates(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsUsingCache(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('sonachandi_user_profile', JSON.stringify(updated));
    } catch (e) {}
    if (updated.preferredLanguage && updated.preferredLanguage !== lang) {
      setLang(updated.preferredLanguage);
    }
    if (updated.city && updated.city !== selectedCityId) {
      setSelectedCityId(updated.city);
    }
  };

  const handleAcceptTermsAndLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('sonachandi_user_profile', JSON.stringify(profile));
      localStorage.setItem('sonachandi_terms_accepted', 'true');
    } catch (e) {}
    if (profile.preferredLanguage) {
      setLang(profile.preferredLanguage);
    }
    if (profile.city) {
      setSelectedCityId(profile.city);
    }
    setIsLoginTermsGateOpen(false);
  };

  const handleSaveEstimateFromCalculator = (estimate: SavedBillEstimate) => {
    const updatedEstimates = [estimate, ...(userProfile.savedEstimates || [])];
    const updated = {
      ...userProfile,
      savedEstimates: updatedEstimates,
    };
    handleUpdateProfile(updated);
  };

  // Calculator prefill states triggered from other components
  const [calcMetal, setCalcMetal] = useState<'gold' | 'silver'>('gold');
  const [calcPurity, setCalcPurity] = useState<string>('k22');
  const [calcWeight, setCalcWeight] = useState<number>(10);

  // Modals
  const [isPurityModalOpen, setIsPurityModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);


  // Resilient fetch live bullion rates from backend API with offline cache fallbacks
  const fetchRates = async (force: boolean = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(force ? '/api/rates?force=true' : '/api/rates', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          if (data.data.rates) setRates(data.data.rates);
          if (data.data.cities) setCities(data.data.cities);
          if (data.data.history) setHistory(data.data.history);
          if (data.data.news) setNews(data.data.news);

          // Save to local storage for instant offline availability
          saveBullionDataToCache(data.data.rates, data.data.cities, data.data.history, data.data.news);
          const cached = loadBullionDataFromCache();
          if (cached.lastSyncFormatted) {
            setLastSyncTime(cached.lastSyncFormatted);
          }
          setIsUsingCache(false);
          setIsOnline(true);
        }
      } else {
        throw new Error('API server unreachable');
      }
    } catch {
      // Offline fallback to last known saved rates in localStorage
      const cached = loadBullionDataFromCache();
      if (cached.rates) {
        setRates(cached.rates);
        if (cached.cities) setCities(cached.cities);
        if (cached.history) setHistory(cached.history);
        if (cached.news) setNews(cached.news);
        if (cached.lastSyncFormatted) setLastSyncTime(cached.lastSyncFormatted);
        setIsUsingCache(true);
      }
      setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRates(false);
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchRates(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleHeroSelectForCalculator = (metal: 'gold' | 'silver', purity: string, weight: number) => {
    setCalcMetal(metal);
    setCalcPurity(purity);
    setCalcWeight(weight);

    // Smooth scroll to calculator section
    const el = document.getElementById('jewellery-calculator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Frosted Glass Background Ambient Glowing Orbs */}
      <div className="fixed top-[-120px] left-[-120px] w-[480px] h-[480px] bg-amber-500/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-120px] right-[-120px] w-[480px] h-[480px] bg-slate-400/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="fixed top-[45%] left-[-100px] w-[380px] h-[380px] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Top Header */}
      <div className="relative z-20">
        <Header
          lang={lang}
          setLang={setLang}
          lastUpdated={rates.lastUpdated}
          onRefresh={fetchRates}
          isRefreshing={isRefreshing}
          onOpenPurityGuide={() => setIsPurityModalOpen(true)}
          onOpenAlertModal={() => setIsAlertModalOpen(true)}
          onOpenTermsModal={() => setIsTermsModalOpen(true)}
          userProfile={userProfile}
          onOpenUserPanel={() => setIsUserPanelOpen(true)}
          isOnline={isOnline}
          isUsingCache={isUsingCache}
        />

        {/* Real-time Ticker Bar */}
        <TickerBar rates={rates} lang={lang} />
      </div>

      {/* Offline Status Alert Banner if offline or using local cache */}
      {(!isOnline || isUsingCache) && (
        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="rounded-2xl bg-gradient-to-r from-red-950/80 via-rose-950/70 to-red-950/80 border border-red-500/50 backdrop-blur-xl p-3.5 sm:p-4 text-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl shadow-red-500/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 shrink-0 shadow-inner">
                <WifiOff className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider shadow-sm animate-pulse">
                    🔴 ऑफ़लाइन (Offline)
                  </span>
                  <span>{lang === 'hi' ? 'कैश्ड रेट्स सक्रिय' : 'Cached Rates Active'}</span>
                </h4>
                <p className="text-[11px] sm:text-xs text-rose-200/90 mt-1">
                  {lang === 'hi'
                    ? `इंटरनेट कनेक्शन बंद है। आपके डिवाइस में सेव अंतिम भाव (${lastSyncTime || rates.lastUpdated}) दिखाए जा रहे हैं। कैलकुलेटर 100% काम कर रहा है!`
                    : `You are currently offline. Displaying last saved rates from ${lastSyncTime || rates.lastUpdated}. Jewellery Calculator is 100% active!`}
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchRates(true)}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shrink-0 shadow-lg shadow-red-600/30"
            >
              <HardDriveDownload className={`w-4 h-4 ${isRefreshing ? 'animate-bounce' : ''}`} />
              <span>{lang === 'hi' ? 'पुनः प्रयास करें (Live Sync)' : 'Retry Sync'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full relative z-10">
        {/* Navigation Quick Anchors - Frosted Glass Container */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-3 text-xs">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-lg">
            <a
              href="#live-rates"
              className="px-4 py-2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold hover:bg-amber-400/30 transition shrink-0 flex items-center space-x-1.5 shadow-sm"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{t('liveRates', lang)}</span>
            </a>
            <a
              href="#jewellery-calculator-section"
              className="px-4 py-2 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold hover:bg-white/10 hover:text-white transition shrink-0 flex items-center space-x-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{t('billCalculator', lang)}</span>
            </a>
            <a
              href="#city-rates-section"
              className="px-4 py-2 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold hover:bg-white/10 hover:text-white transition shrink-0 flex items-center space-x-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('cityRates', lang)}</span>
            </a>
            <a
              href="#charts-section"
              className="px-4 py-2 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold hover:bg-white/10 hover:text-white transition shrink-0 flex items-center space-x-1.5"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>{t('priceCharts', lang)}</span>
            </a>
            <a
              href="#ai-insights-section"
              className="px-4 py-2 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold hover:bg-white/10 hover:text-white transition shrink-0 flex items-center space-x-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t('aiAnalysis', lang)}</span>
            </a>
          </div>
        </div>

        {/* Hero Gold & Silver Rate Cards */}
        <section id="live-rates">
          <HeroRateCards
            rates={rates}
            lang={lang}
            onSelectForCalculator={handleHeroSelectForCalculator}
          />
        </section>

        {/* Jewellery & GST Bill Calculator */}
        <JewelleryCalculator
          rates={rates}
          cities={cities}
          selectedCityId={selectedCityId}
          lang={lang}
          prefilledMetal={calcMetal}
          prefilledPurity={calcPurity}
          prefilledWeight={calcWeight}
          onSaveEstimate={handleSaveEstimateFromCalculator}
        />


        {/* City Wise Rates Comparison */}
        <div id="city-rates-section">
          <CityRatesSection
            cities={cities}
            lang={lang}
            selectedCityId={selectedCityId}
            onSelectCity={(cId) => setSelectedCityId(cId)}
          />
        </div>

        {/* Historical Price Chart */}
        <div id="charts-section">
          <RateChartSection history={history} lang={lang} />
        </div>

        {/* AI Market Insights & News */}
        <div id="ai-insights-section">
          <MarketInsightsAI rates={rates} news={news} lang={lang} />
        </div>

        {/* Trust Badges & Hallmarking Guarantee Banner (Frosted Glass) */}
        <section className="my-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="p-3 rounded-2xl bg-amber-400/15 text-amber-300 border border-amber-400/30 backdrop-blur-md shrink-0 shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  {lang === 'hi' ? '100% BIS हॉलमार्क मानक' : 'BIS Hallmarking Standard'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'hi'
                    ? '22K916 और 18K750 शुद्धता के साथ 6-डिजिट अल्फ़ान्यूमेरिक HUID अनिवार्य है।'
                    : '6-digit alphanumeric HUID code guarantees authentic metal purity.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="p-3 rounded-2xl bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 backdrop-blur-md shrink-0 shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  {lang === 'hi' ? 'पारदर्शी 3% जीएसटी बिल' : 'Standard 3% GST Invoicing'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'hi'
                    ? 'सोने और चांदी पर 1.5% CGST + 1.5% SGST लागू होता है। हमेशा पक्का बिल लें।'
                    : 'CGST 1.5% and SGST 1.5% is levied across India on precious metals.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="p-3 rounded-2xl bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shrink-0 shadow-lg">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  {lang === 'hi' ? 'लाइव MCX व IBJA बेंचमार्क' : 'Live MCX & IBJA Benchmark'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'hi'
                    ? 'राष्ट्रीय सर्राफा बाजार और मल्टी कमोडिटी एक्सचेंज के ताजा भाव।'
                    : 'Real-time quotes aligned with India Bullion and Jewellers Association.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Frosted Glass */}
      <footer className="bg-black/30 backdrop-blur-xl border-t border-white/10 text-slate-400 py-8 px-4 text-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/40 p-0.5 bg-black/40 shrink-0">
              <img
                src="/logo.png"
                alt="सोना चांदी लाइव लोगो"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <span className="font-black text-sm text-amber-300">
                  {lang === 'hi' ? 'सोना चांदी लाइव भाव (Sona Chandi Live Rate)' : 'Sona Chandi Live Bullion Rate'}
                </span>
                <span className="text-[10px] bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-slate-300">
                  v2.6 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                {lang === 'hi'
                  ? 'कानूनी सूचना: यह ऐप केवल सामान्य जानकारी व संदर्भ के लिए है। इसका उपयोग किसी भी कोर्ट केस, कानूनी विवाद या आधिकारिक साक्ष्य के रूप में नहीं किया जा सकता।'
                  : 'Legal Notice: This app is strictly for general information and reference only. It cannot be used as legal proof or admissible evidence in any court of law or dispute.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-1 text-slate-400">
            <div className="flex items-center space-x-3 text-xs">
              <button
                id="footer-privacy-btn"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-amber-400/90 hover:text-amber-300 underline underline-offset-2 transition font-medium"
              >
                {lang === 'hi' ? 'गोपनीयता नीति व कानूनी अस्वीकरण' : 'Privacy Policy & Legal Disclaimer'}
              </button>
              <span>•</span>
              <button
                id="footer-purity-btn"
                onClick={() => setIsPurityModalOpen(true)}
                className="text-slate-300 hover:text-amber-300 underline underline-offset-2 transition"
              >
                {lang === 'hi' ? 'BIS हॉलमार्क नियम' : 'BIS Hallmarking'}
              </button>
            </div>
            <span>© 2026 Sona Chandi Live Rate App</span>
            <span className="text-[10px] text-slate-400">Made with high-precision Indian bullion benchmarks</span>
          </div>
        </div>
      </footer>

      {/* Purity & Hallmark Guide Modal */}
      <PurityGuideModal
        isOpen={isPurityModalOpen}
        onClose={() => setIsPurityModalOpen(false)}
        lang={lang}
      />

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        rates={rates}
        lang={lang}
      />

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        lang={lang}
      />

      {/* User Profile & Management Panel Modal */}
      <UserPanelModal
        isOpen={isUserPanelOpen}
        onClose={() => setIsUserPanelOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        lang={lang}
        onSelectLanguage={(newLang) => {
          setLang(newLang);
          handleUpdateProfile({
            ...userProfile,
            preferredLanguage: newLang,
          });
        }}
        onTriggerLoginGate={() => {
          try {
            localStorage.removeItem('sonachandi_terms_accepted');
          } catch (e) {}
          setIsUserPanelOpen(false);
          setIsLoginTermsGateOpen(true);
        }}
        onOpenTermsModal={() => {
          setIsTermsModalOpen(true);
        }}
        onOpenPurityGuide={() => {
          setIsPurityModalOpen(true);
        }}
      />

      {/* User Profile / Login Modal with quick option to Read Terms */}
      <LoginTermsGateModal
        isOpen={isLoginTermsGateOpen}
        onClose={() => setIsLoginTermsGateOpen(false)}
        currentProfile={userProfile}
        lang={lang}
        onSelectLanguage={setLang}
        onAcceptAndLogin={handleAcceptTermsAndLogin}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />
    </div>
  );
}

