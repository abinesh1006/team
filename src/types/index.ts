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
