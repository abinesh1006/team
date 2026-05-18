import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calcFantasyPoints } from './scoring';
import { GroundView } from './GroundView';
import { ROLE_COLOR, ROLE_LABEL } from './constants';
import type { Dream11TeamSquad, IPLPlayer, PlayerPerformance } from '../../types';


const MEDAL_BG = ['#f59e0b','#94a3b8','#cd7c3e'];

export function FantasyLeaderboard({ squads, players, performances, teams }: {
  squads: Dream11TeamSquad[];
  players: IPLPlayer[];
  performances: PlayerPerformance[];
  teams: { id: string; name: string; color: string; emoji: string }[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const hasResults = performances.length > 0;

  const ranked = useMemo(() => squads.map(sq => {
    let total = 0;
    const breakdown = sq.squad.map(pid => {
      const player = players.find(p => p.id === pid);
      const perf = performances.find(p => p.playerId === pid);
      const isCap = sq.captain === pid;
      const isVC = sq.viceCaptain === pid;
      const pts = perf ? calcFantasyPoints(perf, isCap, isVC) : null;
      if (pts !== null) total += pts;
      return { player, pts, isCap, isVC };
    });
    return { ...sq, total, breakdown };
  }).sort((a, b) => b.total - a.total), [squads, players, performances]);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  return (
    <div className="space-y-3">
      {!hasResults && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <span className="text-2xl">🏏</span>
          <div>
            <div className="text-sm font-bold" style={{ color: '#f59e0b' }}>Results Pending</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Fantasy points will appear after match scores are uploaded.
            </div>
          </div>
        </div>
      )}

      {ranked.map((entry, idx) => {
        const team = getTeam(entry.teamId);
        const isExpanded = expanded === entry.teamId;
        const medalBg = MEDAL_BG[idx] ?? 'var(--bg-surface-2)';
        const isTop3 = idx < 3;

        return (
          <div key={entry.teamId} className="rounded-2xl overflow-hidden"
            style={{ border: `1.5px solid ${isTop3 && hasResults ? medalBg + '50' : 'var(--border)'}`, background: 'var(--bg-surface)' }}>

            {/* rank + team row */}
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              onClick={() => setExpanded(p => p === entry.teamId ? null : entry.teamId)}>

              {/* rank badge */}
              <div className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
                style={{ background: isTop3 ? medalBg : 'var(--bg-surface-2)', color: isTop3 ? '#fff' : 'var(--text-muted)' }}>
                {idx + 1}
              </div>

              {/* team emoji */}
              <div className="text-2xl flex-shrink-0">{team?.emoji ?? '🏏'}</div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                  {team?.name ?? entry.teamId}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  By {entry.submittedBy} ·{' '}
                  <span style={{ color: entry.status === 'submitted' || entry.status === 'locked' ? '#22c55e' : '#f59e0b' }}>
                    {entry.status}
                  </span>
                </div>
              </div>

              {/* score */}
              <div className="flex-shrink-0 text-right mr-2">
                {hasResults ? (
                  <>
                    <div className="text-xl font-black" style={{ color: isTop3 ? medalBg : '#1a9e5c' }}>
                      {entry.total.toFixed(1)}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>pts</div>
                  </>
                ) : (
                  <div className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>—</div>
                )}
              </div>

              {isExpanded
                ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
            </button>

            {/* expanded squad breakdown */}
            {isExpanded && (
              <div className="p-3 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                {entry.squad.length === 0 ? (
                  <p className="text-sm text-center py-5" style={{ color: 'var(--text-muted)' }}>
                    Squad not yet submitted.
                  </p>
                ) : (
                  <>
                    <GroundView
                      selectedPlayers={entry.breakdown.map(b => b.player).filter(Boolean) as IPLPlayer[]}
                      captain={entry.captain}
                      viceCaptain={entry.viceCaptain}
                    />
                    {hasResults && (
                      <div className="space-y-1">
                        {entry.breakdown.map(({ player, pts, isCap, isVC }) => player && (
                          <div key={player.id} className="flex items-center gap-2 px-2 py-1 rounded-lg"
                            style={{ background: 'var(--bg-surface-2)' }}>
                            <span className="text-[9px] font-black px-1 rounded text-white"
                              style={{ background: ROLE_COLOR[player.role] }}>{ROLE_LABEL[player.role]}</span>
                            <span className="flex-1 text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                              {player.name}
                            </span>
                            {isCap && <span className="text-[9px] font-black px-1 rounded text-white" style={{ background: '#f59e0b' }}>C</span>}
                            {isVC && <span className="text-[9px] font-black px-1 rounded text-white" style={{ background: '#8b5cf6' }}>VC</span>}
                            <span className="text-xs font-black w-10 text-right" style={{ color: pts !== null ? '#1a9e5c' : 'var(--text-muted)' }}>
                              {pts !== null ? pts : '—'}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-2 py-2"
                          style={{ borderTop: '1px solid var(--border)' }}>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Total</span>
                          <span className="text-lg font-black" style={{ color: '#1a9e5c' }}>{entry.total.toFixed(1)} pts</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
