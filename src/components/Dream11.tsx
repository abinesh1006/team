import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useDream11, useCricketPlayers, useRoundScores, useTeams, useAllSquadCSVs } from '../hooks/useData';
import { useUser } from '../context/UserContext';
import { RoundTabs } from './dream11/RoundTabs';
import { MatchBanner } from './dream11/MatchBanner';
import { SquadBuilder } from './dream11/Builder';
import { AllSubmissions } from './dream11/AllSubmissions';
import { Results } from './dream11/Results';
import { Sk } from './dream11/atoms';

const D11_GREEN = '#1a9e5c';

type MainTab = 'myteam' | 'submissions' | 'results';

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'myteam',      label: 'My Team'        },
  { id: 'submissions', label: 'All Submissions' },
  { id: 'results',     label: 'Results'         },
];

export default function Dream11() {
  const navigate = useNavigate();
  const { data, loading: d11Loading, error: d11Error } = useDream11();
  const { data: teamsData } = useTeams();
  const user = useUser();

  const [mainTab, setMainTab] = useState<MainTab>('submissions');
  const [activeRound, setActiveRound] = useState<string>('qualifier1');

  const round = useMemo(() => data?.rounds.find(r => r.id === activeRound) ?? null, [data, activeRound]);

  const playersCsvPath = round?.playersCSV ?? `data/dream11/${activeRound}/players.csv`;
  const { data: players, loading: csvLoading, error: csvError } = useCricketPlayers(playersCsvPath);
  const scoresCsvPath = round?.scoresCSV ?? `data/dream11/${activeRound}/scores.csv`;
  const { data: performances } = useRoundScores(scoresCsvPath);

  const teamIds = useMemo(() => teamsData?.map(t => t.id) ?? [], [teamsData]);
  const { data: csvSquads } = useAllSquadCSVs(activeRound, teamIds);

  const myTeamId = user.team;
  const myTeamData = useMemo(() => teamsData?.find(t => t.id === myTeamId), [teamsData, myTeamId]);
  const canEditTeam = useMemo((): boolean | undefined => {
    if (!myTeamData) return undefined;
    return user.name === myTeamData.captain || user.name === myTeamData.viceCaptain;
  }, [myTeamData, user]);

  const enrichedSquads = useMemo(() => {
    if (!teamsData) return [];
    return teamsData.map(team => {
      const csv = csvSquads[team.id];
      const hasSquad = csv && csv.filter(r => r.id.trim()).length >= 11;
      return {
        teamId: team.id,
        submittedBy: team.captain,
        submittedAt: hasSquad ? 'submitted' : null,
        status: hasSquad ? ('submitted' as const) : ('pending' as const),
        squad: hasSquad ? csv.map(r => r.id) : [],
        captain: hasSquad ? (csv.find(r => r.isCaptain)?.id ?? null) : null,
        viceCaptain: hasSquad ? (csv.find(r => r.isViceCaptain)?.id ?? null) : null,
        totalFantasyPoints: null,
      };
    });
  }, [teamsData, csvSquads]);

  if (d11Loading || csvLoading) {
    return (
      <div className="space-y-3 pt-2">
        <div className="flex gap-2">{[1,2,3,4].map(i => <Sk key={i} className="h-10 flex-1 rounded-full" />)}</div>
        <Sk className="h-24 rounded-2xl" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Sk key={i} className="h-16 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (d11Error || csvError || !data || !players) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <div className="text-4xl">🏏</div>
        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Failed to load Dream11</div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{d11Error ?? csvError}</div>
      </div>
    );
  }

  const matchStatus = round?.match.status ?? 'upcoming';

  /* Results tab doesn't need round-specific player/perf data */
  const showRoundPicker = mainTab !== 'results';

  return (
    <div className="flex flex-col gap-0">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
              Dream<span style={{ color: D11_GREEN }}>11</span>
            </h1>
            <p className="text-[11px] leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>
              IPL Playoffs Fantasy
            </p>
          </div>
        </div>
        <div className="rounded-full px-3 py-1.5"
          style={{ background: `${D11_GREEN}15`, border: `1px solid ${D11_GREEN}30` }}>
          <span className="text-[10px] font-black tracking-wide" style={{ color: D11_GREEN }}>FANTASY</span>
        </div>
      </div>

      {/* ── Main tabs — always at top ── */}
      <div className="flex border-b mb-4" style={{ borderColor: 'var(--border)' }}>
        {MAIN_TABS.map(({ id, label }) => {
          const isActive = mainTab === id;
          return (
            <button
              key={id}
              onClick={() => setMainTab(id)}
              className="flex-1 py-2.5 text-xs font-bold transition-colors relative"
              style={{ color: isActive ? D11_GREEN : 'var(--text-muted)' }}>
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                  style={{ background: D11_GREEN }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Round picker + match banner — only for My Team & All Submissions ── */}
      {showRoundPicker && (
        <div className="space-y-3 mb-4">
          <RoundTabs
            rounds={data.rounds}
            activeId={activeRound}
            onChange={id => setActiveRound(id)}
          />
          {round && <MatchBanner match={round.match} />}
        </div>
      )}

      {/* ── Tab content ── */}
      {mainTab === 'myteam' && (
        <SquadBuilder
          players={players}
          constraints={data.constraints}
          roundId={activeRound}
          teamId={myTeamId}
          canEdit={canEditTeam}
          matchStatus={matchStatus}
        />
      )}

      {mainTab === 'submissions' && (
        <AllSubmissions
          squads={enrichedSquads}
          players={players}
          performances={performances ?? []}
          teams={teamsData ?? []}
          myTeamId={myTeamId}
        />
      )}

      {mainTab === 'results' && (
        <Results
          rounds={data.rounds}
          activeRoundId={activeRound}
          teams={teamsData ?? []}
          scoring={data.scoring}
        />
      )}
    </div>
  );
}
