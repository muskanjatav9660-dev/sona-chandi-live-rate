import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Flame, Radio } from 'lucide-react';
import { BullionRates } from '../types';
import { Language, t } from '../i18n/translations';

interface TickerBarProps {
  rates: BullionRates;
  lang: Language;
}

function formatISTLiveTime(date: Date, lang: Language): string {
  try {
    const localeMap: Record<Language, string> = {
      hi: 'hi-IN',
      en: 'en-IN',
      gu: 'gu-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      kn: 'kn-IN',
    };
    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    const dateStr = date.toLocaleDateString(localeMap[lang] || 'hi-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Asia/Kolkata',
    });
    return `${dateStr}, ${timeStr} IST`;
  } catch {
    return date.toLocaleTimeString();
  }
}

export const TickerBar: React.FC<TickerBarProps> = ({ rates, lang }) => {
  const [liveTime, setLiveTime] = useState<string>(() => formatISTLiveTime(new Date(), lang));

  useEffect(() => {
    // Ticking live clock every second
    const timer = setInterval(() => {
      setLiveTime(formatISTLiveTime(new Date(), lang));
    }, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  const g24k = rates.gold.k24;
  const g22k = rates.gold.k22;
  const s999 = rates.silver.fine999;
  const mcxGold = rates.mcx.gold;
  const mcxSilver = rates.mcx.silver;

  return (
    <div className="bg-slate-950/40 backdrop-blur-xl border-b border-white/10 text-slate-300 py-2.5 px-4 overflow-hidden relative shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        {/* Left Side Status */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-2 text-amber-300 font-semibold bg-amber-400/15 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="font-bold">{t('todayLiveMarket', lang)}</span>
          </div>

          <div className="flex items-center text-slate-300 space-x-1.5 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10" title="भारतीय मानक समय (Indian Standard Time)">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-300">{t('liveTime', lang)}</span>
            <span className="text-[11px] font-semibold text-white tracking-wide">{liveTime}</span>
          </div>
        </div>

        {/* Live Ticker Items (Frosted glass pills) */}
        <div className="flex items-center overflow-x-auto no-scrollbar space-x-3 py-1 w-full md:w-auto justify-start md:justify-end text-xs sm:text-[13px]">
          {/* MCX Gold */}
          <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shrink-0">
            <span className="text-amber-300 font-bold">MCX {t('gold', lang)} 10g:</span>
            <span className="font-extrabold text-white">₹{mcxGold.ltp.toLocaleString('en-IN')}</span>
            <span className="flex items-center text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +{mcxGold.changePercent}%
            </span>
          </div>

          {/* MCX Silver */}
          <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shrink-0">
            <span className="text-slate-300 font-bold">MCX {t('silver', lang)} 1kg:</span>
            <span className="font-extrabold text-white">₹{mcxSilver.ltp.toLocaleString('en-IN')}</span>
            <span className="flex items-center text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              +{mcxSilver.changePercent}%
            </span>
          </div>

          {/* IBJA 24K */}
          <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shrink-0">
            <span className="text-amber-400 font-bold">24K {t('gold', lang)}:</span>
            <span className="font-extrabold text-amber-200">₹{g24k.pricePer10Gram?.toLocaleString('en-IN')}</span>
          </div>

          {/* IBJA 22K */}
          <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shrink-0">
            <span className="text-yellow-400 font-bold">22K {t('gold', lang)}:</span>
            <span className="font-extrabold text-yellow-200">₹{Math.round(g22k.pricePer10Gram || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Global Spot USD */}
          <div className="flex items-center space-x-1.5 text-slate-400 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shrink-0 hidden lg:flex">
            <span>Spot: ${rates.gold.spotUsdPerOz}/oz | ₹{rates.usdInrRate}/$</span>
          </div>
        </div>
      </div>
    </div>
  );
};

