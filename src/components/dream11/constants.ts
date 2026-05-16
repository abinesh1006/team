import type { PlayerRole } from '../../types';

export const ROLE_LABEL: Record<PlayerRole, string> = { wk: 'WK', bat: 'BAT', ar: 'AR', bowl: 'BOWL' };
export const ROLE_COLOR: Record<PlayerRole, string> = {
  wk: '#f59e0b', bat: '#22c55e', ar: '#8b5cf6', bowl: '#3b82f6',
};
export const ROLE_FULL: Record<PlayerRole, string> = {
  wk: 'Wicket Keeper', bat: 'Batter', ar: 'All-Rounder', bowl: 'Bowler',
};

export const STORAGE_KEY = (roundId: string, teamId: string) => `d11_squad_${roundId}_${teamId}`;
