import React, { useState } from 'react';
import { X, ShieldAlert, Scale, FileText, Lock, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { t } from '../i18n/translations';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'privacy' | 'terms'>('disclaimer');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900/95 border border-white/15 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'hi' ? 'गोपनीयता नीति व कानूनी अस्वीकरण' : 'Privacy Policy & Legal Disclaimer'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'hi' ? 'केवल सामान्य जानकारी एवं सूचना के उद्देश्य से' : 'Exclusively for Information & Reference Only'}
              </p>
            </div>
          </div>
          <button
            id="close-terms-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-slate-950/30 px-5 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            id="tab-disclaimer-btn"
            onClick={() => setActiveTab('disclaimer')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'disclaimer'
                ? 'border-rose-400 text-rose-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'hi' ? 'न्यायालय / कानूनी अस्वीकरण' : 'Legal & Court Disclaimer'}</span>
          </button>

          <button
            id="tab-privacy-btn"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>{lang === 'hi' ? 'गोपनीयता नीति (Privacy)' : 'Privacy Policy'}</span>
          </button>

          <button
            id="tab-terms-btn"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'hi' ? 'नियम व शर्तें (Terms)' : 'Terms of Use'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed custom-scrollbar">
          
          {/* TAB 1: STRICT COURT & LEGAL DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Highlight Box */}
              <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-bold">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>
                    {lang === 'hi'
                      ? 'स्पष्ट अस्वीकरण: किसी भी कोर्ट केस या कानूनी विवाद के लिए अमान्य'
                      : 'Non-Admissibility in Courts & Legal Disputes'}
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 font-medium">
                  {lang === 'hi'
                    ? '⚠️ यह एप्लिकेशन और इसमें प्रदर्शित कोई भी भाव, तालिका, अनुमान, पर्ची या चार्ट केवल "सामान्य जानकारी (Informational Purpose Only)" के लिए है। इसका उपयोग किसी भी अदालत, कोर्ट केस, पुलिस शिकायत, उपभोक्ता फोरम, मध्यस्थता या कानूनी विवाद में साक्ष्य (Legal Evidence) के रूप में नहीं किया जा सकता है।'
                    : '⚠️ All data, bullion spot rates, invoices, estimations, and analytics presented in this application are strictly for general information and educational reference only. They are NOT legally binding and CANNOT be used as legal proof or admissible evidence in any court of law, police inquiry, arbitration, or consumer dispute.'}
                </p>
              </div>

              <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'hi' ? 'वित्तीय व कानूनी गैर-उत्तरदायित्व' : 'No Financial or Legal Liability'}</span>
                </h4>
                <p className="text-slate-300">
                  {lang === 'hi'
                    ? '1. सोने और चांदी के भाव वास्तविक समय में बाजार की मांग और आपूर्ति पर बदलते रहते हैं। इस ऐप में दिखाए जाने वाले भाव सांकेतिक (Indicative Benchmarks) हैं।'
                    : '1. Spot prices fluctuate dynamically based on market demand and supply. All rates in this application represent indicative benchmarks.'}
                </p>
                <p className="text-slate-300">
                  {lang === 'hi'
                    ? '2. किसी भी प्रकार की भौतिक सोने-चांदी की खरीद-फरोख्त या लेन-देन से पूर्व अपने स्थानीय अधिकृत ज्वेलर या बुलियन डीलर से अंतिम दर की पुष्टि अवश्य करें।'
                    : '2. Always verify official billing rates with your certified local jeweller or bullion merchant before finalizing transactions.'}
                </p>
                <p className="text-slate-300">
                  {lang === 'hi'
                    ? '3. ऐप का निर्माता या डेवलपर किसी भी वित्तीय हानि, लेन-देन में अंतर, व्यावसायिक विवाद या निवेश निर्णयों के लिए प्रत्यक्ष या अप्रत्यक्ष रूप से जिम्मेदार नहीं होगा।'
                    : '3. The creators and developers of this application assume no financial, operational, or legal liability for any trade decisions, variances, or disputes.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-2xl bg-sky-500/10 border border-sky-500/20 p-4">
                <div className="flex items-center space-x-2 text-sky-400 font-bold mb-1.5">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>{lang === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'User Privacy & Data Protection'}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {lang === 'hi'
                    ? 'आपकी निजता हमारे लिए सर्वोपरि है। यह ऐप पूरी तरह सुरक्षित है और आपके किसी भी संवेदनशील निजी या वित्तीय डेटा को एकत्रित नहीं करता।'
                    : 'Your privacy is paramount. This application is built with a zero-tracking philosophy and does not harvest sensitive personal or financial credentials.'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <p className="font-semibold text-white">🔒 {lang === 'hi' ? '1. नो पर्सनल डेटा कलेक्शन (No Data Harvest)' : '1. No Personal Data Collection'}</p>
                  <p className="text-slate-400">
                    {lang === 'hi'
                      ? 'हम आपका नाम, फोन नंबर, ईमेल, आधार कार्ड, बैंक खाता या कोई भी व्यक्तिगत पहचान पत्र स्टोर नहीं करते हैं।'
                      : 'We do not collect or store your name, phone number, email address, Aadhaar details, or banking information.'}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <p className="font-semibold text-white">💾 {lang === 'hi' ? '2. लोकल डिवाइस स्टोरेज (Local Storage Only)' : '2. Client-Side Local Storage'}</p>
                  <p className="text-slate-400">
                    {lang === 'hi'
                      ? 'आपके द्वारा चुने गए भाषा विकल्प, पसंदीदा शहर या कैलकुलेटर में दर्ज किए गए अनुमान केवल आपके फोन/ब्राउज़र की लोकल मेमोरी में रहते हैं।'
                      : 'Your language preferences, selected cities, and bill estimations remain strictly stored in your local browser cache.'}
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <p className="font-semibold text-white">🛡️ {lang === 'hi' ? '3. थर्ड-पार्टी शेयरिंग शून्य' : '3. Zero Third-Party Sharing'}</p>
                  <p className="text-slate-400">
                    {lang === 'hi'
                      ? 'हम आपका कोई भी डेटा किसी विज्ञापन कंपनी, ब्रोकर या बाहरी पार्टी को न तो बेचते हैं और न ही साझा करते हैं।'
                      : 'No user calculations or interaction metrics are sold, traded, or shared with third-party advertisers or brokers.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS OF USE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-center space-x-2 text-amber-400 font-bold mb-1.5">
                  <FileText className="w-5 h-5 shrink-0" />
                  <span>{lang === 'hi' ? 'उपयोग के नियम (Terms of Use)' : 'Standard Bullion Terms'}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {lang === 'hi'
                    ? 'ऐप का उपयोग करते समय भारतीय मानक ब्यूरो (BIS) और GST नियमों की सामान्य समझ आवश्यक है।'
                    : 'Usage of bullion estimations requires adherence to Bureau of Indian Standards (BIS) and GST Council regulations.'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-2.5 p-3 bg-white/5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{lang === 'hi' ? 'BIS HUID हॉलमार्किंग:' : 'BIS HUID Hallmarking:'}</strong>{' '}
                    <span className="text-slate-400">
                      {lang === 'hi'
                        ? 'भारत में 24K, 22K और 18K सोने के आभूषण 6-अंकीय HUID नंबर के साथ ही प्रमाणित होते हैं।'
                        : 'Official gold jewellery in India is legally authenticated with 6-digit alphanumeric HUID stamps.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-3 bg-white/5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{lang === 'hi' ? '3% वस्तु एवं सेवा कर (GST):' : '3% GST Rate:'}</strong>{' '}
                    <span className="text-slate-400">
                      {lang === 'hi'
                        ? 'सोने और चांदी के कुल धातु मूल्य + मेकिंग चार्ज पर 3% GST (1.5% CGST + 1.5% SGST) अनिवार्य है।'
                        : 'Standard 3% GST (1.5% CGST + 1.5% SGST) is statutory on total metal cost plus craftsmanship fees.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 p-3 bg-white/5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{lang === 'hi' ? 'मेकिंग चार्ज व स्थानीय टैक्स:' : 'Making Charges & Regional Rates:'}</strong>{' '}
                    <span className="text-slate-400">
                      {lang === 'hi'
                        ? 'विभिन्न शहरों में ट्रांसपोर्टेशन व स्थानीय एसोसिएशन के अनुसार ₹100 से ₹500 तक का सामान्य अंतर हो सकता है।'
                        : 'Regional rates may exhibit minor variances based on local jeweller association premiums and transport freight.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {lang === 'hi' ? 'केवल सूचनात्मक उपयोग हेतु • साक्ष्य मान्य नहीं' : 'For Informational Use Only • Not Legal Proof'}
          </p>
          <button
            id="accept-terms-btn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-400/20"
          >
            {lang === 'hi' ? 'मैं सहमत हूँ (Got it)' : 'I Understand & Agree'}
          </button>
        </div>
      </div>
    </div>
  );
};
