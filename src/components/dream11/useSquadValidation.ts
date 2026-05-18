import { useMemo } from 'react';
import type { IPLPlayer, PlayerRole, Dream11Constraints } from '../../types';

export function useSquadValidation(
  squad: string[],
  captain: string | null,
  viceCaptain: string | null,
  players: IPLPlayer[],
  c: Dream11Constraints,
) {
  return useMemo(() => {
    const sel = players.filter(p => squad.includes(p.id));
    const byRole = (r: PlayerRole) => sel.filter(p => p.role === r).length;
    const teams = [...new Set(players.map(p => p.iplTeam))];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (squad.length < c.squadSize) errors.push(`Pick ${c.squadSize - squad.length} more player${c.squadSize - squad.length > 1 ? 's' : ''}`);
    if (squad.length > c.squadSize) errors.push(`Remove ${squad.length - c.squadSize} player${squad.length - c.squadSize > 1 ? 's' : ''}`);
    for (const [role, label] of [['wk','WK'],['bat','BAT'],['ar','AR'],['bowl','BOWL']] as const) {
      const n = byRole(role); const lim = c[role];
      if (n < lim.min) errors.push(`Min ${lim.min} ${label} (have ${n})`);
      if (n > lim.max) errors.push(`Max ${lim.max} ${label} (have ${n})`);
    }
    for (const t of teams) {
      const n = sel.filter(p => p.iplTeam === t).length;
      if (n > c.maxFromOneIPLTeam) errors.push(`Max ${c.maxFromOneIPLTeam} from ${t}`);
    }
    if (squad.length === c.squadSize && !captain) warnings.push('Pick a Captain (2× points)');
    if (squad.length === c.squadSize && !viceCaptain) warnings.push('Pick a Vice-Captain (1.5× points)');

    return { errors, warnings, valid: errors.length === 0 };
  }, [squad, captain, viceCaptain, players, c]);
}
