import { useEffect, useState } from 'react';
import { RefreshCw, User as UserIcon } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface Quote {
  type: 'motivation' | 'scold';
  text: string;
}

function getQuoteIndexForToday(quotes: Quote[]): number {
  const today = new Date().toISOString().slice(0, 10);
  // Deterministic index based on date so everyone sees the same quote
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = (hash * 31 + today.charCodeAt(i)) & 0xffffffff;
  return Math.abs(hash) % quotes.length;
}

function formatTeamName(teamId: string) {
  return teamId
    .replace(/^team[-_]/i, '')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function DailyQuote({ quotes }: { quotes: Quote[] }) {
  const user = useUser();
  const [visible, setVisible] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => getQuoteIndexForToday(quotes));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = () => {
    if (!quotes.length) return;
    let nextIndex = quoteIndex;
    if (quotes.length === 1) return;
    while (nextIndex === quoteIndex) {
      nextIndex = Math.floor(Math.random() * quotes.length);
    }
    setQuoteIndex(nextIndex);
  };

  if (!visible || !quotes.length) return null;

  const quote = quotes[quoteIndex];

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-950 dark:shadow-slate-950/30">
      <div className="grid gap-2 px-3 py-3 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-center">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              {formatTeamName(user.team)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-sm leading-6 text-slate-800 dark:text-slate-100">
              <span className="text-xl leading-none text-slate-400 dark:text-slate-500">“</span>
              {quote.text}
              <span className="text-xl leading-none text-slate-400 dark:text-slate-500">”</span>
            </p>
            <button
              onClick={handleRefresh}
              aria-label="Refresh quote"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
