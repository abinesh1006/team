import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export const ORGANISERS = [
  {
    name: 'Organiser One',
    role: 'Chief Organiser',
    initials: 'O1',
    color: '#f59e0b',
    quote: 'Compete hard, play fair, leave it all on the field.',
    photo: null as string | null,
  },
  {
    name: 'Organiser Two',
    role: 'Event Coordinator',
    initials: 'O2',
    color: '#6366f1',
    quote: 'Built on passion, driven by teamwork.',
    photo: null as string | null,
  },
  {
    name: 'Organiser Three',
    role: 'Operations Lead',
    initials: 'O3',
    color: '#22c55e',
    quote: 'Every great team starts with a great spirit.',
    photo: null as string | null,
  },
];

export default function OrganizerCarousel() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!open) return;
    timerRef.current = setTimeout(() => {
      setDir(1);
      setIdx(i => (i + 1) % ORGANISERS.length);
      setAnimKey(k => k + 1);
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [open, idx]);

  function goTo(next: number, d: 1 | -1) {
    setDir(d);
    setIdx(next);
    setAnimKey(k => k + 1);
    clearTimeout(timerRef.current);
  }

  const org = ORGANISERS[idx];

  return (
    <>
      <style>{`
        @keyframes fab-pulse {
          0%,100% { box-shadow: 0 0 0 0 #f59e0b55, 0 8px 32px rgba(0,0,0,0.4); }
          50%      { box-shadow: 0 0 0 10px transparent, 0 8px 32px rgba(0,0,0,0.4); }
        }
        @keyframes org-fab-enter {
          from { transform: scale(0) rotate(-180deg); opacity:0; }
          to   { transform: scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes org-backdrop-in {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes org-photo-in-right {
          from { opacity:0; transform: translateX(60px) scale(0.94); }
          to   { opacity:1; transform: translateX(0) scale(1); }
        }
        @keyframes org-photo-in-left {
          from { opacity:0; transform: translateX(-60px) scale(0.94); }
          to   { opacity:1; transform: translateX(0) scale(1); }
        }
        @keyframes org-info-up {
          from { opacity:0; transform: translateY(18px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes org-ring {
          0%   { transform: scale(1); opacity:0.5; }
          100% { transform: scale(1.8); opacity:0; }
        }
        @keyframes org-progress {
          from { width:0%; }
          to   { width:100%; }
        }
        @keyframes org-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* FAB */}
      <button
        onClick={() => { setOpen(true); setAnimKey(k => k + 1); }}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full flex items-center justify-center text-xl font-black transition-transform hover:scale-110 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${ORGANISERS[0].color}, ${ORGANISERS[1].color})`,
          color: '#fff',
          animation: 'fab-pulse 2.8s ease-in-out infinite, org-fab-enter 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        title="Meet the Organisers"
      >
        👑
      </button>

      {/* Full-screen overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: '#000', animation: 'org-backdrop-in 0.3s ease' }}
          onClick={() => setOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 z-10 h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-5 z-10 text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {idx + 1} / {ORGANISERS.length}
          </div>

          {/* Photo — full bleed, takes most of screen */}
          <div
            key={`photo-${animKey}`}
            className="flex-1 relative overflow-hidden"
            style={{ animation: `${dir === 1 ? 'org-photo-in-right' : 'org-photo-in-left'} 0.5s cubic-bezier(0.16,1,0.3,1)` }}
            onClick={e => e.stopPropagation()}
          >
            {org.photo ? (
              <img
                src={org.photo}
                alt={org.name}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            ) : (
              /* Placeholder avatar — big, centered */
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: `linear-gradient(160deg, ${org.color}22 0%, #000 100%)` }}>
                {/* Ripple rings */}
                <div className="absolute rounded-full"
                  style={{ width: 260, height: 260, border: `2px solid ${org.color}30`, animation: 'org-ring 3s ease-out infinite' }} />
                <div className="absolute rounded-full"
                  style={{ width: 260, height: 260, border: `2px solid ${org.color}20`, animation: 'org-ring 3s ease-out 1s infinite' }} />
                <div
                  key={`av-${animKey}`}
                  className="relative h-52 w-52 rounded-full flex items-center justify-center font-black"
                  style={{
                    fontSize: 80,
                    background: `linear-gradient(135deg, ${org.color}dd, ${org.color}66)`,
                    color: '#fff',
                    boxShadow: `0 0 80px ${org.color}50`,
                    animation: 'org-info-up 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                >
                  {org.initials}
                </div>
              </div>
            )}

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
              style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }} />

            {/* Color accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: `linear-gradient(90deg, transparent, ${org.color}, transparent)` }} />
          </div>

          {/* Info panel — bottom strip */}
          <div
            key={`info-${animKey}`}
            className="shrink-0 px-6 pt-4 pb-6 flex flex-col gap-3"
            style={{ animation: 'org-info-up 0.45s ease 0.1s both' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Name + role */}
            <div>
              <div className="text-2xl font-black text-white leading-tight">{org.name}</div>
              <div className="text-xs uppercase tracking-[0.18em] mt-1 font-semibold" style={{ color: org.color }}>
                {org.role}
              </div>
            </div>

            {/* One-liner quote */}
            <p className="text-sm text-white/60 italic leading-relaxed">"{org.quote}"</p>

            {/* Controls + progress */}
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => goTo((idx - 1 + ORGANISERS.length) % ORGANISERS.length, -1)}
                className="h-9 w-9 rounded-full flex items-center justify-center text-base font-bold transition-all hover:scale-110 active:scale-90"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                ‹
              </button>

              <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  key={`pb-${animKey}`}
                  className="h-full rounded-full"
                  style={{ background: org.color, animation: 'org-progress 5s linear forwards' }}
                />
              </div>

              <div className="flex items-center gap-1.5">
                {ORGANISERS.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > idx ? 1 : -1)}
                    className="rounded-full transition-all duration-300"
                    style={{ width: i === idx ? 20 : 5, height: 5, background: i === idx ? o.color : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>

              <button
                onClick={() => goTo((idx + 1) % ORGANISERS.length, 1)}
                className="h-9 w-9 rounded-full flex items-center justify-center text-base font-bold transition-all hover:scale-110 active:scale-90"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
