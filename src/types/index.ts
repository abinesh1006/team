export interface Player {
  name: string;
  points: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  emoji: string;
  captain: string;
  viceCaptain: string;
  players: Player[];
}

export interface TeamWithTotal extends Team {
  totalPoints: number;
  rank: number;
}

export interface PlayerWithTeam extends Player {
  team: string;
  teamColor: string;
  teamEmoji: string;
  rank: number;
}

export interface ScheduleEvent {
  id: string;
  date: string;
  time: string;
  game: string;
  type: 'individual' | 'team' | 'ceremony';
  description: string;
  venue: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface PointEntry {
  position: string;
  points: number;
  action?: string;
}

export interface Game {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  format: string;
  events: string[];
  pointsSystem: {
    individual?: PointEntry[];
    relay?: PointEntry[];
    fantasy?: PointEntry[];
  };
  rules: string[];
}

/* ── Dream11 ── */

export type PlayerRole = 'wk' | 'bat' | 'ar' | 'bowl';

export interface IPLPlayer {
  id: string;
  name: string;
  role: PlayerRole;
  iplTeam: string;
  credits: number;
  battingOrder: number;
  isCaptainOption: boolean;
  stats: {
    runs: number;
    avg: number;
    sr: number;
    wickets: number;
    economy: number | null;
  };
}

export interface ScoringEntry {
  action: string;
  points: number;
}

export interface Dream11Scoring {
  batting: ScoringEntry[];
  bowling: ScoringEntry[];
  fielding: ScoringEntry[];
  multipliers: ScoringEntry[];
}

export interface PlayerPerformance {
  playerId: string;
  runs?: number;
  fours?: number;
  sixes?: number;
  wickets?: number;
  maidens?: number;
  catches?: number;
  stumpings?: number;
  runOutDirect?: number;
  runOutIndirect?: number;
  isDuck?: boolean;
  lbwBowled?: boolean;
  basePoints?: number;
}

export interface Dream11TeamSquad {
  teamId: string;
  submittedBy: string;
  submittedAt: string | null;
  status: 'pending' | 'submitted' | 'locked';
  squad: string[];
  captain: string | null;
  viceCaptain: string | null;
  totalFantasyPoints: number | null;
}

export interface Dream11MatchMeta {
  matchTitle: string;
  team1: string;
  team2: string;
  team1Short: string;
  team2Short: string;
  team1Color: string;
  team2Color: string;
  venue: string;
  date: string;
  time: string;
  deadline: string | null;
  status: 'upcoming' | 'live' | 'completed';
  result?: string;
}

export interface Dream11Round {
  id: string;
  label: string;
  icon: string;
  playersCSV: string;
  scoresCSV: string;
  match: Dream11MatchMeta;
  playvistaTeamSquads: Dream11TeamSquad[];
}

export interface Dream11Constraints {
  squadSize: number;
  maxFromOneIPLTeam: number;
  wk: { min: number; max: number };
  bat: { min: number; max: number };
  ar: { min: number; max: number };
  bowl: { min: number; max: number };
}

export interface Dream11Data {
  constraints: Dream11Constraints;
  scoring: Dream11Scoring;
  rounds: Dream11Round[];
}
