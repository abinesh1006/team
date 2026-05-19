import { useMemo, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAllRoundsSquads } from '../../hooks/useData';
import { calcFantasyPoints } from './scoring';
import type { Dream11Round, PlayerPerformance, Dream11Scoring } from '../../types';

const MEDAL_BG = ['#f59e0b', '#94a3b8', '#cd7c3e'];
const BASE = import.meta.env.BASE_URL;
const ROUND_CONTEST_PTS = [40, 25, 15, 5];

/* ── fetch scores for all rounds ── */
function useAllRoundScores(rounds: Dream11Round[]) {
  const [scores, setScores] = useState<Record<string, PlayerPerformance[]>>({});

  useEffect(() => {
    Promise.all(
      rounds.map(r =>
        fetch(`${BASE}${r.scoresCSV}`)
          .then(res => { if (!res.ok) throw new Error('not found'); return res.text(); })
          .then(text => {
            const [headerLine, ...rows] = text.trim().split('\n');
            if (!headerLine) return { id: r.id, perfs: [] as PlayerPerformance[] };
            const headers = headerLine.split(',').map(h => h.trim());
            const perfs: PlayerPerformance[] = rows.filter(row => row.trim()).map(row => {
              const vals = row.split(',').map(v => v.trim());
              const get = (k: string) => vals[headers.indexOf(k)] ?? '';
              const num = (k: string) => { const v = get(k); return v === '' ? undefined : Number(v); };
              const bool = (k: string) => get(k) === 'true' ? true : get(k) === 'false' ? false : undefined;
              const p: PlayerPerformance = { playerId: get('playerId') };
              const runs = num('runs'); if (runs !== undefined) p.runs = runs;
              const fours = num('fours'); if (fours !== undefined) p.fours = fours;
              const sixes = num('sixes'); if (sixes !== undefined) p.sixes = sixes;
              const isDuck = bool('isDuck'); if (isDuck !== undefined) p.isDuck = isDuck;
              const wickets = num('wickets'); if (wickets !== undefined) p.wickets = wickets;
              const maidens = num('maidens'); if (maidens !== undefined) p.maidens = maidens;
              const lbwBowled = bool('lbwBowled'); if (lbwBowled !== undefined) p.lbwBowled = lbwBowled;
              const catches = num('catches'); if (catches !== undefined) p.catches = catches;
              const stumpings = num('stumpings'); if (stumpings !== undefined) p.stumpings = stumpings;
              const runOutDirect = num('runOutDirect'); if (runOutDirect !== undefined) p.runOutDirect = runOutDirect;
              const runOutIndirect = num('runOutIndirect'); if (runOutIndirect !== undefined) p.runOutIndirect = runOutIndirect;
              return p;
            }).filter(p => p.playerId);
            return { id: r.id, perfs };
          })
          .catch(() => ({ id: r.id, perfs: [] as PlayerPerformance[] }))
      )
    ).then(results => {
      const map: Record<string, PlayerPerformance[]> = {};
      for (const { id, perfs } of results) map[id] = perfs;
      setScores(map);
    });
  }, [rounds.map(r => r.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return scores;
}

function calcRoundTotal(
  squad: string[],
  captain: string | null,
  viceCaptain: string | null,
  performances: PlayerPerformance[],
): number {
  return squad.reduce((sum, pid) => {
    const perf = performances.find(p => p.playerId === pid);
    if (!perf) return sum;
    return sum + calcFantasyPoints(perf, captain === pid, viceCaptain === pid);
  }, 0);
}

/* ── Scoring Rules Popup ── */
function ScoringPopup({ scoring, onClose }: { scoring: Dream11Scoring; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="font-black text-base" style={{ color: 'var(--text-primary)' }}>📊 Scoring Rules</div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 grid gap-3 sm:grid-cols-2">
          {[
            { label: '🏏 Batting', items: scoring.batting },
            { label: '🎯 Bowling', items: scoring.bowling },
            { label: '🧤 Fielding', items: scoring.fielding },
            { label: '⚡ Multipliers', items: scoring.multipliers },
          ].map(({ label, items }) => (
            <div key={label} className="rounded-xl p-3"
              style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-black mb-2" style={{ color: 'var(--text-primary)' }}>{label}</div>
              <div className="space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{item.action}</span>
                    <span className="text-[11px] font-bold rounded px-1.5 py-0.5 flex-shrink-0"
                      style={{
                        color: item.points < 0 ? '#ef4444' : '#1a9e5c',
                        background: item.points < 0 ? '#ef444415' : '#1a9e5c15',
                      }}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="font-bold" style={{ color: 'var(--text-primary)' }}>🏅 Contest Points (per round)</div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[['1st', '40'], ['2nd', '25'], ['3rd', '15'], ['4th+', '5']].map(([pos, pts]) => (
              <div key={pos} className="rounded-lg py-2" style={{ background: 'var(--bg-surface-2)' }}>
                <div className="font-black" style={{ color: 'var(--text-primary)' }}>{pts}</div>
                <div>{pos}</div>
              </div>
            ))}
          </div>
          <div className="pt-1">
            Overall = sum of all round contest points. Tie-breaker: higher captain fantasy points.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Per-Round Rankings ── */
function RoundRankings({ roundId, squadsForRound, allScores, teams }: {
  roundId: string;
  squadsForRound: { teamId: string; squad: string[]; captain: string | null; viceCaptain: string | null }[];
  allScores: Record<string, PlayerPerformance[]>;
  teams: { id: string; name: string; color: string; emoji: string }[];
}) {
  const performances = allScores[roundId] ?? [];
  const hasResults = performances.length > 0;

  const ranked = useMemo(() => squadsForRound.map(sq => ({
    ...sq,
    total: hasResults ? calcRoundTotal(sq.squad, sq.captain, sq.viceCaptain, performances) : 0,
  })).sort((a, b) => b.total - a.total), [squadsForRound, performances, hasResults]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  if (!hasResults) {
    return (
      <div className="rounded-xl p-6 text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-3xl mb-2">⏳</div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Results pending</div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Scores will appear after the match.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ranked.map((entry, idx) => {
        const team = getTeam(entry.teamId);
        const isTop3 = idx < 3;
        const medalBg = MEDAL_BG[idx] ?? 'var(--bg-surface-2)';
        return (
          <div key={entry.teamId} className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: 'var(--bg-surface)',
              border: `1.5px solid ${isTop3 ? medalBg + '50' : 'var(--border)'}`,
            }}>
            <div className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
              style={{ background: isTop3 ? medalBg : 'var(--bg-surface-2)', color: isTop3 ? '#fff' : 'var(--text-muted)' }}>
              {idx + 1}
            </div>
            <div className="text-xl flex-shrink-0">{team?.emoji ?? '🏏'}</div>
            <div className="flex-1 text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              {team?.name ?? entry.teamId}
            </div>
            <div className="text-right">
              <div className="text-lg font-black" style={{ color: isTop3 ? medalBg : '#1a9e5c' }}>
                {entry.total.toFixed(1)}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>pts</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Overall Rankings ── */
function OverallRankings({ rounds, allSquads, allScores, teams }: {
  rounds: Dream11Round[];
  allSquads: Record<string, { teamId: string; squad: string[]; captain: string | null; viceCaptain: string | null }[]>;
  allScores: Record<string, PlayerPerformance[]>;
  teams: { id: string; name: string; color: string; emoji: string }[];
}) {
  const teamIds = useMemo(() => teams.map(t => t.id), [teams]);
  const anyResults = rounds.some(r => (allScores[r.id] ?? []).length > 0);

  const overall = useMemo(() => teamIds.map(teamId => {
    let totalContestPts = 0;
    let totalFantasyPts = 0;
    const byRound: Record<string, number> = {};

    for (const round of rounds) {
      const perfs = allScores[round.id] ?? [];
      if (!perfs.length) { byRound[round.id] = 0; continue; }

      const squads = allSquads[round.id] ?? [];
      const ranked = squads.map(sq => ({
        teamId: sq.teamId,
        total: calcRoundTotal(sq.squad, sq.captain, sq.viceCaptain, perfs),
      })).sort((a, b) => b.total - a.total);

      const myIdx = ranked.findIndex(r => r.teamId === teamId);
      const contestPts = myIdx >= 0 ? (ROUND_CONTEST_PTS[myIdx] ?? ROUND_CONTEST_PTS[ROUND_CONTEST_PTS.length - 1]) : 0;
      const fantasyPts = myIdx >= 0 ? ranked[myIdx].total : 0;

      totalContestPts += contestPts;
      totalFantasyPts += fantasyPts;
      byRound[round.id] = fantasyPts;
    }

    return { teamId, totalContestPts, totalFantasyPts, byRound };
  }).sort((a, b) => b.totalContestPts - a.totalContestPts || b.totalFantasyPts - a.totalFantasyPts),
    [teamIds, rounds, allSquads, allScores]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  if (!anyResults) {
    return (
      <div className="rounded-xl p-6 text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-3xl mb-2">🏆</div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Overall standings will appear after the first match.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {overall.map((entry, idx) => {
        const team = getTeam(entry.teamId);
        const isTop3 = idx < 3;
        const medalBg = MEDAL_BG[idx] ?? 'var(--bg-surface-2)';
        return (
          <div key={entry.teamId} className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: `1.5px solid ${isTop3 ? medalBg + '50' : 'var(--border)'}`,
            }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
                style={{ background: isTop3 ? medalBg : 'var(--bg-surface-2)', color: isTop3 ? '#fff' : 'var(--text-muted)' }}>
                {idx + 1}
              </div>
              <div className="text-xl flex-shrink-0">{team?.emoji ?? '🏏'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                  {team?.name ?? entry.teamId}
                </div>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  {rounds.map(r => {
                    const hasScore = (allScores[r.id] ?? []).length > 0;
                    return (
                      <span key={r.id} className="text-[10px] font-semibold"
                        style={{ color: hasScore ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {r.label}: {hasScore ? entry.byRound[r.id].toFixed(1) : '—'}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black" style={{ color: isTop3 ? medalBg : '#1a9e5c' }}>
                  {entry.totalContestPts}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>contest pts</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Results component ── */
type ResultsView = 'round' | 'overall';

export function Results({ rounds, activeRoundId, teams, scoring }: {
  rounds: Dream11Round[];
  activeRoundId: string;
  teams: { id: string; name: string; color: string; emoji: string }[];
  scoring: Dream11Scoring;
}) {
  const [view, setView] = useState<ResultsView>('round');
  const [showScoring, setShowScoring] = useState(false);

  const teamIds = useMemo(() => teams.map(t => t.id), [teams]);
  const roundIds = useMemo(() => rounds.map(r => r.id), [rounds]);

  const allScores = useAllRoundScores(rounds);
  const rawAllSquads = useAllRoundsSquads(roundIds, teamIds);

  /* shape squads into the format used by sub-components */
  const allSquads = useMemo(() => {
    const result: Record<string, { teamId: string; squad: string[]; captain: string | null; viceCaptain: string | null }[]> = {};
    for (const roundId of roundIds) {
      const csvByTeam = rawAllSquads[roundId] ?? {};
      result[roundId] = teamIds.map(teamId => {
        const csv = csvByTeam[teamId];
        const hasSquad = csv && csv.filter(r => r.id.trim()).length >= 11;
        return {
          teamId,
          squad: hasSquad ? csv.map(r => r.id) : [],
          captain: hasSquad ? (csv.find(r => r.isCaptain)?.id ?? null) : null,
          viceCaptain: hasSquad ? (csv.find(r => r.isViceCaptain)?.id ?? null) : null,
        };
      });
    }
    return result;
  }, [rawAllSquads, roundIds, teamIds]);

  return (
    <div className="space-y-4">
      {/* view switcher + scoring rules button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <button
            onClick={() => setView('round')}
            className="px-4 py-2 text-xs font-black transition-colors"
            style={{
              background: view === 'round' ? '#1a9e5c' : 'transparent',
              color: view === 'round' ? '#fff' : 'var(--text-muted)',
            }}>
            By Round
          </button>
          <button
            onClick={() => setView('overall')}
            className="px-4 py-2 text-xs font-black transition-colors"
            style={{
              background: view === 'overall' ? '#1a9e5c' : 'transparent',
              color: view === 'overall' ? '#fff' : 'var(--text-muted)',
            }}>
            Overall
          </button>
        </div>
        <button
          onClick={() => setShowScoring(true)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          📊 Scoring Rules
        </button>
      </div>

      {view === 'round' && (
        <RoundRankings
          roundId={activeRoundId}
          squadsForRound={allSquads[activeRoundId] ?? []}
          allScores={allScores}
          teams={teams}
        />
      )}

      {view === 'overall' && (
        <OverallRankings
          rounds={rounds}
          allSquads={allSquads}
          allScores={allScores}
          teams={teams}
        />
      )}

      {showScoring && (
        <ScoringPopup scoring={scoring} onClose={() => setShowScoring(false)} />
      )}
    </div>
  );
}
