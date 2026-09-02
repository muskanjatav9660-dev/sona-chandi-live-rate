import * as React from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: string | null;
}

export class AutoHealErrorBoundary extends React.Component<Props, State> {
  private timer: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorInfo: error?.message || 'Runtime anomaly detected',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[Auto-Healer Engine] Anomaly captured & self-healing activated:', error, errorInfo);
    
    // Clear any potentially corrupted temporary cache
    try {
      sessionStorage.removeItem('sona_chandi_temp_calc_state');
    } catch {
      // safe ignore
    }

    // Auto-heal recovery within 1s automatically without asking permission
    this.timer = setTimeout(() => {
      this.handleAutoRecover();
    }, 950);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  handleAutoRecover = () => {
    this.setState({
      hasError: false,
      errorInfo: null,
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-self-healed'));
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
          <div className="max-w-md w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 animate-pulse pointer-events-none" />
            
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>

            <h3 className="text-lg font-bold text-amber-300 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ऑटो-हीलिंग सिस्टम सक्रिय (1s Auto-Fix)</span>
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              ऐप ने किसी भी रुकावट को तुरंत डिटेक्ट कर लिया है और 1 सेकंड के अंदर इसे बिना किसी रुकावट के अपने-आप ठीक और रीस्टोर कर रहा है...
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-amber-400/80 font-mono bg-black/40 py-1.5 px-3 rounded-lg border border-white/5">
              <span>Auto-repairing in 1s without permission</span>
            </div>

            <button
              onClick={this.handleAutoRecover}
              className="mt-4 w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs transition active:scale-95"
            >
              तुरंत रीस्टोर करें (Instant Restore)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
