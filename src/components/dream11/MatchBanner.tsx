import type { Dream11Round } from '../../types';

export function MatchBanner({ match }: { match: Dream11Round['match'] }) {
  const isTBD = match.team1Short === 'TBD';
  const isLive = match.status === 'live';
  const isDone = match.status === 'completed';

  return (
    <div className="relative overflow-hidden rounded-xl"
      style={{ background: 'linear-gradient(160deg,#1a3a2a 0%,#0d2118 60%,#0a1a12 100%)' }}>
      {/* pitch lines */}
      <div className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.6) 28px,rgba(255,255,255,0.6) 29px)',
        }} />

      <div className="relative flex items-center px-4 py-2.5 gap-3">
        {/* team 1 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0"
            style={{
              background: isTBD ? 'rgba(255,255,255,0.08)' : `${match.team1Color}22`,
              borderColor: isTBD ? 'rgba(255,255,255,0.15)' : match.team1Color,
              color: isTBD ? 'rgba(255,255,255,0.4)' : match.team1Color,
            }}>
            {match.team1Short}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-white leading-tight truncate">{match.team1Short}</div>
            <div className="text-[10px] leading-tight truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{match.team1}</div>
          </div>
        </div>

        {/* centre */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 px-1">
          {isLive ? (
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black"
              style={{ background: '#dc2626', color: '#fff' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />LIVE
            </span>
          ) : (
            <span className="text-xs font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>VS</span>
          )}
          {match.deadline && !isDone && (
            <div className="text-[9px] font-bold" style={{ color: '#f59e0b' }}>
              {new Date(match.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {isDone && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              DONE
            </span>
          )}
        </div>

        {/* team 2 */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <div className="min-w-0 text-right">
            <div className="text-sm font-black text-white leading-tight truncate">{match.team2Short}</div>
            <div className="text-[10px] leading-tight truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{match.team2}</div>
          </div>
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black border flex-shrink-0"
            style={{
              background: isTBD ? 'rgba(255,255,255,0.08)' : `${match.team2Color}22`,
              borderColor: isTBD ? 'rgba(255,255,255,0.15)' : match.team2Color,
              color: isTBD ? 'rgba(255,255,255,0.4)' : match.team2Color,
            }}>
            {match.team2Short}
          </div>
        </div>
      </div>

      {isDone && match.result && (
        <div className="px-4 pb-2 flex items-center justify-center gap-1 text-[10px] font-bold"
          style={{ color: '#22c55e' }}>
          <span>✅</span>{match.result}
        </div>
      )}
    </div>
  );
}
