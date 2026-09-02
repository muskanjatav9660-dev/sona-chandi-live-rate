import React, { useState } from 'react';
import { MapPin, Search, ArrowUpDown, Building2, Check, Sparkles } from 'lucide-react';
import { CityRate, Language } from '../types';
import { t } from '../i18n/translations';

interface CityRatesSectionProps {
  cities: CityRate[];
  lang: Language;
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
}

export const CityRatesSection: React.FC<CityRatesSectionProps> = ({
  cities,
  lang,
  selectedCityId,
  onSelectCity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'gold24k' | 'gold22k' | 'silver'>('all');

  const filteredCities = cities.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      c.cityNameEn.toLowerCase().includes(term) ||
      c.cityNameHi.includes(term) ||
      c.state.toLowerCase().includes(term)
    );
  });

  return (
    <section className="my-8 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 shadow-lg shadow-amber-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'hi' ? 'प्रमुख शहरों में सोने-चांदी के आज के भाव' : 'City-Wise Gold & Silver Live Rates'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {lang === 'hi'
                  ? 'दिल्ली, मुंबई, जयपुर, कोलकाता, चेन्नई सहित विभिन्न शहरों के सर्राफा बाजार रेट'
                  : 'Compare live bullion market rates across Delhi, Mumbai, Jaipur, Chennai & more'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="city-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'hi' ? 'शहर खोजें (उदा. Jaipur, Delhi)...' : 'Search city (e.g. Jaipur, Delhi)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 transition"
          />
        </div>
      </div>

      {/* Quick City Highlight Pills */}
      <div className="mt-4 flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0">
          {lang === 'hi' ? 'पसंदीदा शहर:' : 'Popular Cities:'}
        </span>
        {['delhi', 'mumbai', 'jaipur', 'ahmedabad', 'kolkata', 'chennai', 'lucknow', 'bengaluru'].map((cId) => {
          const city = cities.find((c) => c.id === cId);
          if (!city) return null;
          const isSelected = selectedCityId === cId;
          return (
            <button
              key={cId}
              id={`quick-city-${cId}`}
              onClick={() => onSelectCity(cId)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition shrink-0 flex items-center space-x-1 backdrop-blur-sm ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              <span>{lang === 'hi' ? city.cityNameHi : city.cityNameEn}</span>
              {isSelected && <Check className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>

      {/* City Rates Responsive Table / Grid */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-black/50 text-xs uppercase font-extrabold text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-4 px-4 sm:px-6">{lang === 'hi' ? 'शहर (City)' : 'City / State'}</th>
                <th className="py-4 px-4 text-right text-amber-300">24K सोना (10g)</th>
                <th className="py-4 px-4 text-right text-yellow-300">22K सोना (10g)</th>
                <th className="py-4 px-4 text-right text-amber-200 hidden md:table-cell">18K सोना (10g)</th>
                <th className="py-4 px-4 sm:px-6 text-right text-slate-200">चांदी 999 (1kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {lang === 'hi' ? 'कोई शहर नहीं मिला।' : 'No matching cities found.'}
                  </td>
                </tr>
              ) : (
                filteredCities.map((city) => {
                  const isSelected = selectedCityId === city.id;
                  return (
                    <tr
                      key={city.id}
                      onClick={() => onSelectCity(city.id)}
                      className={`cursor-pointer transition duration-150 hover:bg-white/[0.08] ${
                        isSelected ? 'bg-amber-400/15 font-bold border-l-4 border-amber-400' : ''
                      }`}
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-2.5">
                          <Building2 className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                          <div>
                            <div className="font-extrabold text-white text-sm sm:text-base">
                              {lang === 'hi' ? city.cityNameHi : city.cityNameEn}
                            </div>
                            <div className="text-[11px] text-slate-400">{city.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-amber-300">
                        ₹{city.gold24kPer10g.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-yellow-300">
                        ₹{city.gold22kPer10g.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-300 hidden md:table-cell">
                        ₹{city.gold18kPer10g.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right font-extrabold text-slate-200">
                        ₹{city.silverPerKg.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-slate-400">
        <span>* {lang === 'hi' ? 'भाव बिना 3% जीएसटी और मेकिंग चार्ज के हैं।' : 'Rates exclude 3% GST and jeweller making charges.'}</span>
        <span className="text-amber-300/80">{lang === 'hi' ? 'शहर पर क्लिक करके उस शहर का भाव चुनें' : 'Click any city row to select for calculator'}</span>
      </div>
    </section>
  );
};
