import React from 'react';
import { X, ShieldCheck, Award, CheckCircle, Scale, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { t } from '../i18n/translations';

interface PurityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PurityGuideModal: React.FC<PurityGuideModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          id="close-purity-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 font-black">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'hi' ? 'सोने-चांदी की शुद्धता व हॉलमार्किंग गाइड' : 'Purity & BIS Hallmarking Guide'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'hi' ? 'भारतीय मानक ब्यूरो (BIS) के नियम व कैरेट का पूरा गणित' : 'Understanding 24K, 22K, 18K purity & 6-digit HUID code'}
            </p>
          </div>
        </div>

        {/* BIS Hallmark Symbols Guide */}
        <div className="p-4 rounded-2xl bg-amber-400/10 backdrop-blur-md border border-amber-400/20 mb-6">
          <h4 className="font-extrabold text-amber-300 text-sm flex items-center space-x-2 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'hi' ? 'असली हॉलमार्क के 3 अनिवार्य निशान:' : '3 Mandatory BIS Hallmark Marks:'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
            <div className="bg-black/35 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">1. BIS त्रिकोण लोगो</span>
              <span className="text-slate-400">मानक ब्यूरो का आधिकारिक हॉलमार्क चिन्ह।</span>
            </div>
            <div className="bg-black/35 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">2. शुद्धता / कैरेट मार्क</span>
              <span className="text-slate-400">22K916, 18K750 या 14K585 लिखा होता है।</span>
            </div>
            <div className="bg-black/35 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold block mb-1">3. 6-अंक HUID कोड</span>
              <span className="text-slate-400">विशिष्ट पहचान कोड (BIS Care App पर चेक करें)।</span>
            </div>
          </div>
        </div>

        {/* Karat Comparison Table */}
        <h4 className="font-extrabold text-white text-sm mb-3">
          {lang === 'hi' ? 'कैरेट व शुद्धता का प्रतिशत चार्ट:' : 'Karat Purity Breakdown Table:'}
        </h4>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/50 text-slate-400 font-bold border-b border-white/10">
              <tr>
                <th className="p-3.5">कैरेट (Karat)</th>
                <th className="p-3.5">शुद्धता (Purity)</th>
                <th className="p-3.5">BIS मार्क</th>
                <th className="p-3.5">उपयोग (Best For)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              <tr>
                <td className="p-3.5 font-bold text-amber-300">24 Karat (24K)</td>
                <td className="p-3.5 font-semibold text-white">99.9% शुद्ध</td>
                <td className="p-3.5 font-mono text-amber-400 font-bold">999</td>
                <td className="p-3.5 text-slate-300">सोने के सिक्के, बार व निवेश</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-yellow-300">22 Karat (22K)</td>
                <td className="p-3.5 font-semibold text-white">91.6% सोना</td>
                <td className="p-3.5 font-mono text-yellow-300 font-bold">22K916</td>
                <td className="p-3.5 text-slate-300">पारंपरिक भारतीय शादी व भारी जेवर</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-amber-200">18 Karat (18K)</td>
                <td className="p-3.5 font-semibold text-white">75.0% सोना</td>
                <td className="p-3.5 font-mono text-amber-200 font-bold">18K750</td>
                <td className="p-3.5 text-slate-300">डायमंड व स्टडेड ज्वेलरी, मजबूत डिजाइन</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-300">14 Karat (14K)</td>
                <td className="p-3.5 font-semibold text-white">58.5% सोना</td>
                <td className="p-3.5 font-mono text-slate-300 font-bold">14K585</td>
                <td className="p-3.5 text-slate-300">दैनिक पहनने वाले किफायती जेवर</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Indian Bullion Weight Units Table */}
        <h4 className="font-extrabold text-white text-sm mb-3 flex items-center space-x-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <span>{lang === 'hi' ? 'भारतीय वजन इकाइयां (तोला, माशा, रत्ती):' : 'Indian Weight Measurement Units:'}</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10">
            <span className="text-amber-400 font-bold block">1 तोला (Tola)</span>
            <span className="text-slate-300 font-semibold">= 11.6638 ग्राम</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10">
            <span className="text-amber-400 font-bold block">1 पवन (Pawan)</span>
            <span className="text-slate-300 font-semibold">= 8.000 ग्राम</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10">
            <span className="text-amber-400 font-bold block">1 माशा (Masha)</span>
            <span className="text-slate-300 font-semibold">= 0.972 ग्राम</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10">
            <span className="text-amber-400 font-bold block">1 रत्ती (Ratti)</span>
            <span className="text-slate-300 font-semibold">= 0.1215 ग्राम</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            id="purity-modal-got-it"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
          >
            {lang === 'hi' ? 'समझ गया' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
