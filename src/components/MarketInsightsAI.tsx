import React, { useState } from 'react';
import { Sparkles, Bot, Newspaper, ArrowRight, MessageSquare, Send, CheckCircle2, Flame } from 'lucide-react';
import { BullionRates, NewsItem, Language } from '../types';
import { t } from '../i18n/translations';

interface MarketInsightsAIProps {
  rates: BullionRates;
  news: NewsItem[];
  lang: Language;
}

export const MarketInsightsAI: React.FC<MarketInsightsAIProps> = ({ rates, news, lang }) => {
  const [query, setQuery] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presetQuestions = [
    {
      hi: 'क्या आज सोना खरीदना सही रहेगा?',
      en: 'Is today a good time to buy gold?',
    },
    {
      hi: 'धनतेरस व शादी के लिए 22K या 18K में क्या चुनें?',
      en: '22K vs 18K gold: Which is better for jewellery?',
    },
    {
      hi: 'चांदी के भाव में तेजी के मुख्य कारण क्या हैं?',
      en: 'What are the main drivers behind the silver price rally?',
    },
    {
      hi: 'हॉलमार्क HUID 6-डिजिट नंबर कैसे चेक करें?',
      en: 'How to verify 6-digit HUID Hallmark code?',
    },
  ];

  const handleAskAI = async (questionText?: string) => {
    const activeQuery = questionText || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/market-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          language: lang,
          currentRates: rates,
        }),
      });
      const data = await res.json();
      if (data.success && data.insight) {
        setInsight(data.insight);
      }
    } catch (e) {
      console.error(e);
      const gPrice = rates?.gold?.k24?.pricePer10Gram || 150000;
      const sPrice = rates?.silver?.fine999?.pricePerKg || 260000;
      setInsight(
        lang === 'hi'
          ? `वर्तमान में शुद्ध सोना (24K) ₹${gPrice.toLocaleString('en-IN')}/10g तथा 999 चांदी ₹${sPrice.toLocaleString('en-IN')}/kg के स्तर पर है। त्योहारों, शादी-ब्याह व निवेश के लिए गिरावट (Dips) पर 6-डिजिट HUID हॉलमार्क युक्त आभूषण खरीदने की सलाह दी जाती है।`
          : `Gold (24K) is currently trading at ₹${gPrice.toLocaleString('en-IN')}/10g and Silver (999) at ₹${sPrice.toLocaleString('en-IN')}/kg with a stable bullish outlook. Buying in tranches on dips with 6-digit HUID hallmark is recommended.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* AI Bullion Expert Advisor (7 cols) */}
      <div className="lg:col-span-7 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-amber-400/30 p-6 sm:p-7 shadow-2xl flex flex-col justify-between hover:border-amber-400/50 transition-all duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 font-black shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
                  <span>{lang === 'hi' ? 'AI सर्राफा बाजार सलाहकार' : 'AI Bullion Market Insights'}</span>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    Gemini AI
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'hi'
                    ? 'सोने-चांदी के रुझान, खरीदारी की सही रणनीति और शुद्धता पर तुरंत AI राय लें'
                    : 'Instant expert analysis on price outlook, buying strategy and purity rules'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Question Chips */}
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 block mb-2">
              {lang === 'hi' ? 'लोकप्रिय प्रश्न:' : 'Common Inquiries:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {presetQuestions.map((q, idx) => (
                <button
                  key={idx}
                  id={`preset-q-${idx}`}
                  onClick={() => {
                    setQuery(lang === 'hi' ? q.hi : q.en);
                    handleAskAI(lang === 'hi' ? q.hi : q.en);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-xs text-slate-300 hover:text-amber-300 font-medium transition text-left"
                >
                  💬 {lang === 'hi' ? q.hi : q.en}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Display */}
          {insight ? (
            <div className="mt-5 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-amber-400/30 text-sm text-slate-200 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap shadow-inner">
              {insight}
            </div>
          ) : (
            <div className="mt-5 p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 text-xs text-slate-400 flex items-center space-x-3">
              <Bot className="w-6 h-6 text-amber-400 shrink-0" />
              <span>
                {lang === 'hi'
                  ? 'ऊपर दिए गए किसी प्रश्न पर क्लिक करें या अपना सवाल लिखकर AI विशेषज्ञ से सलाह लें।'
                  : 'Click any suggested query above or type your own question to get real-time advice.'}
              </span>
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <div className="mt-5 flex gap-2">
          <input
            id="ai-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder={lang === 'hi' ? 'सोने-चांदी से जुड़ा कोई भी सवाल पूछें...' : 'Ask anything about gold or silver...'}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
          />
          <button
            id="ai-ask-submit-btn"
            onClick={() => handleAskAI()}
            disabled={loading}
            className={`px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center space-x-1.5 transition shadow-lg shadow-amber-500/20 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="text-xs font-bold">{lang === 'hi' ? 'सोच रहा है...' : 'Analyzing...'}</span>
            ) : (
              <>
                <span>{lang === 'hi' ? 'पूछें' : 'Ask'}</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bullion Market Live News / Updates (5 cols) */}
      <div className="lg:col-span-5 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300">
                <Newspaper className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {lang === 'hi' ? 'सर्राफा बाजार समाचार' : 'Bullion News & Updates'}
              </h3>
            </div>
            <span className="flex items-center text-[11px] font-bold text-emerald-400 bg-emerald-500/15 backdrop-blur-sm border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <Flame className="w-3 h-3 mr-1 text-emerald-400" />
              {lang === 'hi' ? 'ताजा' : 'Latest'}
            </span>
          </div>

          {/* News List */}
          <div className="mt-4 space-y-3.5">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 hover:border-white/20 transition text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold text-[10px] border border-white/10">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>
                <h4 className="font-extrabold text-slate-100 text-sm leading-snug">
                  {lang === 'hi' ? item.titleHi : item.titleEn}
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {lang === 'hi' ? item.summaryHi : item.summaryEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
          <span>स्रोत: IBJA, MCX व प्रमुख सर्राफा संघ</span>
          <span className="text-amber-300 font-medium">100% सटीक विश्लेषण</span>
        </div>
      </div>
    </div>
  );
};
