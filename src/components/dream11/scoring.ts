import type { PlayerPerformance } from '../../types';

export function calcFantasyPoints(perf: PlayerPerformance, isCaptain: boolean, isVC: boolean): number {
  let pts = 0;
  const runs = perf.runs ?? 0;
  const wickets = perf.wickets ?? 0;
  pts += runs * 0.5;
  pts += (perf.fours ?? 0) * 1;
  pts += (perf.sixes ?? 0) * 2;
  if (runs >= 30) pts += 4;
  if (runs >= 50) pts += 8;
  if (runs >= 100) pts += 16;
  if (perf.isDuck) pts -= 2;
  pts += wickets * 25;
  if (perf.lbwBowled) pts += 8;
  if (wickets >= 3) pts += 4;
  if (wickets >= 4) pts += 8;
  if (wickets >= 5) pts += 16;
  pts += (perf.maidens ?? 0) * 12;
  pts += (perf.catches ?? 0) * 8;
  pts += (perf.stumpings ?? 0) * 12;
  pts += (perf.runOutDirect ?? 0) * 12;
  pts += (perf.runOutIndirect ?? 0) * 6;
  if (isCaptain) pts *= 2;
  else if (isVC) pts *= 1.5;
  return Math.round(pts * 10) / 10;
}
