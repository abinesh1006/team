import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calcFantasyPoints } from './scoring';
import { GroundView } from './GroundView';
import { ROLE_COLOR, ROLE_LABEL } from './constants';
import type { Dream11TeamSquad, IPLPlayer, PlayerPerformance } from '../../types';

const MEDAL = ['#f59e0b', '#94a3b8', '#cd7c3e'];

export function AllSubmissions({ squads, players, performances, teams, myTeamId }: {
  squads: Dream11TeamSquad[];
  players: IPLPlayer[];
  performances: PlayerPerformance[];
  teams: { id: string; name: string; color: string; emoji: string }[];
  myTeamId: string;
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

  const pendingCount = ranked.filter(e => e.status !== 'submitted').length;
  const getTeam = (id: string) => teams.find(t => t.id === id);

  return (
    <div className="space-y-2">
      {/* summary bar */}
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {ranked.filter(e => e.status === 'submitted').length} of {ranked.length} submitted
        </span>
        {pendingCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
            {pendingCount} pending
          </span>
        )}
      </div>

      {ranked.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No submissions yet</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Squads will appear here once teams submit.</div>
        </div>
      )}

      {ranked.map((entry, idx) => {
        const team = getTeam(entry.teamId);
        const isSubmitted = entry.status === 'submitted';
        const isExpanded = expanded === entry.teamId;
        const isMe = entry.teamId === myTeamId;
        const rankColor = MEDAL[idx];
        const isTop3 = idx < 3 && hasResults && isSubmitted;

        return (
          <div key={entry.teamId}
            className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${isMe ? '#1a9e5c30' : 'var(--border)'}`,
              opacity: isSubmitted ? 1 : 0.5,
            }}>
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              onClick={() => isSubmitted && setExpanded(p => p === entry.teamId ? null : entry.teamId)}
              disabled={!isSubmitted}>

              {/* rank number */}
              <div className="w-6 text-center flex-shrink-0">
                {isSubmitted ? (
                  <span className="text-sm font-black"
                    style={{ color: isTop3 ? rankColor : 'var(--text-muted)' }}>
                    {idx + 1}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                )}
              </div>

              {/* team emoji */}
              <div className="text-xl flex-shrink-0 w-7 text-center">{team?.emoji ?? '🏏'}</div>

              {/* name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {team?.name ?? entry.teamId}
                  </span>
                  {isMe && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: '#1a9e5c' }}>YOU</span>
                  )}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {isSubmitted ? entry.submittedBy : 'Not submitted yet'}
                </div>
              </div>

              {/* score / status */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {isSubmitted && (
                  hasResults ? (
                    <div className="text-right">
                      <div className="text-base font-black leading-tight"
                        style={{ color: isTop3 ? rankColor : 'var(--text-primary)' }}>
                        {entry.total.toFixed(1)}
                      </div>
                      <div className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>pts</div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>✓</span>
                  )
                )}
                {isSubmitted && (
                  isExpanded
                    ? <ChevronUp className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    : <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
            </button>

            {isExpanded && isSubmitted && (
              <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="p-3 space-y-3">
                  <GroundView
                    selectedPlayers={entry.breakdown.map(b => b.player).filter(Boolean) as IPLPlayer[]}
                    captain={entry.captain}
                    viceCaptain={entry.viceCaptain}
                  />

                  {hasResults && (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {entry.breakdown.map(({ player, pts, isCap, isVC }) => player && (
                        <div key={player.id}
                          className="flex items-center gap-2.5 px-3 py-2 border-b last:border-b-0"
                          style={{ borderColor: 'var(--border)' }}>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-white flex-shrink-0"
                            style={{ background: ROLE_COLOR[player.role] }}>
                            {ROLE_LABEL[player.role]}
                          </span>
                          <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                            {player.name}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isCap && (
                              <span className="text-[9px] font-black px-1 py-0.5 rounded text-white"
                                style={{ background: '#f59e0b' }}>C</span>
                            )}
                            {isVC && (
                              <span className="text-[9px] font-black px-1 py-0.5 rounded text-white"
                                style={{ background: '#8b5cf6' }}>VC</span>
                            )}
                            <span className="text-xs font-bold w-10 text-right"
                              style={{ color: pts !== null ? '#1a9e5c' : 'var(--text-muted)' }}>
                              {pts !== null ? pts : '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-3 py-2.5"
                        style={{ background: 'var(--bg-surface-2)', borderTop: '1px solid var(--border)' }}>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Total</span>
                        <span className="text-sm font-black" style={{ color: '#1a9e5c' }}>{entry.total.toFixed(1)} pts</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
