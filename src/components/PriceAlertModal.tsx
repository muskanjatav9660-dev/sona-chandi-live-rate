import React, { useState } from 'react';
import { X, Bell, Check, AlertCircle, ArrowUpRight, ArrowDownRight, Volume2 } from 'lucide-react';
import { BullionRates, Language } from '../types';
import { t } from '../i18n/translations';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: BullionRates;
  lang: Language;
}

interface AlertItem {
  id: string;
  metal: 'gold24k' | 'gold22k' | 'silver999';
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  rates,
  lang,
}) => {
  const [metal, setMetal] = useState<'gold24k' | 'gold22k' | 'silver999'>('gold24k');
  const [targetPrice, setTargetPrice] = useState<string>('74000');
  const [condition, setCondition] = useState<'above' | 'below'>('below');
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      metal: 'gold24k',
      targetPrice: 74000,
      condition: 'below',
      active: true,
    },
    {
      id: '2',
      metal: 'silver999',
      targetPrice: 90000,
      condition: 'above',
      active: true,
    },
  ]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const currentPrice =
    metal === 'gold24k'
      ? rates.gold.k24.pricePer10Gram!
      : metal === 'gold22k'
      ? rates.gold.k22.pricePer10Gram!
      : rates.silver.fine999.pricePerKg!;

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) return;

    const newAlert: AlertItem = {
      id: Date.now().toString(),
      metal,
      targetPrice: price,
      condition,
      active: true,
    };

    setAlerts([newAlert, ...alerts]);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-200">
        {/* Close */}
        <button
          id="close-alert-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 shadow-lg shadow-amber-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {lang === 'hi' ? 'सोना-चांदी लाइव रेट अलर्ट' : 'Set Bullion Price Alerts'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'hi'
                ? 'अपने मनपसंद भाव पर अलर्ट सेट करें और सही समय पर खरीदारी करें'
                : 'Get notified when rates hit your desired buying or selling target'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAddAlert} className="space-y-4">
          {/* Metal Select */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {lang === 'hi' ? 'धातु चुनें:' : 'Select Metal:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gold24k', label: '24K सोना (10g)' },
                { id: 'gold22k', label: '22K सोना (10g)' },
                { id: 'silver999', label: 'चांदी 999 (1kg)' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setMetal(m.id as any);
                    if (m.id === 'silver999') setTargetPrice('90000');
                    else if (m.id === 'gold22k') setTargetPrice('68000');
                    else setTargetPrice('74000');
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-extrabold transition text-center ${
                    metal === m.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-black/30 backdrop-blur-md text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Rate hint */}
          <div className="text-xs text-slate-400 flex items-center justify-between bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <span>{lang === 'hi' ? 'वर्तमान भाव (Current Live):' : 'Current Market Rate:'}</span>
            <strong className="text-amber-300 text-sm">₹{Math.round(currentPrice).toLocaleString('en-IN')}</strong>
          </div>

          {/* Condition and Target Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {lang === 'hi' ? 'शर्त:' : 'Condition:'}
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full bg-black/35 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400/70"
              >
                <option value="below" className="bg-slate-900 text-white">{lang === 'hi' ? 'से नीचे गिरे (≤ Drop below)' : 'Falls Below (≤)'}</option>
                <option value="above" className="bg-slate-900 text-white">{lang === 'hi' ? 'से ऊपर जाए (≥ Rise above)' : 'Rises Above (≥)'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {lang === 'hi' ? 'लक्षित मूल्य (₹):' : 'Target Price (₹):'}
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="₹"
                className="w-full bg-black/35 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400/70"
              />
            </div>
          </div>

          <button
            type="submit"
            id="set-alert-submit-btn"
            className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-amber-500/20"
          >
            {lang === 'hi' ? '+ अलर्ट सक्रिय करें' : '+ Activate Alert'}
          </button>
        </form>

        {showSuccessToast && (
          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{lang === 'hi' ? 'अलर्ट सफलतापूर्वक सेट कर दिया गया है!' : 'Alert saved successfully!'}</span>
          </div>
        )}

        {/* Existing Alerts */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-2">
            {lang === 'hi' ? 'सक्रिय अलर्ट्स:' : 'Active Alerts:'}
          </span>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 text-xs"
              >
                <div className="flex items-center space-x-2">
                  {al.condition === 'below' ? (
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    <strong className="text-white">
                      {al.metal === 'gold24k' ? '24K Gold' : al.metal === 'gold22k' ? '22K Gold' : 'Silver 999'}
                    </strong>{' '}
                    {al.condition === 'below' ? '≤' : '≥'} ₹{al.targetPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAlert(al.id)}
                  className="text-slate-400 hover:text-rose-400 transition text-[11px]"
                >
                  {lang === 'hi' ? 'हटाएं' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
