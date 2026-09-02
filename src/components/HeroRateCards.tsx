import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Scale, Calculator, Coins, CheckCircle2, Percent } from 'lucide-react';
import { BullionRates } from '../types';
import { Language, t } from '../i18n/translations';

interface HeroRateCardsProps {
  rates: BullionRates;
  lang: Language;
  onSelectForCalculator: (metal: 'gold' | 'silver', purity: string, weight: number) => void;
}

type GoldUnit = '1g' | '8g' | '10g' | '100g' | '1tola';
type SilverUnit = '1g' | '10g' | '100g' | '1kg' | '1tola';

export const HeroRateCards: React.FC<HeroRateCardsProps> = ({
  rates,
  lang,
  onSelectForCalculator,
}) => {
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [selectedGoldUnit, setSelectedGoldUnit] = useState<GoldUnit>('10g');
  const [selectedSilverUnit, setSelectedSilverUnit] = useState<SilverUnit>('1kg');
  const [selectedGoldKarat, setSelectedGoldKarat] = useState<'k24' | 'k22' | 'k18' | 'k14'>('k24');

  // Gold calculations
  const currentGoldObj = rates.gold[selectedGoldKarat];
  const goldGramRate = currentGoldObj.pricePerGram;

  const getGoldPriceByUnit = (unit: GoldUnit, gramRate: number, withGst: boolean) => {
    let base = 0;
    switch (unit) {
      case '1g':
        base = gramRate;
        break;
      case '8g':
        base = gramRate * 8;
        break;
      case '10g':
        base = gramRate * 10;
        break;
      case '100g':
        base = gramRate * 100;
        break;
      case '1tola':
        base = gramRate * 11.6638;
        break;
    }
    return withGst ? Math.round(base * 1.03) : Math.round(base);
  };

  const getGoldUnitLabel = (unit: GoldUnit) => {
    if (lang === 'hi') {
      switch (unit) {
        case '1g': return '1 ग्राम';
        case '8g': return '8 ग्राम (पवन)';
        case '10g': return '10 ग्राम';
        case '100g': return '100 ग्राम';
        case '1tola': return '1 तोला (11.66g)';
      }
    } else {
      switch (unit) {
        case '1g': return '1 Gram';
        case '8g': return '8 Grams (Sovereign)';
        case '10g': return '10 Grams';
        case '100g': return '100 Grams';
        case '1tola': return '1 Tola (11.66g)';
      }
    }
  };

  const getGoldWeightGrams = (unit: GoldUnit) => {
    switch (unit) {
      case '1g': return 1;
      case '8g': return 8;
      case '10g': return 10;
      case '100g': return 100;
      case '1tola': return 11.664;
    }
  };

  // Silver calculations
  const silver999GramRate = rates.silver.fine999.pricePerGram;
  const silver925GramRate = rates.silver.sterling925.pricePerGram;

  const getSilverPriceByUnit = (unit: SilverUnit, gramRate: number, withGst: boolean) => {
    let base = 0;
    switch (unit) {
      case '1g':
        base = gramRate;
        break;
      case '10g':
        base = gramRate * 10;
        break;
      case '100g':
        base = gramRate * 100;
        break;
      case '1kg':
        base = gramRate * 1000;
        break;
      case '1tola':
        base = gramRate * 11.6638;
        break;
    }
    return withGst ? Math.round(base * 1.03) : (unit === '1g' ? Math.round(base * 10) / 10 : Math.round(base));
  };

  const getSilverUnitLabel = (unit: SilverUnit) => {
    if (lang === 'hi') {
      switch (unit) {
        case '1g': return '1 ग्राम';
        case '10g': return '10 ग्राम';
        case '100g': return '100 ग्राम';
        case '1kg': return '1 किलोग्राम (1kg)';
        case '1tola': return '1 तोला';
      }
    } else {
      switch (unit) {
        case '1g': return '1 Gram';
        case '10g': return '10 Grams';
        case '100g': return '100 Grams';
        case '1kg': return '1 Kilogram (1kg)';
        case '1tola': return '1 Tola';
      }
    }
  };

  const getSilverWeightGrams = (unit: SilverUnit) => {
    switch (unit) {
      case '1g': return 1;
      case '10g': return 10;
      case '100g': return 100;
      case '1kg': return 1000;
      case '1tola': return 11.664;
    }
  };

  const currentGoldBasePrice = getGoldPriceByUnit(selectedGoldUnit, goldGramRate, false);
  const currentGoldGstPrice = getGoldPriceByUnit(selectedGoldUnit, goldGramRate, true);
  const goldGstAmount = currentGoldGstPrice - currentGoldBasePrice;

  const currentSilverBasePrice = getSilverPriceByUnit(selectedSilverUnit, silver999GramRate, false);
  const currentSilverGstPrice = getSilverPriceByUnit(selectedSilverUnit, silver999GramRate, true);
  const silverGstAmount = Math.round(currentSilverGstPrice - currentSilverBasePrice);

  return (
    <div className="my-6 space-y-4">
      {/* GST & DUTY TAX PREFERENCE CONTROLLER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.06] backdrop-blur-2xl border border-white/15 p-3.5 sm:px-5 sm:py-3 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            {lang === 'hi' ? '6% सीमा शुल्क (Customs Duty) व अधिभार शामिल' : 'Incl. 6% Indian Customs Duty & AIDC'}
          </span>
          <span className="text-slate-400 hidden md:inline">
            {lang === 'hi' ? '• वास्तविक भारतीय सर्राफा मानक' : '• True Indian Bullion Standard'}
          </span>
        </div>

        {/* GST Toggle Switch */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-300 mr-1">
            {lang === 'hi' ? 'भाव का प्रकार:' : 'Rate Mode:'}
          </span>
          <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              id="rate-mode-with-gst-btn"
              onClick={() => setIncludeGst(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center space-x-1.5 ${
                includeGst
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>{lang === 'hi' ? 'शो-रूम बिल भाव (3% GST सहित)' : 'Retail Showroom (Incl. 3% GST)'}</span>
            </button>
            <button
              id="rate-mode-ex-gst-btn"
              onClick={() => setIncludeGst(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center space-x-1.5 ${
                !includeGst
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{lang === 'hi' ? 'हाजिर भाव (Ex-GST)' : 'Spot Bullion (Ex-GST)'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GOLD RATE HERO CARD (FROSTED GLASS) */}
        <div className="relative rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-amber-400/30 p-6 sm:p-7 shadow-2xl shadow-amber-500/10 overflow-hidden hover:border-amber-400/40 transition-all duration-300">
          {/* Ambient Gold Glow inside glass */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          {/* Card Header */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20 text-amber-300">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-amber-200">
                    {lang === 'hi' ? 'सोने का ताजा भाव' : 'Gold Live Rate'}
                  </h2>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    BIS 916 / 999
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'hi'
                    ? 'भारतीय मानक ब्यूरो (BIS) हॉलमार्क व आयात शुल्क प्रमाणित'
                    : 'BIS Hallmarked & Customs Duty Certified Rates'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center text-xs font-bold text-emerald-300 bg-emerald-400/15 backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-full shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                +₹{currentGoldObj.change24h} (+{currentGoldObj.changePercent24h}%)
              </div>
            </div>
          </div>

          {/* Karat Selection Tabs */}
          <div className="mt-5 grid grid-cols-4 gap-2 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            {[
              { key: 'k24', label: '24K (99.9%)', sub: lang === 'hi' ? 'शुद्ध सोना' : 'Pure Gold' },
              { key: 'k22', label: '22K (91.6%)', sub: lang === 'hi' ? 'गहनों हेतु' : 'Jewellery' },
              { key: 'k18', label: '18K (75.0%)', sub: lang === 'hi' ? 'हॉलमार्क' : 'Hallmark' },
              { key: 'k14', label: '14K (58.5%)', sub: lang === 'hi' ? 'मॉडर्न' : 'Modern' },
            ].map((karat) => (
              <button
                key={karat.key}
                id={`karat-btn-${karat.key}`}
                onClick={() => setSelectedGoldKarat(karat.key as any)}
                className={`py-2 px-1 text-center rounded-xl transition flex flex-col items-center justify-center ${
                  selectedGoldKarat === karat.key
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold">{karat.label}</span>
                <span className="text-[10px] opacity-85 hidden sm:inline">{karat.sub}</span>
              </button>
            ))}
          </div>

          {/* Unit Selector Pills */}
          <div className="mt-4 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">
              {lang === 'hi' ? 'वजन चुनें:' : 'Select Weight:'}
            </span>
            {(['1g', '8g', '10g', '100g', '1tola'] as GoldUnit[]).map((unit) => (
              <button
                key={unit}
                id={`gold-unit-${unit}`}
                onClick={() => setSelectedGoldUnit(unit)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedGoldUnit === unit
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/5 backdrop-blur-md text-slate-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                {getGoldUnitLabel(unit)}
              </button>
            ))}
          </div>

          {/* Main Price Display */}
          <div className="mt-5 p-5 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/10 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-amber-300 font-bold">
                    {lang === 'hi'
                      ? `${currentGoldObj.nameHi} - ${getGoldUnitLabel(selectedGoldUnit)}`
                      : `${currentGoldObj.nameEn} - ${getGoldUnitLabel(selectedGoldUnit)}`}
                  </span>
                  {includeGst && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                      {lang === 'hi' ? '3% GST सहित' : 'Incl. 3% GST'}
                    </span>
                  )}
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-300 tracking-tight mt-1">
                  ₹{(includeGst ? currentGoldGstPrice : currentGoldBasePrice).toLocaleString('en-IN')}
                </div>
                {includeGst ? (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi'
                      ? `(मूल भाव: ₹${currentGoldBasePrice.toLocaleString('en-IN')} + 3% GST: ₹${goldGstAmount.toLocaleString('en-IN')})`
                      : `(Base: ₹${currentGoldBasePrice.toLocaleString('en-IN')} + 3% GST: ₹${goldGstAmount.toLocaleString('en-IN')})`}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi' ? '(सर्राफा हाजिर भाव • खरीदारी पर 3% GST अतिरिक्त लगेगा)' : '(Ex-GST Bullion Spot Rate)'}
                  </p>
                )}
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">{lang === 'hi' ? 'प्रति ग्राम भाव' : 'Per Gram Rate'}</span>
                <span className="text-base sm:text-lg font-bold text-amber-200">
                  ₹{Math.round(includeGst ? goldGramRate * 1.03 : goldGramRate).toLocaleString('en-IN')}/g
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{lang === 'hi' ? 'आज का उच्चतम' : "Day's High"}</span>
                <span className="font-bold text-slate-200">
                  ₹{Math.round(includeGst ? currentGoldObj.high24h * 1.03 : currentGoldObj.high24h).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{lang === 'hi' ? 'आज का न्यूनतम' : "Day's Low"}</span>
                <span className="font-bold text-slate-200">
                  ₹{Math.round(includeGst ? currentGoldObj.low24h * 1.03 : currentGoldObj.low24h).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{lang === 'hi' ? '1 तोला (11.66g)' : '1 Tola Rate'}</span>
                <span className="font-bold text-amber-300">
                  ₹{Math.round(includeGst ? currentGoldObj.pricePerTola * 1.03 : currentGoldObj.pricePerTola).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Action / Calculator Trigger */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 mr-1.5" />
              <span>{lang === 'hi' ? 'ड्यूटी व शुद्धता पूरी तरह फिक्स' : 'Customs Duty & Purity Fixed'}</span>
            </div>

            <button
              id="gold-calculate-now-btn"
              onClick={() => onSelectForCalculator('gold', selectedGoldKarat, getGoldWeightGrams(selectedGoldUnit))}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>{lang === 'hi' ? 'बिल व जीएसटी निकालें' : 'Calculate Bill with GST'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SILVER RATE HERO CARD (FROSTED GLASS) */}
        <div className="relative rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-slate-300/30 p-6 sm:p-7 shadow-2xl shadow-slate-500/10 overflow-hidden hover:border-slate-300/40 transition-all duration-300">
          {/* Ambient Silver Glow inside glass */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-300/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          {/* Card Header */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-300/20 backdrop-blur-md border border-slate-300/40 flex items-center justify-center shadow-lg shadow-slate-400/20 text-slate-200">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                    {lang === 'hi' ? 'चांदी का ताजा भाव' : 'Silver Live Rate'}
                  </h2>
                  <span className="bg-slate-400/20 text-slate-200 border border-slate-300/30 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    999 Fine Silver
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'hi' ? '99.9% शुद्ध फाइन सिल्वर व 925 स्टर्लिंग चांदी के भाव' : '99.9% Pure Fine Silver & 92.5% Sterling Silver Rates'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center text-xs font-bold text-emerald-300 bg-emerald-400/15 backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-full shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                +₹{rates.silver.fine999.change24h} (+{rates.silver.fine999.changePercent24h}%)
              </div>
            </div>
          </div>

          {/* Purity Comparison Quick View */}
          <div className="mt-5 grid grid-cols-2 gap-2 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-xs font-bold text-slate-200 block">
                {lang === 'hi' ? '999 शुद्ध फाइन चांदी' : '999 Fine Pure Silver'}
              </span>
              <span className="text-sm font-extrabold text-white">
                ₹{Math.round(includeGst ? rates.silver.fine999.pricePerKg! * 1.03 : rates.silver.fine999.pricePerKg!).toLocaleString('en-IN')}/kg
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/5 text-center">
              <span className="text-xs font-bold text-slate-300 block">
                {lang === 'hi' ? '925 स्टर्लिंग चांदी' : '925 Sterling Silver'}
              </span>
              <span className="text-sm font-extrabold text-slate-300">
                ₹{Math.round(includeGst ? rates.silver.sterling925.pricePerKg! * 1.03 : rates.silver.sterling925.pricePerKg!).toLocaleString('en-IN')}/kg
              </span>
            </div>
          </div>

          {/* Unit Selector Pills */}
          <div className="mt-4 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">
              {lang === 'hi' ? 'वजन चुनें:' : 'Select Weight:'}
            </span>
            {(['1g', '10g', '100g', '1kg', '1tola'] as SilverUnit[]).map((unit) => (
              <button
                key={unit}
                id={`silver-unit-${unit}`}
                onClick={() => setSelectedSilverUnit(unit)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedSilverUnit === unit
                    ? 'bg-slate-200 text-slate-950 shadow-sm'
                    : 'bg-white/5 backdrop-blur-md text-slate-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                {getSilverUnitLabel(unit)}
              </button>
            ))}
          </div>

          {/* Main Price Display */}
          <div className="mt-5 p-5 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/10 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-300 font-bold">
                    {lang === 'hi'
                      ? `999 फाइन चांदी (99.9%) - ${getSilverUnitLabel(selectedSilverUnit)}`
                      : `999 Fine Silver (99.9%) - ${getSilverUnitLabel(selectedSilverUnit)}`}
                  </span>
                  {includeGst && (
                    <span className="text-[10px] bg-slate-300/20 text-slate-200 border border-slate-300/30 px-2 py-0.5 rounded-full font-bold">
                      {lang === 'hi' ? '3% GST सहित' : 'Incl. 3% GST'}
                    </span>
                  )}
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight mt-1">
                  ₹{(includeGst ? currentSilverGstPrice : currentSilverBasePrice).toLocaleString('en-IN')}
                </div>
                {includeGst ? (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi'
                      ? `(मूल भाव: ₹${currentSilverBasePrice.toLocaleString('en-IN')} + 3% GST: ₹${silverGstAmount.toLocaleString('en-IN')})`
                      : `(Base: ₹${currentSilverBasePrice.toLocaleString('en-IN')} + 3% GST: ₹${silverGstAmount.toLocaleString('en-IN')})`}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'hi' ? '(सर्राफा हाजिर भाव • खरीदारी पर 3% GST अतिरिक्त लगेगा)' : '(Ex-GST Bullion Spot Rate)'}
                  </p>
                )}
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">{lang === 'hi' ? 'प्रति ग्राम भाव' : 'Per Gram Rate'}</span>
                <span className="text-base sm:text-lg font-bold text-slate-200">
                  ₹{((Math.round(includeGst ? silver999GramRate * 1.03 * 10 : silver999GramRate * 10)) / 10).toLocaleString('en-IN')}/g
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{lang === 'hi' ? '100 ग्राम चांदी' : '100g Silver'}</span>
                <span className="font-bold text-slate-200">
                  ₹{Math.round(includeGst ? silver999GramRate * 100 * 1.03 : silver999GramRate * 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{lang === 'hi' ? '1 किलोग्राम (1kg)' : '1 kg Silver'}</span>
                <span className="font-bold text-slate-200">
                  ₹{Math.round(includeGst ? rates.silver.fine999.pricePerKg! * 1.03 : rates.silver.fine999.pricePerKg!).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">{lang === 'hi' ? '1 तोला (11.66g)' : '1 Tola Rate'}</span>
                <span className="font-bold text-slate-200">
                  ₹{Math.round(includeGst ? rates.silver.fine999.pricePerTola * 1.03 : rates.silver.fine999.pricePerTola).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Action / Calculator Trigger */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-slate-400 mr-1.5" />
              <span>{lang === 'hi' ? 'सिक्के, सिल्लियां व बर्तन हेतु' : 'For Coins, Bars & Utensils'}</span>
            </div>

            <button
              id="silver-calculate-now-btn"
              onClick={() => onSelectForCalculator('silver', '999', getSilverWeightGrams(selectedSilverUnit))}
              className="px-4 py-2 bg-slate-200 hover:bg-white text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-slate-500/20 transition transform active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>{lang === 'hi' ? 'चांदी बिल कैलकुलेट करें' : 'Calculate Silver Bill'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
