import type { PlayerRole } from '../../types';
import { ROLE_LABEL, ROLE_COLOR } from './constants';

export function Sk({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function RoleBadge({ role, small }: { role: PlayerRole; small?: boolean }) {
  return (
    <span
      className={`rounded font-bold uppercase tracking-wide text-white ${small ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'}`}
      style={{ background: ROLE_COLOR[role] }}>
      {ROLE_LABEL[role]}
    </span>
  );
}
