import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../../../hooks/useData';

const BASE = import.meta.env.BASE_URL;

interface Fixture {
  id: string; round: number; label: string;
  player1: string; team1: string;
  player2: string; team2: string;
  date: string; time: string;
  winner: string; result: string;
}

const TEAM_EMOJI: Record<string, string> = {
  'team-alpha': '🔴', 'team-beta': '🔵',
  'team-gamma': '🟢', 'team-delta': '🟡',
};

function useFixtures(path: string) {
  const [data, setData] = useState<Fixture[] | null>(null);
  useMemo(() => {
    fetch(`${BASE}${path}`, { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        const [header, ...rows] = text.trim().split('\n');
        const headers = header.split(',').map(h => h.trim());
        const get = (vals: string[], k: string) => vals[headers.indexOf(k)]?.trim() ?? '';
        setData(rows.filter(r => r.trim()).map(row => {
          const vals = row.split(',').map(v => v.trim());
          return {
            id: get(vals, 'id'), round: Number(get(vals, 'round')), label: get(vals, 'label'),
            player1: get(vals, 'player1'), team1: get(vals, 'team1'),
            player2: get(vals, 'player2'), team2: get(vals, 'team2'),
            date: get(vals, 'date'), time: get(vals, 'time'),
            winner: get(vals, 'winner'), result: get(vals, 'result'),
          };
        }));
      }).catch(() => setData([]));
  }, [path]);
  return data;
}

export default function Chess() {
  const navigate = useNavigate();
  const { data: games } = useGames();
  const fixtures = useFixtures('data/chess_fixtures.csv');
  const [tab, setTab] = useState<'fixtures' | 'rules'>('fixtures');

  const game = games?.find(g => g.id === 'chess');
  const rounds = useMemo(() => {
    if (!fixtures) return [];
    const map = new Map<string, Fixture[]>();
    for (const f of fixtures) {
      if (!map.has(f.label)) map.set(f.label, []);
      map.get(f.label)!.push(f);
    }
    return [...map.entries()];
  }, [fixtures]);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-muted)' }}>←</button>
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(255,255,255,0.08)' }}>♟️</div>
        <div>
          <h1 className="text-xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>Chess</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Swiss Rapid · 4 Rounds</p>
        </div>
      </div>

      {/* tab bar */}
      <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'var(--bg-surface)' }}>
        {(['fixtures', 'rules'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 rounded-xl py-2 text-xs font-black capitalize transition-all"
            style={{ background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {t === 'fixtures' ? '📅 Fixtures' : '📋 Rules'}
          </button>
        ))}
      </div>

      {/* fixtures */}
      {tab === 'fixtures' && (
        <div className="space-y-4">
          {fixtures === null && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          )}
          {rounds.map(([label, matches]) => (
            <div key={label}>
              <div className="text-xs font-black uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
              <div className="space-y-2">
                {matches.map(m => {
                  const isDone = !!m.winner;
                  return (
                    <div key={m.id} className="rounded-2xl overflow-hidden"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5"
                            style={{ background: isDone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)', color: isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {isDone ? '✓ Done' : `${m.date} · ${m.time}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* player 1 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span>{TEAM_EMOJI[m.team1] ?? '🏆'}</span>
                              <span className="text-sm font-black truncate"
                                style={{ color: m.winner === 'player1' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: m.winner === 'player1' ? 900 : 600 }}>
                                {m.player1}
                              </span>
                            </div>
                          </div>
                          {/* vs / result */}
                          <div className="flex-shrink-0 text-center px-2">
                            {isDone && m.result ? (
                              <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{m.result}</div>
                            ) : (
                              <div className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>VS</div>
                            )}
                          </div>
                          {/* player 2 */}
                          <div className="flex-1 min-w-0 text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-sm font-black truncate"
                                style={{ color: m.winner === 'player2' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: m.winner === 'player2' ? 900 : 600 }}>
                                {m.player2}
                              </span>
                              <span>{TEAM_EMOJI[m.team2] ?? '🏆'}</span>
                            </div>
                          </div>
                        </div>
                        {m.winner === 'draw' && (
                          <div className="text-center text-xs mt-1 font-bold" style={{ color: 'var(--text-muted)' }}>Draw</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* rules */}
      {tab === 'rules' && game && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Points System</div>
            <div className="space-y-2">
              {game.pointsSystem.individual?.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.position}</span>
                  <span className="text-sm font-black px-2 py-0.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>+{p.points}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Rules</div>
            <ol className="space-y-2">
              {game.rules.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-black flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
