export default function Chess() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-5xl mb-4">♟️</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Chess
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Chess contest coming soon
        </p>
      </div>

      <div className="rounded-2xl p-6 pv-surface">
        <div className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          📋 Points System
        </div>
        <div className="space-y-3">
          {[
            { action: 'Win', points: 10 },
            { action: 'Draw', points: 5 },
            { action: 'Loss', points: 0 },
          ].map((item, i) => (
            <div key={i} className="flex justify-between text-sm"
              style={{ paddingBottom: '12px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.action}</span>
              <span className="font-bold rounded px-2 py-0.5 text-xs"
                style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}>
                +{item.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
