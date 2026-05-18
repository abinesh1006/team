import { useNavigate } from 'react-router-dom';

export default function Badminton() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-muted)' }}>←</button>
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(255,255,255,0.08)' }}>🏸</div>
        <div>
          <h1 className="text-xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>Badminton</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Singles & Doubles</p>
        </div>
      </div>

      <div className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-4xl">🚧</div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Fixtures coming soon</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Check back closer to the event date</p>
      </div>
    </div>
  );
}
