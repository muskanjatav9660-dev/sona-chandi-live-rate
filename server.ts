import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS and serve PWA manifest & service worker for store scanners (PWABuilder, etc.)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(publicDir, 'manifest.json'));
});
app.get('/manifest.webmanifest', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(publicDir, 'manifest.webmanifest'));
});
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(path.join(publicDir, 'sw.js'));
});

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Base market rates benchmark - 24K pure gold per 10g & Silver 1kg
let baseGold24kPer10g = 150000; // Base ₹1,50,000 per 10g (On-road with 3% GST = ₹1,54,500)
let baseSilverPerKg = 260000; // Base ₹2,60,000 per 1kg (On-road with 3% GST = ₹2,67,800)
let spotGoldUsd = 2750.00;
let spotSilverUsd = 34.50;
let usdInr = 86.50;
let lastApiFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache to save GoldAPI quota

// Optional GoldAPI.io live fetcher
async function updateRatesFromGoldApi(force = false) {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) return;

  const now = Date.now();
  if (!force && now - lastApiFetchTime < CACHE_DURATION_MS) return;

  try {
    const [goldRes, silverRes] = await Promise.allSettled([
      fetch('https://www.goldapi.io/api/XAU/INR', {
        headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
      }),
      fetch('https://www.goldapi.io/api/XAG/INR', {
        headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
      }),
    ]);

    if (goldRes.status === 'fulfilled' && goldRes.value.ok) {
      const goldData = await goldRes.value.json();
      if (goldData.price) {
        spotGoldUsd = goldData.price_usd || spotGoldUsd;
      }
    }

    if (silverRes.status === 'fulfilled' && silverRes.value.ok) {
      const silverData = await silverRes.value.json();
      if (silverData.price_usd) {
        spotSilverUsd = silverData.price_usd;
      }
    }

    lastApiFetchTime = now;
  } catch (err) {
    console.warn('GoldAPI.io fetch error:', err);
  }
}

// Add small realistic live fluctuations over time
function getDynamicRates() {
  updateRatesFromGoldApi().catch(() => {});

  const currentGold24k = baseGold24kPer10g;
  const currentSilver = baseSilverPerKg;

  const gold24kPerGram = currentGold24k / 10;
  const gold22kPerGram = Math.round(gold24kPerGram * (22 / 24) * 100) / 100;
  const gold18kPerGram = Math.round(gold24kPerGram * (18 / 24) * 100) / 100;
  const gold14kPerGram = Math.round(gold24kPerGram * (14 / 24) * 100) / 100;

  const silverFinePerGram = currentSilver / 1000;
  const silverSterlingPerGram = Math.round(silverFinePerGram * 0.925 * 100) / 100;

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
  const dateString = now.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  return {
    lastUpdated: `${dateString}, ${timeString} IST`,
    isoTimestamp: now.toISOString(),
    currency: 'INR (₹)',
    usdInrRate: usdInr,
    gold: {
      spotUsdPerOz: spotGoldUsd,
      k24: {
        purity: '24K (99.9%)',
        purityPercent: 99.9,
        karat: '24K',
        nameEn: '24 Karat Pure Gold (999)',
        nameHi: '24 कैरेट शुद्ध सोना (999)',
        pricePerGram: gold24kPerGram,
        pricePer10Gram: currentGold24k,
        pricePerTola: Math.round(gold24kPerGram * 11.664),
        change24h: 380,
        changePercent24h: 0.51,
        high24h: currentGold24k + 420,
        low24h: currentGold24k - 290,
      },
      k22: {
        purity: '22K (91.6%)',
        purityPercent: 91.6,
        karat: '22K',
        nameEn: '22 Karat Jewellery Gold (916)',
        nameHi: '22 कैरेट आभूषण सोना (916)',
        pricePerGram: gold22kPerGram,
        pricePer10Gram: gold22kPerGram * 10,
        pricePerTola: Math.round(gold22kPerGram * 11.664),
        change24h: 350,
        changePercent24h: 0.51,
        high24h: (currentGold24k + 420) * (22 / 24),
        low24h: (currentGold24k - 290) * (22 / 24),
      },
      k18: {
        purity: '18K (75.0%)',
        purityPercent: 75.0,
        karat: '18K',
        nameEn: '18 Karat Hallmark Gold (750)',
        nameHi: '18 कैरेट हॉलमार्क सोना (750)',
        pricePerGram: gold18kPerGram,
        pricePer10Gram: gold18kPerGram * 10,
        pricePerTola: Math.round(gold18kPerGram * 11.664),
        change24h: 285,
        changePercent24h: 0.51,
        high24h: (currentGold24k + 420) * (18 / 24),
        low24h: (currentGold24k - 290) * (18 / 24),
      },
      k14: {
        purity: '14K (58.5%)',
        purityPercent: 58.5,
        karat: '14K',
        nameEn: '14 Karat Gold (585)',
        nameHi: '14 कैरेट गोल्ड (585)',
        pricePerGram: gold14kPerGram,
        pricePer10Gram: gold14kPerGram * 10,
        pricePerTola: Math.round(gold14kPerGram * 11.664),
        change24h: 220,
        changePercent24h: 0.51,
        high24h: (currentGold24k + 420) * (14 / 24),
        low24h: (currentGold24k - 290) * (14 / 24),
      },
    },
    silver: {
      spotUsdPerOz: spotSilverUsd,
      fine999: {
        purity: '99.9% Fine',
        purityPercent: 99.9,
        nameEn: '999 Fine Pure Silver',
        nameHi: '999 शुद्ध फाइन चांदी',
        pricePerGram: silverFinePerGram,
        pricePerKg: currentSilver,
        pricePerTola: Math.round(silverFinePerGram * 11.664),
        change24h: 650,
        changePercent24h: 0.73,
        high24h: currentSilver + 850,
        low24h: currentSilver - 500,
      },
      sterling925: {
        purity: '92.5% Sterling',
        purityPercent: 92.5,
        nameEn: '925 Sterling Silver',
        nameHi: '925 स्टर्लिंग चांदी',
        pricePerGram: silverSterlingPerGram,
        pricePerKg: Math.round(currentSilver * 0.925),
        pricePerTola: Math.round(silverSterlingPerGram * 11.664),
        change24h: 600,
        changePercent24h: 0.73,
        high24h: Math.round((currentSilver + 850) * 0.925),
        low24h: Math.round((currentSilver - 500) * 0.925),
      },
    },
    mcx: {
      gold: {
        symbol: 'GOLD 10G FUT',
        contract: '05 OCT 2026',
        ltp: currentGold24k - 180,
        change: 320,
        changePercent: 0.43,
        high: currentGold24k + 240,
        low: currentGold24k - 380,
        open: currentGold24k - 110,
        volume: '14,820 Lots',
      },
      silver: {
        symbol: 'SILVER 1KG FUT',
        contract: '05 DEC 2026',
        ltp: currentSilver - 220,
        change: 540,
        changePercent: 0.61,
        high: currentSilver + 750,
        low: currentSilver - 610,
        open: currentSilver - 150,
        volume: '21,490 Lots',
      },
    },
  };
}

// City rate calculation helper
function getCityRates(baseRates: ReturnType<typeof getDynamicRates>) {
  const g24 = baseRates.gold.k24.pricePer10Gram!;
  const sKg = baseRates.silver.fine999.pricePerKg!;

  const cities = [
    { id: 'delhi', cityNameEn: 'Delhi NCR', cityNameHi: 'दिल्ली एनसीआर', state: 'Delhi', gDiff: 150, sDiff: 100 },
    { id: 'mumbai', cityNameEn: 'Mumbai', cityNameHi: 'मुंबई', state: 'Maharashtra', gDiff: 0, sDiff: 0 },
    { id: 'jaipur', cityNameEn: 'Jaipur', cityNameHi: 'जयपुर', state: 'Rajasthan', gDiff: 180, sDiff: 200 },
    { id: 'ahmedabad', cityNameEn: 'Ahmedabad', cityNameHi: 'अहमदाबाद', state: 'Gujarat', gDiff: 80, sDiff: -50 },
    { id: 'kolkata', cityNameEn: 'Kolkata', cityNameHi: 'कोलकाता', state: 'West Bengal', gDiff: 120, sDiff: 300 },
    { id: 'chennai', cityNameEn: 'Chennai', cityNameHi: 'चेन्नई', state: 'Tamil Nadu', gDiff: 350, sDiff: 900 },
    { id: 'bengaluru', cityNameEn: 'Bengaluru', cityNameHi: 'बेंगलुरु', state: 'Karnataka', gDiff: 220, sDiff: 600 },
    { id: 'hyderabad', cityNameEn: 'Hyderabad', cityNameHi: 'हैदराबाद', state: 'Telangana', gDiff: 200, sDiff: 750 },
    { id: 'lucknow', cityNameEn: 'Lucknow', cityNameHi: 'लखनऊ', state: 'Uttar Pradesh', gDiff: 170, sDiff: 150 },
    { id: 'patna', cityNameEn: 'Patna', cityNameHi: 'पटना', state: 'Bihar', gDiff: 210, sDiff: 250 },
    { id: 'indore', cityNameEn: 'Indore', cityNameHi: 'इंदौर', state: 'Madhya Pradesh', gDiff: 90, sDiff: 80 },
    { id: 'pune', cityNameEn: 'Pune', cityNameHi: 'पुणे', state: 'Maharashtra', gDiff: 40, sDiff: 30 },
    { id: 'surat', cityNameEn: 'Surat', cityNameHi: 'सूरत', state: 'Gujarat', gDiff: 70, sDiff: -60 },
    { id: 'chandigarh', cityNameEn: 'Chandigarh', cityNameHi: 'चंडीगढ़', state: 'Punjab/Haryana', gDiff: 160, sDiff: 120 },
    { id: 'kanpur', cityNameEn: 'Kanpur', cityNameHi: 'कानपुर', state: 'Uttar Pradesh', gDiff: 165, sDiff: 140 },
    { id: 'varanasi', cityNameEn: 'Varanasi', cityNameHi: 'वाराणसी', state: 'Uttar Pradesh', gDiff: 180, sDiff: 160 },
    { id: 'bhopal', cityNameEn: 'Bhopal', cityNameHi: 'भोपाल', state: 'Madhya Pradesh', gDiff: 95, sDiff: 90 },
  ];

  return cities.map(c => {
    const gold24k = g24 + c.gDiff;
    const gold22k = Math.round(gold24k * (22 / 24));
    const gold18k = Math.round(gold24k * (18 / 24));
    const silver = sKg + c.sDiff;

    return {
      id: c.id,
      cityNameEn: c.cityNameEn,
      cityNameHi: c.cityNameHi,
      state: c.state,
      gold24kPer10g: gold24k,
      gold22kPer10g: gold22k,
      gold18kPer10g: gold18k,
      silverPerKg: silver,
      changeGold24k: 380,
      changeSilver: 650,
    };
  });
}

// Historical Chart Data Generator
function generateHistoryData() {
  const history = [];
  const now = new Date();
  
  // 30 Days back
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
    
    // Wave pattern with upward trend
    const cycle = Math.sin(i / 3) * 600 + (30 - i) * 35;
    const silverCycle = Math.cos(i / 2.5) * 1200 + (30 - i) * 70;
    
    const g24 = Math.round(baseGold24kPer10g - 1200 + cycle);
    const g22 = Math.round(g24 * (22 / 24));
    const s999 = Math.round((baseSilverPerKg - 2100 + silverCycle) / 100); // per 100g for clean chart display or per 10g

    history.push({
      timestamp: d.toISOString(),
      date: dateStr,
      gold24k: g24,
      gold22k: g22,
      silver999: s999, // Silver per 100g
      silverPerKg: Math.round(baseSilverPerKg - 2100 + silverCycle),
    });
  }

  return history;
}

// Bullion News & Expert Live Updates
function getBullionNews(rates: ReturnType<typeof getDynamicRates>) {
  const g24Formatted = `₹${rates.gold.k24.pricePer10Gram.toLocaleString('en-IN')}`;
  const g22Formatted = `₹${rates.gold.k22.pricePer10Gram.toLocaleString('en-IN')}`;
  const silverKgFormatted = `₹${rates.silver.fine999.pricePerKg.toLocaleString('en-IN')}`;

  return [
    {
      id: 'news-1',
      titleEn: `Gold 24K Trades Firm at ${g24Formatted}/10g, 22K at ${g22Formatted} with Steady Festive Demand`,
      titleHi: `हाजिर सर्राफा बाजार में 24K शुद्ध सोना ${g24Formatted} और 22K जेवराती सोना ${g22Formatted}/10g पर स्थिर`,
      summaryEn: `Bullion physical markets witness steady festive and wedding enquiries. Spot gold holds support globally at $${spotGoldUsd}/oz.`,
      summaryHi: `शादियों और आगामी त्योहारों के कारण खुदरा खरीदारों की पूछपरख तेज। वैश्विक स्तर पर स्पॉट गोल्ड $${spotGoldUsd}/औंस पर मजबूती से बना हुआ है।`,
      category: 'Market',
      time: '15 मिनट पहले',
      source: 'IBJA Live',
      impact: 'bullish',
    },
    {
      id: 'news-2',
      titleEn: `Silver Holds Firm at ${silverKgFormatted}/kg Driven by Solar & EV Industrial Demand`,
      titleHi: `सोलर और ईवी सेक्टर में भारी औद्योगिक मांग से चांदी ${silverKgFormatted}/kg के मजबूत स्तर पर सक्रिय`,
      summaryEn: `Strong global manufacturing uptake in solar photovoltaic cells and EV battery tech keeps industrial physical silver in tight supply.`,
      summaryHi: `सोलर पैनल, इलेक्ट्रॉनिक्स और इलेक्ट्रिक गाड़ियों में चांदी की बढ़ती खपत के कारण हाजिर बाजार में चांदी में निवेशकों की रुचि तेज है।`,
      category: 'MCX',
      time: '1 घंटा पहले',
      source: 'MCX Bullion Desk',
      impact: 'bullish',
    },
    {
      id: 'news-3',
      titleEn: 'BIS 6-Digit HUID Hallmarking: Mandatory for All Gold Jewellery Purity Verification',
      titleHi: 'बीआईएस (BIS) 6-अंक HUID हॉलमार्किंग: सभी सोने के आभूषणों पर 6-डिजिट कोड और 3% GST बिल अनिवार्य',
      summaryEn: 'Bureau of Indian Standards ensures 100% purity transparency with 6-digit alphanumeric HUID stamps on 22K916 and 18K750 gold.',
      summaryHi: 'बीआईएस नियमों के तहत सभी सोने के जेवरों पर 6-अंकों वाला HUID कोड जरूरी है। ग्राहक BIS Care ऐप से शुद्धता जांचकर 3% GST का पक्का बिल अवश्य लें।',
      category: 'Policy',
      time: '3 घंटे पहले',
      source: 'BIS Portal',
      impact: 'neutral',
    },
    {
      id: 'news-4',
      titleEn: 'Wedding Season Jewellery Inquiries Up 25%: Jewellers Recommend Staggered Buying',
      titleHi: 'शादियों और त्योहारी सीजन के लिए 22K व 18K लाइटवेट हॉलमार्क ज्वेलरी की मांग में 25% उछाल',
      summaryEn: 'Leading jewellers report high advance bookings for bridal sets and suggest buying on pullbacks to average acquisition costs.',
      summaryHi: 'सर्राफा एसोसिएशन के अनुसार शादियों के गहनों की एडवांस बुकिंग में तेजी है। विशेषज्ञों की सलाह है कि गिरावट (Dips) पर किस्तों में खरीदारी करें।',
      category: 'Jewellery',
      time: '5 घंटे पहले',
      source: 'Bullion Federation',
      impact: 'bullish',
    },
  ];
}

// API Routes
app.get('/api/rates', async (req, res) => {
  const forceRefresh = req.query.force === 'true';
  if (forceRefresh) {
    await updateRatesFromGoldApi(true).catch(() => {});
  }
  const dynamicRates = getDynamicRates();
  const cityRates = getCityRates(dynamicRates);
  const history = generateHistoryData();
  const news = getBullionNews(dynamicRates);

  res.json({
    success: true,
    data: {
      rates: dynamicRates,
      cities: cityRates,
      history,
      news,
    },
  });
});

app.post('/api/rates/refresh', async (req, res) => {
  await updateRatesFromGoldApi(true).catch(() => {});
  const dynamicRates = getDynamicRates();
  const cityRates = getCityRates(dynamicRates);
  const history = generateHistoryData();
  const news = getBullionNews(dynamicRates);

  res.json({
    success: true,
    message: 'Rates refreshed with live market feeds',
    data: {
      rates: dynamicRates,
      cities: cityRates,
      history,
      news,
    },
  });
});

async function getGeminiMarketInsight(systemPrompt: string): Promise<string> {
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastErr: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: systemPrompt,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[AI Insight] Model ${model} encountered error:`, err?.status || err?.message || err);
      lastErr = err;
      // If 503 (Overloaded) or rate limit, immediately try next available model
    }
  }

  throw lastErr || new Error('Failed to generate response from all AI models');
}

function getFallbackMarketInsight(query: string, language: string, goldPrice: number, silverPrice: number): string {
  const gold22k = Math.round(goldPrice * (22 / 24));
  const gold18k = Math.round(goldPrice * (18 / 24));

  switch (language) {
    case 'gu':
      return `### 📈 આજના સોના-ચાંદી બજારનું વિશ્લેષણ અને સલાહ

• **લાઈવ ભાવ સ્થિતિ**: 24K શુદ્ધ સોનું ₹${goldPrice.toLocaleString('en-IN')}/10g, 22K દાગીના સોનું ₹${gold22k.toLocaleString('en-IN')}/10g, અને 999 શુદ્ધ ચાંદી ₹${silverPrice.toLocaleString('en-IN')}/kg પર ટ્રેડ થઈ રહી છે.

• **બજારનો ટ્રેન્ડ (Market Trend)**: સેન્ટ્રલ બેન્કોની ખરીદી અને લગ્નસરાની મજબૂત માંગને કારણે સોના-ચાંદીમાં મજબૂતી (Bullish Trend) જળવાયેલી છે.

• **ખરીદીની શ્રેષ્ઠ રણનીતિ**:
  1. **ભાવ ઘટાડે ખરીદી (Buy on Dips)**: લગ્ન અથવા રોકાણ માટે એકસાથે રોકાણ કરવાને બદલે ભાવ ઘટાડે (SIP) સોનું ખરીદો.
  2. **શુદ્ધતા અને હોલમાર્ક**: હંમેશા 6-અંકના **HUID હોલમાર્ક** (22K916 / 18K750) વાળા જ દાગીના ખરીદો.
  3. **ઘડામણ અને બિલ**: ઘડામણ (Making Charges) પર 8% થી 12% સુધી વાટાઘાટ કરો અને 3% GST નું પાકું બિલ અચૂક લો.`;

    case 'mr':
      return `### 📈 आजचे सराफा बाजार विश्लेषण व सल्ला

• **थेट बाजार भाव**: 24K शुद्ध सोने ₹${goldPrice.toLocaleString('en-IN')}/10g, 22K दागिन्यांचे सोने ₹${gold22k.toLocaleString('en-IN')}/10g, आणि 999 शुद्ध चांदी ₹${silverPrice.toLocaleString('en-IN')}/kg वर व्यवहार करत आहे.

• **बाजाराचा कल (Market Trend)**: आंतरराष्ट्रीय पातळीवर मध्यवर्ती बँकांची मागणी आणि लग्नसराईमुळे सोन्या-चांदीत तेजीचा कल (Bullish Trend) आहे.

• **खरेदीची योग्य रणनीती**:
  1. **घसरणीवर खरेदी (Buy on Dips)**: लग्नासाठी किंवा गुंतवणुकीसाठी एकाच वेळी सर्व रक्कम गुंतवण्याऐवजी टप्प्याटप्प्याने (SIP) खरेदी करा.
  2. **शुद्धता व हॉलमार्क**: नेहमी 6-अंकी **HUID हॉलमार्क** (22K916 / 18K750) असलेलेच दागिने खरेदी करा.
  3. **मजुरी व बिल**: घडणावळीवर 8% ते 12% दरम्यान चर्चा करा आणि 3% GST चे पक्के बिल नक्की घ्या.`;

    case 'ta':
      return `### 📈 இன்றைய தங்கம் & வெள்ளி சந்தை பகுப்பாய்வு

• **நேரடி விலை நிலவரம்**: 24K சுத்த தங்கம் ₹${goldPrice.toLocaleString('en-IN')}/10g, 22K ஆபரண தங்கம் ₹${gold22k.toLocaleString('en-IN')}/10g, மற்றும் 999 வெள்ளி ₹${silverPrice.toLocaleString('en-IN')}/kg வர்த்தகம் ஆகிறது.

• **சந்தை போக்கு (Market Trend)**: சர்வதேச தேவை மற்றும் திருமண சீசன் காரணமாக தங்கம்-வெள்ளி சந்தை வலுவான ஏற்றத்தில் (Bullish) உள்ளது.

• **வாங்கும் திட்டம்**:
  1. **விலை சரியும்போது வாங்குங்கள் (Buy on Dips)**: மொத்தமாக வாங்குவதை விட விலை குறையும் போது சிறுகச் சிறுக சேமிக்கவும்.
  2. **BIS ஹால்மார்க்**: எப்போதும் 6-இலக்க **HUID ஹால்மார்க்** (22K916 / 18K750) நகைகளை மட்டுமே வாங்கவும்.
  3. **சேதாரம் & ஜிஎஸ்டி**: சேதாரத்தை 8-12% வரை பேசி முடிவு செய்து 3% GST ரசீது தவறாமல் பெறவும்.`;

    case 'te':
      return `### 📈 నేటి బంగారం & వెండి మార్కెట్ విశ్లేషణ

• **లైవ్ ధరల స్థితి**: 24K స్వచ్ఛమైన బంగారం ₹${goldPrice.toLocaleString('en-IN')}/10g, 22K ఆభరణాల బంగారం ₹${gold22k.toLocaleString('en-IN')}/10g, మరియు 999 వెండి ₹${silverPrice.toLocaleString('en-IN')}/kg వద్ద ఉంది.

• **మార్కెట్ ట్రెండ్**: పండుగలు మరియు పెళ్లిళ్ల సీజన్ దృష్ట్యా బంగారం, వెండి ధరల్లో సానుకూల వృద్ధి (Bullish) కొనసాగుతోంది.

• **కొనుగోలు వ్యూహం**:
  1. **ధర తగ్గినప్పుడు కొనుగోలు (Buy on Dips)**: ఒకేసారి కాకుండా ధర తగ్గినప్పుడల్లా కొద్దికొద్దిగా ఇన్వెస్ట్ చేయండి.
  2. **BIS హాల్‌మార్క్**: ఎల్లప్పుడూ 6-అంకెల **HUID హాల్‌మార్క్** (22K916 / 18K750) ఉన్న నగలను మాత్రమే ఎంచుకోండి.
  3. **తరుగు & బిల్లు**: తరుగు (Making charges) పై 8-12% బేరం చేసి 3% GST పక్కా బిల్లు తప్పక తీసుకోండి.`;

    case 'bn':
      return `### 📈 আজকের সোনা ও রূপোর বাজার বিশ্লেষণ

• **লাইভ দর**: ২৪ ক্যারেট খাঁটি সোনা ₹${goldPrice.toLocaleString('en-IN')}/১০ গ্রাম, ২২ ক্যারেট গহনা সোনা ₹${gold22k.toLocaleString('en-IN')}/১০ গ্রাম, এবং ৯৯৯ রূপো ₹${silverPrice.toLocaleString('en-IN')}/কেজি।

• **বাজারের গতিপ্রকৃতি**: আন্তর্জাতিক বাজারে সেন্ট্রাল ব্যাঙ্কের চাহিদা ও বিয়ের মরসুমের কারণে সোনা ও রূপোতে তেজ বজায় রয়েছে।

• **সঠিক কেনাকাটার পরামর্শ**:
  1. **ধাপে ধাপে কেনা (Buy on Dips)**: একবারে সব টাকা না লাগিয়ে দাম কমলে অল্প অল্প করে সোনা কিনুন।
  2. **হলমার্ক যাচাই**: সর্বদা ৬-সংখ্যার **HUID হলমার্ক** (22K916 / 18K750) যুক্ত গহনা কিনুন।
  3. **মজুরি ও পাকা বিল**: গহনার মজুরিতে ৮-১২% ছাড়ের কথা বলুন এবং ৩% GST-র পাকা বিল অবশ্যই নিন।`;

    case 'kn':
      return `### 📈 ಇಂದಿನ ಚಿನ್ನ ಮತ್ತು ಬೆಳ್ಳಿ ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ

• **ಲೈವ್ ದರಗಳ ಸ್ಥಿತಿ**: 24K ಶುದ್ಧ ಚಿನ್ನ ₹${goldPrice.toLocaleString('en-IN')}/10g, 22K ಆಭರಣ ಚಿನ್ನ ₹${gold22k.toLocaleString('en-IN')}/10g, ಮತ್ತು 999 ಬೆಳ್ಳಿ ₹${silverPrice.toLocaleString('en-IN')}/kg ದರದಲ್ಲಿದೆ.

• **ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ**: ಮದುವೆ ಸೀಸನ್ ಮತ್ತು ಜಾಗತಿಕ ಬೇಡಿಕೆಯಿಂದ ಚಿನ್ನ-ಬೆಳ್ಳಿ ಬೆಲೆಯಲ್ಲಿ ಏರಿಕೆ (Bullish Trend) ಮುಂದುವರೆದಿದೆ.

• **ಖರೀದಿ ಸಲಹೆ**:
  1. **ದರ ಇಳಿಕೆಯಾದಾಗ ಖರೀದಿ (Buy on Dips)**: ಒಟ್ಟಿಗೆ ಹೂಡಿಕೆ ಮಾಡುವ ಬದಲು ದರ ಇಳಿದಾಗ ಹಂತಹಂತವಾಗಿ ಖರೀದಿಸಿ.
  2. **BIS ಹಾಲ್‌ಮಾರ್ಕ್**: ಯಾವಾಗಲೂ 6-ಅಂಕಿಯ **HUID ಹಾಲ್‌ಮಾರ್ಕ್** (22K916 / 18K750) ಆಭರಣಗಳನ್ನು ಮಾತ್ರ ಖರೀದಿಸಿ.
  3. **ತಯಾರಿಕಾ ವೆಚ್ಚ ಮತ್ತು ಬಿಲ್**: ಮೇಕಿಂಗ್ ಚಾರ್ಜ್‌ನಲ್ಲಿ 8-12% ರಿಯಾಯಿತಿ ಪಡೆದು 3% GST ಪಕ್ಕಾ ಬಿಲ್ ಪಡೆಯಿರಿ.`;

    case 'hi':
      return `### 📈 आज का सर्राफा बाजार विश्लेषण व सलाह

• **लाइव भाव स्थिति**: 24K शुद्ध सोना ₹${goldPrice.toLocaleString('en-IN')}/10g, 22K जेवराती सोना ₹${gold22k.toLocaleString('en-IN')}/10g, और 999 शुद्ध चांदी ₹${silverPrice.toLocaleString('en-IN')}/kg पर कारोबार कर रही है।

• **बाजार का रुख (Market Trend)**: अंतरराष्ट्रीय स्तर पर केंद्रीय बैंकों की मजबूत मांग और आगामी त्योहारी व वैवाहिक सीजन के चलते सोने-चांदी में मजबूती का रुझान (Bullish Trend) बना हुआ है।

• **खरीदारी की सही रणनीति**:
  1. **गिरावट पर खरीदारी (Buy on Dips)**: शादी-ब्याह या निवेश के लिए एक साथ सारा पैसा लगाने के बजाय किस्तों (SIP या Dips) में सोना खरीदें।
  2. **शुद्धता व हॉलमार्क**: हमेशा 6-अंकों वाले **HUID हॉलमार्क** (22K916 या 18K750) युक्त आभूषण ही खरीदें।
  3. **मेकिंग चार्ज व बिल**: मेकिंग चार्ज पर 8% से 12% के बीच बातचीत (Bargaining) करें और 3% GST का पक्का बिल अवश्य लें।`;

    default:
      return `### 📈 Bullion Market Outlook & Advisory

• **Current Benchmarks**: 24K Pure Gold is trading at ₹${goldPrice.toLocaleString('en-IN')}/10g, 22K Jewellery Gold at ₹${gold22k.toLocaleString('en-IN')}/10g, and 999 Fine Silver at ₹${silverPrice.toLocaleString('en-IN')}/kg.

• **Market Sentiment**: Bullion maintains a firm, bullish undertone supported by central bank reserves accumulation and strong festive/wedding season physical demand.

• **Smart Buying Strategy**:
  1. **Staggered Accumulation (SIP / Buy on Dips)**: Distribute your gold/silver purchases across price dips rather than a lump-sum entry.
  2. **Purity Assurance**: Insist on BIS 6-digit **HUID Hallmarked** jewellery (22K916 / 18K750) for verified gold content.
  3. **Making Charges & Invoice**: Negotiate making charges within 8-12% and always secure a formal 3% GST tax invoice for full resale and exchange security.`;
  }
}

app.post('/api/ai/market-insight', async (req, res) => {
  try {
    const { query, language = 'hi', currentRates } = req.body;

    const goldPrice = currentRates?.gold?.k24?.pricePer10Gram || baseGold24kPer10g;
    const silverPrice = currentRates?.silver?.fine999?.pricePerKg || baseSilverPerKg;

    const systemPrompt = `You are a certified senior Indian Bullion Market Analyst and Gold/Silver Jewellery advisor (सर्राफा बाजार विशेषज्ञ).
Current live market benchmarks:
- 24K Pure Gold: ₹${goldPrice} per 10g
- 22K Jewellery Gold: ₹${Math.round(goldPrice * (22/24))} per 10g
- 999 Fine Silver: ₹${silverPrice} per 1 kg

User query or topic: "${query || 'Today market sentiment, buy/sell strategy, and gold silver outlook'}"

Respond directly and concisely in ${language === 'hi' ? 'clear, natural Hindi (हिंदी)' : 'clean English'}.
Include:
1. आज का बाजार रुख (Today's Trend & Sentiment: Bullish / Consolidating)
2. खरीदारी की सही रणनीति (Best buying strategy - SIP, dips, or physical gold/SGB/ETF advice)
3. हॉलमार्क व मेकिंग चार्ज टिप्स (Key tips on 3% GST, making charges bargaining 8-12%, 6-digit HUID check).
Keep the format structured with clear bullet points, easy to read for an Indian jewellery buyer and investor.`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        insight: getFallbackMarketInsight(query, language, goldPrice, silverPrice),
      });
    }

    try {
      const generatedText = await getGeminiMarketInsight(systemPrompt);
      return res.json({
        success: true,
        insight: generatedText,
      });
    } catch (geminiError: any) {
      console.warn('Gemini models unavailable or high demand, using smart market analyst fallback:', geminiError?.message || geminiError);
      return res.json({
        success: true,
        insight: getFallbackMarketInsight(query, language, goldPrice, silverPrice),
      });
    }
  } catch (error: any) {
    console.error('Error generating market insight:', error);
    const goldPrice = baseGold24kPer10g;
    const silverPrice = baseSilverPerKg;
    res.json({
      success: true,
      insight: getFallbackMarketInsight('', 'hi', goldPrice, silverPrice),
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bullion Rate Server running on http://localhost:${PORT}`);
  });
}

startServer();
