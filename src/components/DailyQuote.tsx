import { useEffect, useState } from 'react';

interface Quote {
  type: 'motivation' | 'scold';
  text: string;
}

const STORAGE_KEY = 'pv_daily_quote_date';

function getQuoteForToday(quotes: Quote[]): Quote {
  const today = new Date().toISOString().slice(0, 10);
  // Deterministic index based on date so everyone sees the same quote
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = (hash * 31 + today.charCodeAt(i)) & 0xffffffff;
  return quotes[Math.abs(hash) % quotes.length];
}

export default function DailyQuote({ quotes }: { quotes: Quote[] }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== today) {
      // New day — show it
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, today);
    setDismissed(true);
    setTimeout(() => setVisible(false), 350);
  };

  if (!visible || !quotes.length) return null;

  const quote = getQuoteForToday(quotes);
  const isScold = quote.type === 'scold';

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-2xl"
      style={{
        border: `1px solid ${isScold ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
        background: isScold
          ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.04) 100%)'
          : 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.04) 100%)',
        opacity: dismissed ? 0 : 1,
        transform: dismissed ? 'translateY(-8px)' : 'none',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        animation: 'quoteSlide 0.5s cubic-bezier(0.16,1,0.3,1) both',
      }}>
      <style>{`
        @keyframes quoteSlide {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="flex items-start gap-4 px-5 py-4">
        {/* Icon */}
        <div
          className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-lg"
          style={{
            background: isScold ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
          }}>
          {isScold ? '⚡' : '🌟'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className="mb-0.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: isScold ? '#f87171' : '#4ade80' }}>
            {isScold ? 'Mission Alert' : 'Daily Motivation'}
          </div>
          <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {quote.text}
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10 text-slate-500 hover:text-slate-300 text-xs font-bold">
          ✕
        </button>
      </div>

      {/* Accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ background: isScold ? '#ef4444' : '#22c55e' }} />
    </div>
  );
}
