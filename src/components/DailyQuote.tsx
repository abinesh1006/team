import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface Quote {
  type: 'motivation' | 'scold';
  text: string;
}

function getQuoteIndexForToday(quotes: Quote[]): number {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = (hash * 31 + today.charCodeAt(i)) & 0xffffffff;
  return Math.abs(hash) % quotes.length;
}

export default function DailyQuote({ quotes }: { quotes: Quote[] }) {
  const [visible, setVisible] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => getQuoteIndexForToday(quotes));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = () => {
    if (quotes.length <= 1) return;
    let next = quoteIndex;
    while (next === quoteIndex) next = Math.floor(Math.random() * quotes.length);
    setQuoteIndex(next);
  };

  if (!visible || !quotes.length) return null;

  const quote = quotes[quoteIndex];
  const icon = quote.type === 'motivation' ? '✨' : '🔥';

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <span className="text-base shrink-0">{icon}</span>
      <p className="flex-1 min-w-0 text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
        {quote.text}
      </p>
      <button
        onClick={handleRefresh}
        aria-label="Refresh quote"
        className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
        style={{ color: 'var(--text-muted)' }}
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
