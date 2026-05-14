import { useMemo } from 'react';
import { Users, Crown, Shield, ChevronRight } from 'lucide-react';
import { useTeams } from '../hooks/useData';
import Spinner from './Spinner';
import type { TeamWithTotal } from '../types';

export default function TeamLeaderboard() {
  const { data: teams, loading } = useTeams();

  const ranked = useMemo<TeamWithTotal[]>(() => {
    if (!teams) return [];
    return teams
      .map(t => ({
        ...t,
        totalPoints: t.players.reduce((sum, p) => sum + p.points, 0),
        rank: 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((t, i) => ({ ...t, rank: i + 1 }));
  }, [teams]);

  const RANK_STYLE: Record<number, string> = {
    1: 'from-amber-400/20 to-amber-400/5 border-amber-400/40',
    2: 'from-slate-400/20 to-slate-400/5 border-slate-400/30',
    3: 'from-amber-700/20 to-amber-700/5 border-amber-700/30',
  };

  const RANK_BADGE: Record<number, string> = {
    1: '🏆 1st',
    2: '🥈 2nd',
    3: '🥉 3rd',
    4: '4th',
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold">Team Leaderboard</h1>
          <p className="text-sm text-slate-400">Combined scores from all events</p>
        </div>
      </div>

      {/* Team cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {ranked.map(team => {
          const topPlayer = [...team.players].sort((a, b) => b.points - a.points)[0];
          return (
            <div
              key={team.id}
              className={`rounded-2xl border bg-gradient-to-br p-6 ${
                RANK_STYLE[team.rank] ?? 'border-white/10 bg-white/5'
              }`}
            >
              {/* Team header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold"
                    style={{ backgroundColor: `${team.color}22` }}
                  >
                    {team.emoji}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{team.name}</h2>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${team.color}33`, color: team.color }}
                    >
                      {RANK_BADGE[team.rank]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-400">{team.totalPoints}</div>
                  <div className="text-xs text-slate-500">total pts</div>
                </div>
              </div>

              {/* Captain / VC */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                  <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Captain</div>
                    <div className="text-sm font-medium">{team.captain}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                  <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Vice Captain</div>
                    <div className="text-sm font-medium">{team.viceCaptain}</div>
                  </div>
                </div>
              </div>

              {/* Players list */}
              <div className="rounded-xl bg-black/20 p-3">
                <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <Users className="h-3 w-3" />
                  Squad ({team.players.length})
                </div>
                <div className="space-y-1">
                  {[...team.players]
                    .sort((a, b) => b.points - a.points)
                    .map((p, i) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                          <span className="text-sm font-medium">
                            {p.name}
                            {p.name === team.captain && (
                              <span className="ml-1 text-xs text-amber-400">(C)</span>
                            )}
                            {p.name === team.viceCaptain && (
                              <span className="ml-1 text-xs text-slate-400">(VC)</span>
                            )}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            p.name === topPlayer?.name ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          {p.points}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Points bar */}
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Team progress</span>
                  <span>{team.totalPoints} / {ranked[0]?.totalPoints ?? team.totalPoints} pts</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(team.totalPoints / (ranked[0]?.totalPoints || 1)) * 100}%`,
                      backgroundColor: team.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
          <ChevronRight className="h-5 w-5 text-amber-400" />
          <h2 className="font-semibold">Quick Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Captain</th>
                <th className="px-6 py-3">Vice Captain</th>
                <th className="px-6 py-3 text-center">Players</th>
                <th className="px-6 py-3 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(t => (
                <tr
                  key={t.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5 last:border-0"
                >
                  <td className="px-6 py-3 text-lg">{RANK_BADGE[t.rank]}</td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-2 font-medium">
                      <span>{t.emoji}</span>
                      <span>{t.name}</span>
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-300">{t.captain}</td>
                  <td className="px-6 py-3 text-slate-300">{t.viceCaptain}</td>
                  <td className="px-6 py-3 text-center text-slate-400">{t.players.length}</td>
                  <td className="px-6 py-3 text-right font-black text-amber-400">{t.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
