import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, LineChart, Calendar, BarChart2 } from 'lucide-react';
import { PriceHistoryPoint, Language } from '../types';
import { t } from '../i18n/translations';

interface RateChartSectionProps {
  history: PriceHistoryPoint[];
  lang: Language;
}

export const RateChartSection: React.FC<RateChartSectionProps> = ({ history, lang }) => {
  const [selectedMetal, setSelectedMetal] = useState<'gold24k' | 'gold22k' | 'silver999'>('gold24k');
  const [timeRange, setTimeRange] = useState<'7d' | '15d' | '30d'>('30d');

  // Filter history based on timeRange
  const getFilteredData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '15d' ? 15 : 30;
    return history.slice(-days);
  };

  const filteredData = getFilteredData();

  // Metrics calculation
  const values = filteredData.map((d) => (selectedMetal === 'silver999' ? (d as any).silverPerKg || d.silver999 * 100 : d[selectedMetal]));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const startVal = values[0];
  const endVal = values[values.length - 1];
  const changeVal = endVal - startVal;
  const changePct = startVal > 0 ? ((changeVal / startVal) * 100).toFixed(2) : '0';

  const chartColor =
    selectedMetal === 'gold24k'
      ? '#f59e0b'
      : selectedMetal === 'gold22k'
      ? '#eab308'
      : '#94a3b8';

  const formatChartYAxis = (tick: number) => {
    if (tick >= 1000) {
      return `₹${Math.round(tick / 1000)}k`;
    }
    return `₹${tick}`;
  };

  return (
    <section className="my-8 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 shadow-lg shadow-amber-500/20">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'hi' ? 'सोने और चांदी का ऐतिहासिक भाव चार्ट' : 'Bullion Historical Price Trends & Charts'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {lang === 'hi' ? 'पिछले 30 दिनों में कीमतों में उतार-चढ़ाव का विश्लेषण' : 'Track daily price momentum and historical high/low ranges'}
              </p>
            </div>
          </div>
        </div>

        {/* Metal & Time Range Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metal Toggle */}
          <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs font-bold">
            <button
              id="chart-metal-24k"
              onClick={() => setSelectedMetal('gold24k')}
              className={`px-3 py-1 rounded-full transition ${
                selectedMetal === 'gold24k' ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              24K सोना
            </button>
            <button
              id="chart-metal-22k"
              onClick={() => setSelectedMetal('gold22k')}
              className={`px-3 py-1 rounded-full transition ${
                selectedMetal === 'gold22k' ? 'bg-yellow-400 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              22K जेवर
            </button>
            <button
              id="chart-metal-silver"
              onClick={() => setSelectedMetal('silver999')}
              className={`px-3 py-1 rounded-full transition ${
                selectedMetal === 'silver999' ? 'bg-slate-200 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              चांदी 1kg
            </button>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs font-bold">
            {(['7d', '15d', '30d'] as const).map((r) => (
              <button
                key={r}
                id={`chart-range-${r}`}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-full transition ${
                  timeRange === r ? 'bg-white/20 text-white shadow-sm font-extrabold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <span className="text-[11px] text-slate-400 block">{lang === 'hi' ? 'अवधि में न्यूनतम' : 'Period Low'}</span>
          <span className="text-base sm:text-lg font-black text-slate-200">
            ₹{minVal.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <span className="text-[11px] text-slate-400 block">{lang === 'hi' ? 'अवधि में उच्चतम' : 'Period High'}</span>
          <span className="text-base sm:text-lg font-black text-amber-300">
            ₹{maxVal.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <span className="text-[11px] text-slate-400 block">{lang === 'hi' ? 'कुल बदलाव' : 'Net Change'}</span>
          <span className={`text-base sm:text-lg font-black ${changeVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {changeVal >= 0 ? '+' : ''}₹{changeVal.toLocaleString('en-IN')} ({changePct}%)
          </span>
        </div>
        <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <span className="text-[11px] text-slate-400 block">{lang === 'hi' ? 'रुझान' : 'Trend'}</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-400" />
            {lang === 'hi' ? 'मजबूत (तेजी)' : 'Bullish'}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="metalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              domain={['auto', 'auto']}
              tickFormatter={formatChartYAxis}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload as PriceHistoryPoint;
                  const currentVal = selectedMetal === 'silver999' ? (dataPoint as any).silverPerKg || dataPoint.silver999 * 100 : dataPoint[selectedMetal];
                  return (
                    <div className="bg-slate-950/90 backdrop-blur-xl border border-amber-400/40 p-3 rounded-2xl shadow-2xl text-xs space-y-1">
                      <div className="text-slate-400 font-medium">{dataPoint.date}</div>
                      <div className="text-base font-black text-amber-300">
                        ₹{currentVal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedMetal === 'silver999' ? 'प्रति 1 किग्रा चांदी' : 'प्रति 10 ग्राम सोना'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={selectedMetal === 'silver999' ? 'silverPerKg' : selectedMetal}
              stroke={chartColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#metalGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
