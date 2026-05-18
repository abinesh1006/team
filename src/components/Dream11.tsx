import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Info, Zap, Star } from 'lucide-react';
import { useDream11, useCricketPlayers, useRoundScores, useTeams, useAllSquadCSVs } from '../hooks/useData';
import { useUser } from '../context/UserContext';
import { ScoringReference } from './dream11/ScoringReference';
import { ContestRules } from './dream11/ContestRules';
import { FantasyLeaderboard } from './dream11/FantasyLeaderboard';
import { MatchBanner } from './dream11/MatchBanner';
import { PerformanceEntry } from './dream11/PerformanceEntry';
import { RoundTabs } from './dream11/RoundTabs';
import { SquadBuilder } from './dream11/Builder';
import { Sk } from './dream11/atoms';

type Tab = 'builder' | 'leaderboard' | 'scoring' | 'rules' | 'scores';

const D11_GREEN = '#1a9e5c';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'builder',     label: 'My Squad',   icon: <Users className="h-4 w-4" /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
  { id: 'scoring',     label: 'Scoring',     icon: <Zap className="h-4 w-4" /> },
  { id: 'rules',       label: 'Rules',       icon: <Info className="h-4 w-4" /> },
  { id: 'scores',      label: 'Scores ⚙',   icon: <Star className="h-4 w-4" /> },
];

export default function Dream11() {
  const navigate = useNavigate();
  const { data, loading: d11Loading, error: d11Error } = useDream11();
  const { data: teamsData } = useTeams();
  const [activeRound, setActiveRound] = useState<string>('finals');
  const [tab, setTab] = useState<Tab>('builder');

  const round = useMemo(() => data?.rounds.find(r => r.id === activeRound) ?? null, [data, activeRound]);
  const playersCsvPath = round?.playersCSV ?? `data/dream11/${activeRound}/players.csv`;
  const { data: players, loading: csvLoading, error: csvError } = useCricketPlayers(playersCsvPath);
  const scoresCsvPath = round?.scoresCSV ?? `data/dream11/${activeRound}/scores.csv`;
  const { data: performances } = useRoundScores(scoresCsvPath);

  const user = useUser();
  const selectedTeamId = user.team ?? 'team-alpha';

  const canEditTeam = useMemo((): boolean | undefined => {
    if (!teamsData) return undefined;
    const team = teamsData.find(t => t.id === selectedTeamId);
    if (!team) return false;
    return user.team === selectedTeamId &&
      (user.name === team.captain || user.name === team.viceCaptain);
  }, [teamsData, selectedTeamId, user]);

  const teamIds = useMemo(() => teamsData?.map(t => t.id) ?? [], [teamsData]);
  const { data: csvSquads } = useAllSquadCSVs(activeRound, teamIds);

  const enrichedSquads = useMemo(() => {
    if (!teamsData) return [];
    return teamsData.map(team => {
      const csv = csvSquads[team.id];
      const hasSquad = csv && csv.length >= 11;
      return {
        teamId: team.id,
        submittedBy: team.captain,
        submittedAt: hasSquad ? 'submitted' : null,
        status: hasSquad ? 'submitted' as const : 'pending' as const,
        squad: hasSquad ? csv.map(r => r.id) : [],
        captain: hasSquad ? (csv.find(r => r.isCaptain)?.id ?? null) : null,
        viceCaptain: hasSquad ? (csv.find(r => r.isViceCaptain)?.id ?? null) : null,
        totalFantasyPoints: null,
      };
    });
  }, [teamsData, csvSquads]);

  if (d11Loading || csvLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">{[1,2,3].map(i => <Sk key={i} className="h-14 w-32 rounded-xl" />)}</div>
        <Sk className="h-36 rounded-2xl" />
        <Sk className="h-10 rounded-xl" />
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => <Sk key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  if (d11Error || csvError || !data || !players) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <div className="text-5xl mb-4">🏏</div>
          <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Failed to load Dream11</div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{d11Error ?? csvError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── page header (Dream11 style: green accent) ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/')} className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
            ←
          </button>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${D11_GREEN}20` }}>🏏</div>
          <div>
            <h1 className="text-xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>
              Dream<span style={{ color: D11_GREEN }}>11</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {players.length} players · Playoffs → Finals
            </p>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{ background: `${D11_GREEN}22`, color: D11_GREEN }}>
          FANTASY
        </span>
      </div>

      {/* ── round selector ── */}
      <RoundTabs
        rounds={data.rounds}
        activeId={activeRound}
        onChange={id => { setActiveRound(id); setTab('builder'); }}
      />

      {/* ── match banner ── */}
      {round && <MatchBanner match={round.match} />}


      {/* ── tab bar (Dream11-style pill row) ── */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none rounded-2xl p-1"
        style={{ background: 'var(--bg-surface)' }}>
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black transition-all"
            style={{
              background: tab === id ? D11_GREEN : 'transparent',
              color: tab === id ? '#fff' : 'var(--text-muted)',
            }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── tab content ── */}
      {tab === 'builder' && (
        <SquadBuilder
          players={players}
          constraints={data.constraints}
          roundId={activeRound}
          teamId={selectedTeamId}
          canEdit={canEditTeam}
        />
      )}
      {tab === 'leaderboard' && (
        <FantasyLeaderboard
          squads={enrichedSquads}
          players={players}
          performances={performances ?? []}
          teams={teamsData ?? []}
        />
      )}
      {tab === 'scoring' && <ScoringReference scoring={data.scoring} />}
      {tab === 'rules' && <ContestRules />}
      {tab === 'scores' && <PerformanceEntry players={players} />}
    </div>
  );
}
