import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Receipt,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  RefreshCw,
  Share2,
  Percent,
  Coins,
  ChevronDown,
  Info,
  Scale,
  Gem,
  Tag,
  BadgePercent,
  TrendingUp,
  Bookmark,
} from 'lucide-react';
import { BullionRates, CityRate, Language, SavedBillEstimate } from '../types';
import { t, CITY_NAMES } from '../i18n/translations';

interface JewelleryCalculatorProps {
  rates: BullionRates;
  cities: CityRate[];
  selectedCityId: string;
  lang: Language;
  prefilledMetal?: 'gold' | 'silver';
  prefilledPurity?: string;
  prefilledWeight?: number;
  onSaveEstimate?: (estimate: SavedBillEstimate) => void;
}


type WeightUnit = 'gram' | 'tola' | 'pavan' | 'masha' | 'ratti' | 'mg' | 'kg';

interface PresetItem {
  id: string;
  nameHi: string;
  nameEn: string;
  metal: 'gold' | 'silver';
  purity: string;
  weightGrams: number;
  defaultMakingPct: number;
  icon: string;
}

const PRESET_JEWELLERY: PresetItem[] = [
  { id: 'ring', nameHi: 'अंगूठी (Ring)', nameEn: 'Gold Ring', metal: 'gold', purity: 'k22', weightGrams: 4.5, defaultMakingPct: 10, icon: '💍' },
  { id: 'chain', nameHi: 'चेन / मंगलसूत्र', nameEn: 'Gold Chain', metal: 'gold', purity: 'k22', weightGrams: 12, defaultMakingPct: 8, icon: '📿' },
  { id: 'bangles', nameHi: 'कंगन / कड़ा (2 Pc)', nameEn: 'Gold Bangles', metal: 'gold', purity: 'k22', weightGrams: 24, defaultMakingPct: 10, icon: '✨' },
  { id: 'necklace', nameHi: 'हार सेट (Necklace)', nameEn: 'Necklace Set', metal: 'gold', purity: 'k22', weightGrams: 35, defaultMakingPct: 12, icon: '👑' },
  { id: 'coin24k', nameHi: '24K शुद्ध सिक्का', nameEn: '24K Gold Coin', metal: 'gold', purity: 'k24', weightGrams: 10, defaultMakingPct: 2, icon: '🪙' },
  { id: 'diamond18k', nameHi: '18K डायमंड जेवर', nameEn: '18K Diamond Item', metal: 'gold', purity: 'k18', weightGrams: 5, defaultMakingPct: 14, icon: '💎' },
  { id: 'silver_payal', nameHi: 'चांदी की पायल', nameEn: 'Silver Anklet', metal: 'silver', purity: '925', weightGrams: 100, defaultMakingPct: 12, icon: '🥈' },
  { id: 'silver_coin', nameHi: 'चांदी का सिक्का 999', nameEn: '999 Silver Coin', metal: 'silver', purity: '999', weightGrams: 50, defaultMakingPct: 3, icon: '🪙' },
  { id: 'silver_thali', nameHi: 'चांदी के बर्तन/थाली', nameEn: 'Silver Utensil', metal: 'silver', purity: '925', weightGrams: 350, defaultMakingPct: 10, icon: '🍽️' },
];

export const JewelleryCalculator: React.FC<JewelleryCalculatorProps> = ({
  rates,
  cities,
  selectedCityId,
  lang,
  prefilledMetal = 'gold',
  prefilledPurity = 'k22',
  prefilledWeight = 10,
  onSaveEstimate,
}) => {

  const [calculatorTab, setCalculatorTab] = useState<'buy' | 'exchange'>('buy');
  
  // Metal and purity
  const [metal, setMetal] = useState<'gold' | 'silver'>(prefilledMetal);
  const [goldPurity, setGoldPurity] = useState<'k24' | 'k22' | 'k18' | 'k14'>('k22');
  const [silverPurity, setSilverPurity] = useState<'999' | '925'>('999');

  // Weight & Units
  const [grossWeightInput, setGrossWeightInput] = useState<string>(prefilledWeight.toString());
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('gram');
  const [hasStoneWeight, setHasStoneWeight] = useState<boolean>(false);
  const [stoneWeightInput, setStoneWeightInput] = useState<string>('0');
  const [stoneValueInput, setStoneValueInput] = useState<string>('0');

  // Making charges
  const [makingChargeType, setMakingChargeType] = useState<'percent' | 'perGram' | 'fixed'>('percent');
  const [makingChargeValue, setMakingChargeValue] = useState<string>('10');
  const [makingDiscountPct, setMakingDiscountPct] = useState<string>('0');

  // Hallmarking & custom rate
  const [includeHallmarkFee, setIncludeHallmarkFee] = useState<boolean>(true);
  const [hallmarkPieces, setHallmarkPieces] = useState<number>(1);
  const [customRateOverride, setCustomRateOverride] = useState<string>('');
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);

  // Integrated Old Gold Exchange
  const [includeExchangeInBill, setIncludeExchangeInBill] = useState<boolean>(false);
  const [oldGoldWeight, setOldGoldWeight] = useState<string>('10');
  const [oldGoldKarat, setOldGoldKarat] = useState<'k24' | 'k22' | 'k18' | 'k14'>('k22');
  const [meltingDeduction, setMeltingDeduction] = useState<string>('2'); // 2% deduction

  // Copy and share feedback state
  const [copied, setCopied] = useState<boolean>(false);
  const [whatsAppShared, setWhatsAppShared] = useState<boolean>(false);
  const [isEstimateSaved, setIsEstimateSaved] = useState<boolean>(false);


  // Effect to synchronize when prefilled props change from Hero Card or clicks
  useEffect(() => {
    if (prefilledMetal) {
      setMetal(prefilledMetal);
    }
    if (prefilledPurity) {
      if (prefilledMetal === 'gold' || prefilledPurity.startsWith('k')) {
        if (['k24', 'k22', 'k18', 'k14'].includes(prefilledPurity)) {
          setGoldPurity(prefilledPurity as any);
        }
      } else if (prefilledMetal === 'silver' || ['999', '925'].includes(prefilledPurity)) {
        if (['999', '925'].includes(prefilledPurity)) {
          setSilverPurity(prefilledPurity as any);
        }
      }
    }
    if (prefilledWeight && prefilledWeight > 0) {
      setGrossWeightInput(prefilledWeight.toString());
      setWeightUnit('gram');
    }
  }, [prefilledMetal, prefilledPurity, prefilledWeight]);

  // Selected city resolution
  const selectedCity = useMemo(() => {
    return cities.find((c) => c.id === selectedCityId) || cities[0];
  }, [cities, selectedCityId]);

  // Helper unit conversions to Grams
  const convertUnitToGrams = (val: number, unit: WeightUnit): number => {
    switch (unit) {
      case 'gram': return val;
      case 'tola': return val * 11.6638; // 1 tola = 11.6638 grams
      case 'pavan': return val * 8.0; // 1 Pavan / Sovereign = 8.0 grams
      case 'masha': return val * 0.972; // 1 Masha = 0.972 grams
      case 'ratti': return val * 0.1215; // 1 Ratti = 0.1215 grams
      case 'mg': return val / 1000;
      case 'kg': return val * 1000;
    }
  };

  const parsedGrossWeight = parseFloat(grossWeightInput) || 0;
  const grossWeightInGrams = convertUnitToGrams(parsedGrossWeight, weightUnit);

  const parsedStoneWeight = hasStoneWeight ? (parseFloat(stoneWeightInput) || 0) : 0;
  const netMetalWeightGrams = Math.max(0, grossWeightInGrams - parsedStoneWeight);
  const parsedStoneValue = hasStoneWeight ? (parseFloat(stoneValueInput) || 0) : 0;

  // Base rate per gram resolver
  const ratePerGram = useMemo(() => {
    if (isCustomRate && parseFloat(customRateOverride) > 0) {
      return parseFloat(customRateOverride);
    }

    if (metal === 'gold') {
      const city24kPer10g = selectedCity?.gold24kPer10g || rates?.gold?.k24?.pricePer10Gram || (rates?.gold?.k24?.pricePerGram ? rates.gold.k24.pricePerGram * 10 : 74000);
      const base24kPerGram = city24kPer10g / 10;

      switch (goldPurity) {
        case 'k24':
          return selectedCity?.gold24kPer10g ? selectedCity.gold24kPer10g / 10 : (rates?.gold?.k24?.pricePerGram || base24kPerGram);
        case 'k22':
          return selectedCity?.gold22kPer10g ? selectedCity.gold22kPer10g / 10 : (rates?.gold?.k22?.pricePerGram || (base24kPerGram * 22) / 24);
        case 'k18':
          return selectedCity?.gold18kPer10g ? selectedCity.gold18kPer10g / 10 : (rates?.gold?.k18?.pricePerGram || (base24kPerGram * 18) / 24);
        case 'k14':
          return rates?.gold?.k14?.pricePerGram || (base24kPerGram * 14) / 24;
      }
    } else {
      const citySilverPerKg = selectedCity?.silverPerKg || rates?.silver?.fine999?.pricePerKg || (rates?.silver?.fine999?.pricePerGram ? rates.silver.fine999.pricePerGram * 1000 : 89000);
      const baseSilverPerGram = citySilverPerKg / 1000;

      switch (silverPurity) {
        case '999':
          return baseSilverPerGram;
        case '925':
          return rates?.silver?.sterling925?.pricePerGram || (baseSilverPerGram * 0.925);
      }
    }
  }, [metal, goldPurity, silverPurity, isCustomRate, customRateOverride, selectedCity, rates]);

  // Core Math Calculations
  const rawMetalCost = Math.round(netMetalWeightGrams * ratePerGram);

  // Making charges
  const parsedMaking = parseFloat(makingChargeValue) || 0;
  const parsedMakingDiscount = parseFloat(makingDiscountPct) || 0;

  let grossMakingCharges = 0;
  if (makingChargeType === 'percent') {
    grossMakingCharges = Math.round(rawMetalCost * (parsedMaking / 100));
  } else if (makingChargeType === 'perGram') {
    grossMakingCharges = Math.round(netMetalWeightGrams * parsedMaking);
  } else {
    grossMakingCharges = Math.round(parsedMaking);
  }

  const makingDiscountAmount = parsedMakingDiscount > 0
    ? Math.round(grossMakingCharges * (parsedMakingDiscount / 100))
    : 0;
  
  const netMakingCharges = Math.max(0, grossMakingCharges - makingDiscountAmount);

  // Subtotal (Taxable Amount)
  const subtotalBeforeTax = rawMetalCost + netMakingCharges + parsedStoneValue;

  // GST Breakdown: 3% standard on precious jewellery in India (1.5% CGST + 1.5% SGST)
  const gstRate = 3;
  const cgstAmount = Math.round(subtotalBeforeTax * 0.015);
  const sgstAmount = Math.round(subtotalBeforeTax * 0.015);
  const totalGstAmount = cgstAmount + sgstAmount; // Exactly 3%

  // BIS HUID Hallmarking: ₹45 + 18% GST = ₹53.10 (~₹53) per gold piece
  const hallmarkFeePerPiece = 53;
  const totalHallmarkFee = (includeHallmarkFee && metal === 'gold') ? (hallmarkPieces * hallmarkFeePerPiece) : 0;

  // Gross Jewellery Price (नया जेवर कुल कीमत)
  const grossNewJewelleryTotal = subtotalBeforeTax + totalGstAmount + totalHallmarkFee;
  const effectivePerGram = netMetalWeightGrams > 0 ? Math.round(grossNewJewelleryTotal / netMetalWeightGrams) : 0;

  // Old Gold Exchange Value calculation
  const parsedOldWeight = parseFloat(oldGoldWeight) || 0;
  const old24kRate = (selectedCity?.gold24kPer10g || rates?.gold?.k24?.pricePer10Gram || 74000) / 10;
  
  let oldPurityRatio = 22 / 24;
  if (oldGoldKarat === 'k24') oldPurityRatio = 1;
  else if (oldGoldKarat === 'k18') oldPurityRatio = 18 / 24;
  else if (oldGoldKarat === 'k14') oldPurityRatio = 14 / 24;

  const grossOldGoldVal = parsedOldWeight * old24kRate * oldPurityRatio;
  const deductionPct = parseFloat(meltingDeduction) || 0;
  const deductionAmount = Math.round(grossOldGoldVal * (deductionPct / 100));
  const netOldGoldExchangeValue = Math.round(grossOldGoldVal - deductionAmount);

  // Final Net Cash Payable (अगर पुराना सोना एक्सचेंज किया जाए तो)
  const finalNetPayable = includeExchangeInBill
    ? Math.max(0, grossNewJewelleryTotal - netOldGoldExchangeValue)
    : grossNewJewelleryTotal;

  // Preset handler
  const handleApplyPreset = (preset: PresetItem) => {
    setMetal(preset.metal);
    if (preset.metal === 'gold') {
      setGoldPurity(preset.purity as any);
    } else {
      setSilverPurity(preset.purity as any);
    }
    setGrossWeightInput(preset.weightGrams.toString());
    setWeightUnit('gram');
    setMakingChargeType('percent');
    setMakingChargeValue(preset.defaultMakingPct.toString());
    setHasStoneWeight(false);
  };

  // Reset form
  const handleReset = () => {
    setGrossWeightInput('10');
    setWeightUnit('gram');
    setMakingChargeType('percent');
    setMakingChargeValue('10');
    setMakingDiscountPct('0');
    setHasStoneWeight(false);
    setStoneWeightInput('0');
    setStoneValueInput('0');
    setIsCustomRate(false);
    setCustomRateOverride('');
    setIncludeExchangeInBill(false);
  };

  // Copy Quotation Bill Slip
  const generateReceiptText = (): string => {
    const cityName = selectedCity?.cityNameHi || 'All India';
    const metalLabel = metal === 'gold' ? `Gold ${goldPurity.toUpperCase()}` : `Silver ${silverPurity}`;
    
    return `========================================
✨ ${lang === 'hi' ? 'सोना चांदी कोटेशन / टैक्स बिल' : 'Gold & Silver Jewellery Estimate'} ✨
========================================
📍 ${lang === 'hi' ? 'शहर' : 'City'}: ${cityName}
💎 ${lang === 'hi' ? 'आभूषण/धातु' : 'Metal'}: ${metalLabel}
⚖️ ${lang === 'hi' ? 'कुल वजन (Gross)' : 'Gross Weight'}: ${parsedGrossWeight} ${weightUnit.toUpperCase()} (${grossWeightInGrams.toFixed(3)}g)
${hasStoneWeight ? `🔸 ${lang === 'hi' ? 'स्टोन/नग वजन घटाव' : 'Stone Weight'}: -${parsedStoneWeight.toFixed(3)}g\n` : ''}⚖️ ${lang === 'hi' ? 'शुद्ध धातु वजन (Net)' : 'Net Weight'}: ${netMetalWeightGrams.toFixed(3)}g
💰 ${lang === 'hi' ? 'प्रति ग्राम भाव' : 'Rate/Gram'}: ₹${Math.round(ratePerGram).toLocaleString('en-IN')}/g
----------------------------------------
1. ${lang === 'hi' ? 'शुद्ध धातु मूल्य' : 'Metal Value'}: ₹${rawMetalCost.toLocaleString('en-IN')}
2. ${lang === 'hi' ? 'मेकिंग चार्ज' : 'Making Charges'} (${makingChargeType === 'percent' ? `${makingChargeValue}%` : `₹${makingChargeValue}/g`}): +₹${netMakingCharges.toLocaleString('en-IN')}
${parsedStoneValue > 0 ? `3. ${lang === 'hi' ? 'हीरा / नग मूल्य' : 'Stone/Diamond'}: +₹${parsedStoneValue.toLocaleString('en-IN')}\n` : ''}----------------------------------------
💼 ${lang === 'hi' ? 'कर योग्य उप-कुल (Subtotal)' : 'Taxable Subtotal'}: ₹${subtotalBeforeTax.toLocaleString('en-IN')}
🧾 ${lang === 'hi' ? '3% जीएसटी (CGST 1.5% + SGST 1.5%)' : '3% GST (1.5%+1.5%)'}: +₹${totalGstAmount.toLocaleString('en-IN')}
${totalHallmarkFee > 0 ? `🛡️ ${lang === 'hi' ? 'BIS HUID हॉलमार्किंग शुल्क' : 'Hallmark Fee'}: +₹${totalHallmarkFee}\n` : ''}========================================
🌟 ${lang === 'hi' ? 'नया जेवर कुल मूल्य' : 'NEW JEWELLERY TOTAL'}: ₹${grossNewJewelleryTotal.toLocaleString('en-IN')}
${includeExchangeInBill ? `🔄 ${lang === 'hi' ? 'पुराना सोना एक्सचेंज छूट' : 'Old Gold Exchange Credit'}: -₹${netOldGoldExchangeValue.toLocaleString('en-IN')}\n========================================\n💰 ${lang === 'hi' ? 'ग्राहक द्वारा शुद्ध देय राशि' : 'NET PAYABLE AMOUNT'}: ₹${finalNetPayable.toLocaleString('en-IN')}\n` : ''}----------------------------------------
📅 ${rates.lastUpdated}
✅ ${lang === 'hi' ? '100% BIS HUID हॉलमार्क प्रमाणित' : '100% BIS HUID Hallmarked Standard'}
========================================`;
  };

  const handleCopyReceipt = () => {
    const text = generateReceiptText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setWhatsAppShared(true);
    setTimeout(() => setWhatsAppShared(false), 2500);
  };

  const handleSaveQuotation = () => {
    const newEstimate: SavedBillEstimate = {
      id: `est_${Date.now()}`,
      title: metal === 'gold' ? `Gold ${goldPurity.toUpperCase()} Jewellery` : `Silver ${silverPurity} Article`,
      metal,
      purity: metal === 'gold' ? goldPurity : silverPurity,
      weightGrams: Number(netMetalWeightGrams.toFixed(2)),
      makingCharges: makingChargeType === 'percent' ? `${makingChargeValue}%` : `₹${makingChargeValue}/g`,
      gstAmount: totalGstAmount,
      totalPrice: finalNetPayable,
      cityName: selectedCity?.cityNameHi || 'Delhi NCR',
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    if (onSaveEstimate) {
      onSaveEstimate(newEstimate);
    } else {
      // Local fallback
      try {
        const raw = localStorage.getItem('sonachandi_user_profile');
        const prof = raw ? JSON.parse(raw) : { savedEstimates: [] };
        prof.savedEstimates = [newEstimate, ...(prof.savedEstimates || [])];
        localStorage.setItem('sonachandi_user_profile', JSON.stringify(prof));
      } catch (e) {
        // Ignore local storage error
      }
    }

    setIsEstimateSaved(true);
    setTimeout(() => setIsEstimateSaved(false), 2500);
  };


  return (
    <section id="jewellery-calculator-section" className="my-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 sm:p-8 shadow-2xl hover:border-amber-400/30 transition-all duration-300">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 shadow-lg shadow-amber-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('calcTitle', lang)}
              </h2>
              <span className="bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                3% GST + HUID
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {t('calcSubtitle', lang)}
            </p>
          </div>
        </div>

        {/* Action Tabs & Reset */}
        <div className="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-y-2">
          <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
            <button
              id="calc-tab-buy"
              onClick={() => setCalculatorTab('buy')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ${
                calculatorTab === 'buy'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'नया जेवर बिल' : 'Jewellery Bill'}</span>
            </button>
            <button
              id="calc-tab-exchange"
              onClick={() => setCalculatorTab('exchange')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition flex items-center space-x-1.5 ${
                calculatorTab === 'exchange'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पुराना सोना एक्सचेंज' : 'Old Gold Calculator'}</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10 transition"
            title="रीसेट करें / Reset Inputs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK PRESETS CAROUSEL / BAR */}
      <div className="mt-4 pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">
            {lang === 'hi' ? 'आभूषण क्विक प्रीसेट्स (Quick Presets):' : 'Quick Jewellery Presets:'}
          </span>
        </div>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          {PRESET_JEWELLERY.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/40 text-xs font-semibold text-slate-200 hover:text-amber-200 transition shrink-0 flex items-center space-x-1.5 backdrop-blur-sm shadow-sm"
            >
              <span>{preset.icon}</span>
              <span>{lang === 'hi' ? preset.nameHi : preset.nameEn}</span>
              <span className="text-[10px] text-amber-300 bg-white/10 px-1.5 py-0.2 rounded font-mono">
                {preset.weightGrams}g
              </span>
            </button>
          ))}
        </div>
      </div>

      {calculatorTab === 'buy' ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Input Controls Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Metal & Karat Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-200 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-black">1</span>
                  <span>{t('metalType', lang)} & {t('purity', lang)}</span>
                </label>
                <span className="text-xs text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  {selectedCity?.cityNameHi || 'City Rate'}
                </span>
              </div>

              {/* Metal Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="calc-metal-gold"
                  onClick={() => setMetal('gold')}
                  className={`p-3 rounded-2xl border font-bold text-sm transition flex items-center justify-center space-x-2 backdrop-blur-md ${
                    metal === 'gold'
                      ? 'bg-amber-400/25 border-amber-400/60 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{t('gold', lang)}</span>
                </button>
                <button
                  type="button"
                  id="calc-metal-silver"
                  onClick={() => setMetal('silver')}
                  className={`p-3 rounded-2xl border font-bold text-sm transition flex items-center justify-center space-x-2 backdrop-blur-md ${
                    metal === 'silver'
                      ? 'bg-slate-300/25 border-slate-300/60 text-slate-200 shadow-md'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Coins className="w-4 h-4 text-slate-300" />
                  <span>{t('silver', lang)}</span>
                </button>
              </div>

              {/* Karat / Purity Pills */}
              {metal === 'gold' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'k24', label: '24K (999)', sub: lang === 'hi' ? 'शुद्ध सिक्का / बार' : '99.9% Pure' },
                    { id: 'k22', label: '22K (916)', sub: lang === 'hi' ? 'पारंपरिक आभूषण' : '91.6% Jewellery' },
                    { id: 'k18', label: '18K (750)', sub: lang === 'hi' ? 'डायमंड / हॉलमार्क' : '75.0% Diamond' },
                    { id: 'k14', label: '14K (585)', sub: lang === 'hi' ? 'लाइटवेट मॉडर्न' : '58.5% Lightweight' },
                  ].map((k) => (
                    <button
                      key={k.id}
                      id={`calc-karat-${k.id}`}
                      onClick={() => setGoldPurity(k.id as any)}
                      className={`p-2.5 rounded-xl text-center border text-xs transition backdrop-blur-md ${
                        goldPurity === k.id
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md ring-2 ring-amber-400/40'
                          : 'bg-black/30 text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-extrabold text-sm">{k.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{k.sub}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: '999', label: '999 Fine Pure Silver', sub: lang === 'hi' ? '99.9% शुद्ध सिक्का / सिल्ली' : '99.9% Pure Bar' },
                    { id: '925', label: '925 Sterling Silver', sub: lang === 'hi' ? '92.5% जेवराती चांदी / बर्तन' : '92.5% Ornaments' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      id={`calc-silver-${s.id}`}
                      onClick={() => setSilverPurity(s.id as any)}
                      className={`p-3 rounded-xl text-center border text-xs transition backdrop-blur-md ${
                        silverPurity === s.id
                          ? 'bg-slate-200 text-slate-950 font-black border-white shadow-md ring-2 ring-slate-300/40'
                          : 'bg-black/30 text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-extrabold text-sm">{s.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{s.sub}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Weight & Measurement Unit */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-200 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-black">2</span>
                  <span>{t('weight', lang)}</span>
                </label>
                <div className="text-xs text-slate-400 flex items-center space-x-2">
                  <span>1 तोला = 11.6638g</span>
                  <span>•</span>
                  <span>1 पवन = 8.0g</span>
                </div>
              </div>

              {/* Weight Input + Unit dropdown */}
              <div className="flex rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 overflow-hidden focus-within:border-amber-400/70 focus-within:ring-2 focus-within:ring-amber-400/20 transition">
                <input
                  id="calc-weight-input"
                  type="number"
                  step="any"
                  min="0.001"
                  value={grossWeightInput}
                  onChange={(e) => setGrossWeightInput(e.target.value)}
                  placeholder="10.0"
                  className="w-full px-4 py-3 bg-transparent text-xl font-black text-white focus:outline-none placeholder-slate-500"
                />
                <select
                  id="calc-weight-unit"
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                  className="bg-slate-950 text-amber-300 text-xs sm:text-sm font-bold px-3 py-3 border-l border-white/15 focus:outline-none cursor-pointer"
                >
                  <option value="gram">{lang === 'hi' ? 'ग्राम (Gram)' : 'Grams (g)'}</option>
                  <option value="tola">{lang === 'hi' ? 'तोला (11.66g)' : 'Tola'}</option>
                  <option value="pavan">{lang === 'hi' ? 'पवन/सॉवरेन (8g)' : 'Pavan (8g)'}</option>
                  <option value="masha">{lang === 'hi' ? 'माशा (0.97g)' : 'Masha'}</option>
                  <option value="ratti">{lang === 'hi' ? 'रत्ती (0.12g)' : 'Ratti'}</option>
                  <option value="mg">{lang === 'hi' ? 'मिलीग्राम (mg)' : 'Milligram (mg)'}</option>
                  <option value="kg">{lang === 'hi' ? 'किलोग्राम (kg)' : 'Kilogram (kg)'}</option>
                </select>
              </div>

              {/* Weight Unit conversions */}
              <div className="grid grid-cols-3 gap-2 text-[11px] bg-white/5 p-2 rounded-xl border border-white/5 text-center text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">ग्राम में:</span>
                  <strong className="text-amber-300 font-mono text-xs">{grossWeightInGrams.toFixed(3)}g</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">तोला में:</span>
                  <strong className="text-amber-300 font-mono text-xs">{(grossWeightInGrams / 11.6638).toFixed(3)} Tola</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">पवन (8g):</span>
                  <strong className="text-amber-300 font-mono text-xs">{(grossWeightInGrams / 8.0).toFixed(2)} Pavan</strong>
                </div>
              </div>

              {/* Optional Stone / Gemstone Weight Deduction Checkbox */}
              <div className="pt-1">
                <div className="flex items-center space-x-2">
                  <input
                    id="toggle-stone-weight"
                    type="checkbox"
                    checked={hasStoneWeight}
                    onChange={(e) => setHasStoneWeight(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 accent-amber-400 cursor-pointer"
                  />
                  <label htmlFor="toggle-stone-weight" className="text-xs text-slate-300 font-semibold cursor-pointer flex items-center space-x-1">
                    <Gem className="w-3.5 h-3.5 text-sky-400" />
                    <span>{lang === 'hi' ? 'नग / स्टोन / मोती का वजन घटाएं (Net Gold Deduction)' : 'Deduct Stone / Pearl Weight from Gold'}</span>
                  </label>
                </div>

                {hasStoneWeight && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-black/40 border border-sky-400/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">
                          {lang === 'hi' ? 'स्टोन का वजन (Grams):' : 'Stone Weight (Grams):'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={stoneWeightInput}
                          onChange={(e) => setStoneWeightInput(e.target.value)}
                          placeholder="0.5"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-sky-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">
                          {lang === 'hi' ? 'स्टोन/डायमंड का मूल्य (₹):' : 'Stone / Diamond Value (₹):'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={stoneValueInput}
                          onChange={(e) => setStoneValueInput(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-bold text-xs focus:outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-sky-300 flex justify-between">
                      <span>शुद्ध धातु वजन (Net Gold): <strong>{netMetalWeightGrams.toFixed(3)}g</strong></span>
                      <span>(सोने का भाव केवल शुद्ध वजन पर लगेगा)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Making Charges (घड़ाई शुल्क) & Bargain Discount */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-200 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-black">3</span>
                  <span>{t('makingCharges', lang)} (Wastage / Labour)</span>
                </label>

                {/* Making Charge Type Selector */}
                <div className="flex text-xs space-x-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
                  <button
                    id="making-type-percent"
                    type="button"
                    onClick={() => setMakingChargeType('percent')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                      makingChargeType === 'percent'
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    % {t('percent', lang)}
                  </button>
                  <button
                    id="making-type-pergram"
                    type="button"
                    onClick={() => setMakingChargeType('perGram')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                      makingChargeType === 'perGram'
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ₹/g {t('flat', lang)}
                  </button>
                  <button
                    id="making-type-fixed"
                    type="button"
                    onClick={() => setMakingChargeType('fixed')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                      makingChargeType === 'fixed'
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ₹ Fixed
                  </button>
                </div>
              </div>

              {/* Input for Making Charges */}
              <div className="relative">
                <input
                  id="calc-making-charge-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={makingChargeValue}
                  onChange={(e) => setMakingChargeValue(e.target.value)}
                  placeholder={makingChargeType === 'percent' ? '10' : '450'}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-white font-bold text-base focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-amber-300 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
                  {makingChargeType === 'percent' ? '% of Metal' : makingChargeType === 'perGram' ? '₹ per gram' : '₹ Total'}
                </span>
              </div>

              {/* Quick % Buttons for fast selection */}
              {makingChargeType === 'percent' ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 6, 8, 10, 12, 14, 18, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMakingChargeValue(pct.toString())}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition backdrop-blur-sm ${
                        makingChargeValue === pct.toString()
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              ) : makingChargeType === 'perGram' ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 250, 350, 450, 600, 800].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setMakingChargeValue(rate.toString())}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition backdrop-blur-sm ${
                        makingChargeValue === rate.toString()
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      ₹{rate}/g
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Optional Making Charge Discount (Bargaining) */}
              <div className="flex items-center space-x-2 pt-1 text-xs text-slate-400">
                <BadgePercent className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'hi' ? 'मेकिंग चार्ज पर छूट (Discount %):' : 'Discount on Making Charges (%):'}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={makingDiscountPct}
                  onChange={(e) => setMakingDiscountPct(e.target.value)}
                  placeholder="0"
                  className="w-16 px-2 py-1 rounded-lg bg-black/40 border border-white/15 text-white font-bold text-xs text-center focus:outline-none focus:border-emerald-400"
                />
                <span>% off</span>
              </div>
            </div>

            {/* Step 4: Custom Jeweller Rate & Hallmarking Toggles */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              {/* Custom Jeweller Rate Override */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-2">
                  <input
                    id="toggle-custom-rate"
                    type="checkbox"
                    checked={isCustomRate}
                    onChange={(e) => setIsCustomRate(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 accent-amber-400 cursor-pointer"
                  />
                  <label htmlFor="toggle-custom-rate" className="text-slate-300 font-semibold cursor-pointer">
                    {lang === 'hi' ? 'ज्वेलर का कस्टम रेट डालें (Custom Rate per gram)' : 'Override Custom Jeweller Rate/g'}
                  </label>
                </div>

                {isCustomRate && (
                  <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input
                      id="custom-rate-input"
                      type="number"
                      value={customRateOverride}
                      onChange={(e) => setCustomRateOverride(e.target.value)}
                      placeholder={`${Math.round(ratePerGram)}`}
                      className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-300 font-black text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <span className="text-slate-400 text-[10px]">/g</span>
                  </div>
                )}
              </div>

              {/* Hallmark fee checkbox */}
              {metal === 'gold' && (
                <div className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2">
                    <input
                      id="toggle-hallmark-fee"
                      type="checkbox"
                      checked={includeHallmarkFee}
                      onChange={(e) => setIncludeHallmarkFee(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 accent-amber-400 cursor-pointer"
                    />
                    <label htmlFor="toggle-hallmark-fee" className="text-slate-300 font-semibold cursor-pointer">
                      {lang === 'hi'
                        ? 'BIS HUID हॉलमार्किंग शुल्क (₹45 + 18% GST = ₹53/पीस)'
                        : 'Include BIS HUID Hallmarking Fee (₹53 per piece)'}
                    </label>
                  </div>

                  {includeHallmarkFee && (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 text-[11px]">पीस:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={hallmarkPieces}
                        onChange={(e) => setHallmarkPieces(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 px-2 py-1 rounded-lg bg-slate-900 border border-white/15 text-white font-bold text-xs text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Integrated Old Gold Exchange Toggle in Bill */}
              <div className="flex items-center justify-between text-xs bg-amber-400/10 p-3 rounded-2xl border border-amber-400/25">
                <div className="flex items-center space-x-2">
                  <input
                    id="toggle-exchange-bill"
                    type="checkbox"
                    checked={includeExchangeInBill}
                    onChange={(e) => setIncludeExchangeInBill(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 accent-amber-400 cursor-pointer"
                  />
                  <label htmlFor="toggle-exchange-bill" className="text-amber-200 font-bold cursor-pointer">
                    🔄 {lang === 'hi' ? 'पुराना सोना बदलकर नया ले रहे हैं? (Old Gold Exchange)' : 'Exchange Old Gold with this Purchase?'}
                  </label>
                </div>
                {includeExchangeInBill && (
                  <span className="text-emerald-400 font-bold text-xs">
                    - ₹{netOldGoldExchangeValue.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Realtime Itemized Quotation Invoice Slip (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-amber-400/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Top golden ambient glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              {/* Slip Header */}
              <div className="flex items-center justify-between pb-4 border-b border-dashed border-white/15">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="font-extrabold text-amber-200 text-sm block">
                      {lang === 'hi' ? 'टैक्स इनवॉइस / बिल कोटेशन' : 'Jewellery Tax Quotation'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {metal === 'gold' ? `Gold ${goldPurity.toUpperCase()}` : `Silver ${silverPurity}`} • {netMetalWeightGrams.toFixed(2)}g
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-amber-300 font-bold bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30 block">
                    {selectedCity?.cityNameHi || 'All India'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ₹{Math.round(ratePerGram).toLocaleString('en-IN')}/g
                  </span>
                </div>
              </div>

              {/* Itemized Calculations Breakdown */}
              <div className="space-y-3 py-4 text-xs sm:text-sm">
                {/* 1. Raw Metal Cost */}
                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    1. {lang === 'hi' ? 'शुद्ध धातु मूल्य (Net Metal)' : 'Net Metal Cost'} ({netMetalWeightGrams.toFixed(2)}g):
                  </span>
                  <span className="font-extrabold text-white">
                    ₹{rawMetalCost.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* 2. Making Charges */}
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center space-x-1">
                    <span>
                      2. {lang === 'hi' ? 'मेकिंग चार्ज (घड़ाई)' : 'Making Charges'}:
                    </span>
                    <span className="text-[10px] text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded font-mono">
                      {makingChargeType === 'percent' ? `${makingChargeValue}%` : makingChargeType === 'perGram' ? `₹${makingChargeValue}/g` : 'Fixed'}
                    </span>
                  </div>
                  <span className="font-extrabold text-amber-300">
                    + ₹{netMakingCharges.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Making Discount if any */}
                {makingDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 text-xs pl-3">
                    <span>↳ {lang === 'hi' ? 'मेकिंग डिस्काउंट छूट' : 'Making Discount'} ({makingDiscountPct}%):</span>
                    <span>- ₹{makingDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Diamond / Stone value if any */}
                {parsedStoneValue > 0 && (
                  <div className="flex items-center justify-between text-sky-300">
                    <span>3. {lang === 'hi' ? 'हीरा / नग मूल्य' : 'Diamond / Stone Value'}:</span>
                    <span className="font-bold">+ ₹{parsedStoneValue.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Taxable Subtotal Divider */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-semibold">{lang === 'hi' ? 'कर योग्य उप-कुल (Taxable Subtotal)' : 'Taxable Subtotal'}:</span>
                  <span className="font-bold text-slate-200 text-sm">
                    ₹{subtotalBeforeTax.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* GST 3% Breakdown (CGST 1.5% + SGST 1.5%) */}
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-yellow-300 font-bold">
                    <span>3% GST (सोना-चांदी जीएसटी):</span>
                    <span className="text-sm">+ ₹{totalGstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pl-2">
                    <span>• CGST (1.5%): ₹{cgstAmount.toLocaleString('en-IN')}</span>
                    <span>• SGST (1.5%): ₹{sgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Hallmark Fee */}
                {totalHallmarkFee > 0 && (
                  <div className="flex items-center justify-between text-slate-300 text-xs">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'hi' ? 'BIS HUID हॉलमार्किंग शुल्क' : 'BIS Hallmark Fee'} ({hallmarkPieces} pc):</span>
                    </span>
                    <span className="font-semibold text-amber-300">
                      + ₹{totalHallmarkFee}
                    </span>
                  </div>
                )}

                {/* New Jewellery Total */}
                <div className="pt-2 border-t border-dashed border-white/15 flex items-center justify-between text-slate-200">
                  <span className="font-bold text-xs">{lang === 'hi' ? 'नया जेवर कुल कीमत' : 'New Jewellery Value'}:</span>
                  <span className="font-extrabold text-white text-base">
                    ₹{grossNewJewelleryTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* If Old Gold is exchanged */}
                {includeExchangeInBill && (
                  <div className="bg-emerald-400/10 p-2.5 rounded-xl border border-emerald-400/30 text-xs flex items-center justify-between text-emerald-300">
                    <div>
                      <span className="font-bold block">🔄 {lang === 'hi' ? 'पुराना सोना एक्सचेंज छूट' : 'Old Gold Exchange Credit'}:</span>
                      <span className="text-[10px] text-emerald-400/80">{oldGoldKarat.toUpperCase()} • {parsedOldWeight}g</span>
                    </div>
                    <span className="font-black text-sm">
                      - ₹{netOldGoldExchangeValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Final Grand Payable Banner */}
            <div className="pt-4 border-t-2 border-amber-400/30">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400/25 to-yellow-500/10 backdrop-blur-md border border-amber-400/50 shadow-inner">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase font-black tracking-wider text-amber-300">
                    {includeExchangeInBill
                      ? (lang === 'hi' ? 'अंतिम शुद्ध भुगतान (Net Payable)' : 'Final Net Cash Payable')
                      : (lang === 'hi' ? 'कुल देय राशि (Final Amount)' : 'Total Landed Bill')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (₹{effectivePerGram.toLocaleString('en-IN')}/g)
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight mt-1">
                  ₹{finalNetPayable.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Action Buttons: Copy, WhatsApp Share, Save Quote & Print */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  id="calc-copy-receipt-btn"
                  type="button"
                  onClick={handleCopyReceipt}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="कोटेशन कॉपी करें / Copy Quote"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-extrabold">{lang === 'hi' ? 'कॉपी!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'hi' ? 'कॉपी पर्चा' : 'Copy'}</span>
                    </>
                  )}
                </button>

                <button
                  id="calc-whatsapp-btn"
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="व्हाट्सएप पर शेयर करें / Share on WhatsApp"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  id="calc-save-btn"
                  type="button"
                  onClick={handleSaveQuotation}
                  className="py-2.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 backdrop-blur-md border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="प्रोफ़ाइल में सेव करें / Save Quote"
                >
                  {isEstimateSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-extrabold">{lang === 'hi' ? 'सेव हुआ!' : 'Saved!'}</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'hi' ? 'सेव करें' : 'Save'}</span>
                    </>
                  )}
                </button>

                <button
                  id="calc-print-btn"
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="प्रिंट करें / Print Receipt"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>{lang === 'hi' ? 'प्रिंट' : 'Print'}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* STANDALONE OLD GOLD EXCHANGE TAB */
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-4 rounded-2xl bg-amber-400/10 backdrop-blur-md border border-amber-400/20 text-xs text-amber-300 leading-relaxed">
              💡 {lang === 'hi'
                ? 'पुराना सोना बेचते या नए गहने के बदले बदलते समय ज्वेलर शुद्धता (कैरेट) और मैल्टिंग (गलान/टांका) के हिसाब से कटौती करते हैं। यहां जानिए आपको मिलने वाली 100% सही व पारदर्शी कीमत:'
                : 'Calculate the accurate resale / exchange value of your old gold jewellery before visiting the jewellery showroom.'}
            </div>

            {/* Old Gold Karat */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {lang === 'hi' ? 'पुराने सोने की शुद्धता (Purity Karat)' : 'Old Gold Karat'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'k24', label: '24K (99.9%)', sub: lang === 'hi' ? 'सिक्का/बिस्कुट' : 'Coin / Bar' },
                  { id: 'k22', label: '22K (91.6%)', sub: lang === 'hi' ? 'हॉलमार्क आभूषण' : '91.6% Jewellery' },
                  { id: 'k18', label: '18K (75.0%)', sub: lang === 'hi' ? 'डायमंड आभूषण' : '75.0% Diamond' },
                  { id: 'k14', label: '14K (58.5%)', sub: lang === 'hi' ? 'लाइटवेट जेवर' : '58.5% Jewellery' },
                ].map((k) => (
                  <button
                    key={k.id}
                    id={`old-karat-${k.id}`}
                    type="button"
                    onClick={() => setOldGoldKarat(k.id as any)}
                    className={`p-2.5 rounded-xl text-center border text-xs transition backdrop-blur-md ${
                      oldGoldKarat === k.id
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-black/30 text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-extrabold text-sm">{k.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{k.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Old Gold Weight Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">
                  {lang === 'hi' ? 'पुराने सोने का शुद्ध वजन (ग्राम में)' : 'Old Gold Weight (Grams)'}
                </label>
                <span className="text-xs text-amber-300 font-mono">
                  {(parseFloat(oldGoldWeight) || 0) > 0 ? `${((parseFloat(oldGoldWeight) || 0) / 11.6638).toFixed(3)} Tola` : ''}
                </span>
              </div>
              <input
                id="old-gold-weight-input"
                type="number"
                step="any"
                value={oldGoldWeight}
                onChange={(e) => setOldGoldWeight(e.target.value)}
                placeholder="10.0"
                className="w-full px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-white font-black text-xl focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            {/* Deduction / Melting Loss % */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {lang === 'hi' ? 'गलान / टांके की अनुमानित कटौती (Melting / Solder Deduction %)' : 'Melting / Testing Deduction %'}
              </label>
              <div className="flex space-x-2">
                {['0', '1', '2', '3', '5'].map((d) => (
                  <button
                    key={d}
                    id={`deduction-btn-${d}`}
                    type="button"
                    onClick={() => setMeltingDeduction(d)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition backdrop-blur-sm ${
                      meltingDeduction === d
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {d}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'hi'
                  ? 'हॉलमार्क 916 आभूषणों पर आमतौर पर केवल 0% से 2% कटौती होती है, जबकि बिना हॉलमार्क वाले पुराने गहनों पर 3% से 5% तक कटता है।'
                  : 'Hallmarked 916 jewellery typically incurs 0-2% melting deduction, while non-hallmarked items may incur 3-5%.'}
              </p>
            </div>
          </div>

          {/* Standalone Exchange Result Card */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-emerald-400/40 p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-black text-emerald-400 text-sm">
                  {lang === 'hi' ? 'पुराना सोना वैल्यूएशन एस्टीमेट' : 'Old Gold Valuation Estimate'}
                </span>
                <span className="text-xs font-extrabold text-slate-200 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                  {oldGoldKarat.toUpperCase()} | {parsedOldWeight}g
                </span>
              </div>

              <div className="space-y-3 py-4 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>{lang === 'hi' ? '24K शुद्ध सोना भाव' : '24K Base Rate'}:</span>
                  <span className="font-semibold text-white">₹{Math.round(old24kRate).toLocaleString('en-IN')}/g</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{lang === 'hi' ? 'सकल मूल्य (Gross Value)' : 'Gross Valuation'}:</span>
                  <span className="font-bold text-white">₹{Math.round(grossOldGoldVal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>{lang === 'hi' ? 'गलान कटौती' : 'Deduction'} ({meltingDeduction}%):</span>
                  <span className="font-semibold">- ₹{deductionAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 backdrop-blur-md border border-emerald-400/40 text-center shadow-inner">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block">
                  {lang === 'hi' ? 'आपको मिलने वाली शुद्ध राशि' : 'Net Cash / Exchange Credit'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight block mt-1">
                  ₹{netOldGoldExchangeValue.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIncludeExchangeInBill(true);
                  setCalculatorTab('buy');
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-lg"
              >
                <span>{lang === 'hi' ? 'इसे नए जेवर बिल में घटाएं' : 'Apply to New Purchase Bill'}</span>
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
