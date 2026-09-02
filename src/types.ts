export type Language = 'hi' | 'en' | 'gu' | 'mr' | 'ta' | 'te' | 'bn' | 'kn';

export interface MetalPriceItem {
  purity: string;
  purityPercent: number;
  karat?: string;
  nameEn: string;
  nameHi: string;
  pricePerGram: number;
  pricePer10Gram?: number;
  pricePerKg?: number;
  pricePerTola: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
}

export interface BullionRates {
  lastUpdated: string;
  currency: string;
  usdInrRate: number;
  gold: {
    spotUsdPerOz: number;
    k24: MetalPriceItem;
    k22: MetalPriceItem;
    k18: MetalPriceItem;
    k14: MetalPriceItem;
  };
  silver: {
    spotUsdPerOz: number;
    fine999: MetalPriceItem;
    sterling925: MetalPriceItem;
  };
  mcx: {
    gold: {
      symbol: string;
      contract: string;
      ltp: number; // Last Traded Price per 10g
      change: number;
      changePercent: number;
      high: number;
      low: number;
      open: number;
      volume: string;
    };
    silver: {
      symbol: string;
      contract: string;
      ltp: number; // Last Traded Price per 1kg
      change: number;
      changePercent: number;
      high: number;
      low: number;
      open: number;
      volume: string;
    };
  };
}

export interface CityRate {
  id: string;
  cityNameEn: string;
  cityNameHi: string;
  state: string;
  gold24kPer10g: number;
  gold22kPer10g: number;
  gold18kPer10g: number;
  silverPerKg: number;
  changeGold24k: number;
  changeSilver: number;
}

export interface PriceHistoryPoint {
  timestamp: string;
  date: string;
  gold24k: number;
  gold22k: number;
  silver999: number;
}

export interface NewsItem {
  id: string;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  category: 'MCX' | 'Policy' | 'Market' | 'Jewellery';
  time: string;
  source: string;
  impact: 'bullish' | 'bearish' | 'neutral';
}

export interface CalculationResult {
  metalType: 'gold' | 'silver';
  purity: string;
  weightGrams: number;
  ratePerGram: number;
  baseMetalCost: number;
  makingChargesRate: number;
  makingChargesType: 'percent' | 'flat';
  makingChargesAmount: number;
  subtotal: number;
  gstRate: number; // 3%
  gstAmount: number;
  hallmarkFee: number; // 45 per article
  totalCost: number;
}

export interface SavedBillEstimate {
  id: string;
  title: string;
  metal: 'gold' | 'silver';
  purity: string;
  weightGrams: number;
  makingCharges: string;
  gstAmount: number;
  totalPrice: number;
  cityName: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  role: 'buyer' | 'jeweller' | 'investor';
  shopName?: string;
  gstNumber?: string;
  preferredLanguage: Language;
  termsAcceptedAt?: string;
  isLoggedIn: boolean;
  savedEstimates: SavedBillEstimate[];
}

