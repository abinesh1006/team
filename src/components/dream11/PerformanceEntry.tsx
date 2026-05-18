import { useMemo, useState, type ChangeEvent } from 'react';
import { RoleBadge } from './atoms';
import { calcFantasyPoints } from './scoring';
import type { IPLPlayer, PlayerPerformance } from '../../types';

export function PerformanceEntry({ players }: { players: IPLPlayer[] }) {
  const [sel, setSel] = useState('');
  const [perf, setPerf] = useState<Partial<PlayerPerformance>>({});
  const [entries, setEntries] = useState<PlayerPerformance[]>([]);

  const f = (key: keyof PlayerPerformance) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
    setPerf(p => ({ ...p, [key]: v }));
  };

  const player = players.find(p => p.id === sel);

  const preview = useMemo(() => {
    if (!sel || !Object.keys(perf).length) return null;
    return calcFantasyPoints({ playerId: sel, ...perf }, false, false);
  }, [sel, perf]);

  const add = () => {
    if (!sel) return;
    const entry: PlayerPerformance = { playerId: sel, ...perf };
    setEntries(prev => {
      const i = prev.findIndex(e => e.playerId === sel);
      if (i >= 0) { const u = [...prev]; u[i] = entry; return u; }
      return [...prev, entry];
    });
    setPerf({}); setSel('');
  };

  const exportCsv = () => {
    const cols = ['playerId','runs','fours','sixes','isDuck','wickets','maidens','lbwBowled','catches','stumpings','runOutDirect','runOutIndirect'];
    const rows = entries.map(e => cols.map(c => (e as unknown as Record<string, unknown>)[c] ?? '').join(','));
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'scores.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const iplTeams = [...new Set(players.map(p => p.iplTeam))];

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 pv-surface space-y-3">
        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>⚡ Enter Match Performances</div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Fill in stats per player → Export CSV → place in <code>public/data/dream11/[round]/scores.csv</code> → commit &amp; push.
        </p>

        <select value={sel} onChange={e => setSel(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">Select player…</option>
          {iplTeams.map(t => (
            <optgroup key={t} label={t}>
              {players.filter(p => p.iplTeam === t).map(pl => (
                <option key={pl.id} value={pl.id}>{pl.name} ({pl.role.toUpperCase()})</option>
              ))}
            </optgroup>
          ))}
        </select>

        {sel && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {player && player.role !== 'bowl' && (
              <>
                {[['Runs','runs'],['Fours','fours'],['Sixes','sixes']].map(([l,k]) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <input type="number" min={0} value={(perf as Record<string,unknown>)[k] as number ?? ''}
                      onChange={f(k as keyof PlayerPerformance)}
                      className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                      style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={perf.isDuck ?? false} onChange={f('isDuck')} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Duck</span>
                </label>
              </>
            )}
            {player && (player.role === 'bowl' || player.role === 'ar') && (
              <>
                {[['Wickets','wickets'],['Maidens','maidens']].map(([l,k]) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <input type="number" min={0} value={(perf as Record<string,unknown>)[k] as number ?? ''}
                      onChange={f(k as keyof PlayerPerformance)}
                      className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                      style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={perf.lbwBowled ?? false} onChange={f('lbwBowled')} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>LBW/Bowled</span>
                </label>
              </>
            )}
            <label className="space-y-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Catches</span>
              <input type="number" min={0} value={perf.catches ?? ''}
                onChange={f('catches')}
                className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </label>
            {player?.role === 'wk' && (
              <label className="space-y-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stumpings</span>
                <input type="number" min={0} value={perf.stumpings ?? ''}
                  onChange={f('stumpings')}
                  className="w-full rounded-lg px-2.5 py-1.5 text-sm outline-none"
                  style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </label>
            )}
          </div>
        )}

        {preview !== null && (
          <div className="rounded-lg px-3 py-2 flex items-center justify-between text-sm"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)40' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Base pts (no C/VC)</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>{preview} pts</span>
          </div>
        )}

        <button onClick={add} disabled={!sel}
          className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          Add / Update
        </button>
      </div>

      {entries.length > 0 && (
        <div className="rounded-xl pv-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Performances ({entries.length})</div>
            <button onClick={exportCsv}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              Export CSV
            </button>
          </div>
          {entries.map(e => {
            const pl = players.find(p => p.id === e.playerId);
            const pts = calcFantasyPoints(e, false, false);
            return (
              <div key={e.playerId} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {pl && <RoleBadge role={pl.role} small />}
                  <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{pl?.name}</span>
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{pts} pts</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
