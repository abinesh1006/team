import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQuotes } from '../hooks/useData';

const STORAGE_KEY = 'pv_intro_seen';

/* ══════════════════════════════════════════════
   STAR FIELD
══════════════════════════════════════════════ */
function StarField({ warpSpeed }: { warpSpeed: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const warpRef = useRef(false);
  warpRef.current = warpSpeed;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d')!;
    let raf = 0;

    const resize = () => { el.width = window.innerWidth; el.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Star = { x: number; y: number; r: number; spd: number; a: number; tw: number };
    const stars: Star[] = Array.from({ length: 320 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      spd: Math.random() * 0.00015 + 0.00003,
      a: Math.random() * 0.6 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      t++;
      const warp = warpRef.current;
      const { width, height } = el;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2, cy = height / 2;

      for (const s of stars) {
        const spd = warp ? s.spd * 22 : s.spd;
        s.y -= spd;
        if (s.y < 0) { s.y = 1; s.x = Math.random(); }

        if (warp) {
          // Streak toward center during warp
          const sx = (s.x - 0.5) * width + cx;
          const sy = s.y * height;
          const len = Math.max(12, s.r * 18);
          const dx = (sx - cx) * 0.08;
          const dy = (sy - cy) * 0.08;
          ctx.strokeStyle = `rgba(255,255,255,${s.a * 0.85})`;
          ctx.lineWidth = s.r * 0.6;
          ctx.beginPath();
          ctx.moveTo(sx - dx, sy - dy);
          ctx.lineTo(sx - dx + dx * (len / 20), sy - dy + dy * (len / 20));
          ctx.stroke();
        } else {
          const alpha = s.a * (0.55 + 0.45 * Math.sin(t * 0.02 + s.tw));
          ctx.beginPath();
          ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }

      // Shooting star every ~7s
      if (t % 420 === 60) {
        const sx = Math.random() * width * 0.7;
        const sy = Math.random() * height * 0.4;
        const grad = ctx.createLinearGradient(sx, sy, sx + 160, sy + 55);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.75)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 160, sy + 55); ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvas} className="absolute inset-0 w-full h-full" />;
}

/* ══════════════════════════════════════════════
   SPACECRAFT — slow diagonal drift, warp-jumps at end
══════════════════════════════════════════════ */
function Spacecraft({ phase }: { phase: 'idle' | 'drift' | 'warp' }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 8,
    filter: 'drop-shadow(0 0 22px rgba(245,158,11,0.75)) drop-shadow(0 0 8px rgba(129,140,248,0.5))',
    transform: 'rotate(-14deg)',
    pointerEvents: 'none',
  };

  if (phase === 'idle') {
    Object.assign(style, { left: '-15%', bottom: '-10%', transition: 'none' });
  } else if (phase === 'drift') {
    Object.assign(style, {
      left: '65%', bottom: '60%',
      transition: 'left 18s cubic-bezier(0.2,0.05,0.3,1), bottom 18s cubic-bezier(0.2,0.05,0.3,1)',
    });
  } else {
    Object.assign(style, {
      left: '160%', bottom: '130%',
      transition: 'left 1.4s cubic-bezier(0.55,0,1,0.45), bottom 1.4s cubic-bezier(0.55,0,1,0.45)',
    });
  }

  return (
    <div style={style}>
      <svg width="96" height="56" viewBox="0 0 96 56" fill="none">
        <ellipse cx="10" cy="28" rx="10" ry="6" fill="rgba(245,158,11,0.45)" />
        <ellipse cx="10" cy="28" rx="5.5" ry="3" fill="rgba(245,158,11,0.9)" />
        <path d="M18 19 Q46 8 84 28 Q46 48 18 37 Z" fill="url(#sg)" />
        <ellipse cx="65" cy="28" rx="10" ry="7.5" fill="url(#cg)" />
        <path d="M18 22 L30 14 L35 22 Z" fill="rgba(129,140,248,0.7)" />
        <path d="M18 34 L30 42 L35 34 Z" fill="rgba(129,140,248,0.7)" />
        <path d="M8 24 Q0 28 8 32" stroke="rgba(245,158,11,0.65)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M5 21 Q-6 28 5 35" stroke="rgba(245,158,11,0.3)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M3 18 Q-12 28 3 38" stroke="rgba(245,158,11,0.12)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <defs>
          <linearGradient id="sg" x1="18" y1="19" x2="84" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="45%" stopColor="#374151" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id="cg" cx="40%" cy="30%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
            <stop offset="60%" stopColor="#1d4ed8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STORY BEATS
   Each beat has a cinematic "style" that drives
   how the text is animated
══════════════════════════════════════════════ */
type BeatStyle =
  | 'slow-rise'     // word by word rise
  | 'stamp'         // slams in then settles
  | 'typewriter'    // characters appear left to right
  | 'split'         // two halves slide from opposite sides
  | 'title'         // the grand finale title card

interface Beat {
  style: BeatStyle;
  lines: string[];          // each element is one visual line
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  eyebrow?: string;
  duration: number;
}

// Beat templates — lines are filled at runtime from quotes.json
// The last beat (title card) never needs a quote so its lines stay fixed.
type BeatTemplate = Omit<Beat, 'lines'> & { lines?: string[] };

const BEAT_TEMPLATES: BeatTemplate[] = [
  { style: 'slow-rise', eyebrow: '— in a universe of infinite competition —', size: 'lg', duration: 3200 },
  { style: 'typewriter', eyebrow: 'they say…', size: 'lg', duration: 3400 },
  { style: 'split', eyebrow: '📡  signal detected', size: 'md', duration: 3200 },
  { style: 'stamp', size: 'lg', color: '#f59e0b', duration: 3400 },
  { style: 'slow-rise', eyebrow: '🏆  four teams. five arenas.', size: 'md', duration: 3400 },
  { style: 'typewriter', eyebrow: '♟️  chess · 🏸 badminton · 🏃 running · 🎯 carrom · 🏏 dream11', size: 'md', duration: 3600 },
  { style: 'split', eyebrow: '🛸  one mission. one outcome.', size: 'xl', duration: 3200 },
  { style: 'slow-rise', eyebrow: '— the universe is watching —', size: 'md', duration: 3000 },
  { style: 'title', eyebrow: 'Season 2026', lines: ['PlayVista'], size: 'xl', duration: 4000 },
];

/* ══════════════════════════════════════════════
   BEAT RENDERERS
══════════════════════════════════════════════ */
const SIZE_MAP = {
  sm: 'clamp(1.1rem,3vw,1.6rem)',
  md: 'clamp(1.6rem,4.5vw,2.6rem)',
  lg: 'clamp(2rem,6vw,3.6rem)',
  xl: 'clamp(2.8rem,8vw,5.5rem)',
};

function SlowRise({ beat, active }: { beat: Beat; active: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center pointer-events-none" style={{ zIndex: 20 }}>
      {beat.eyebrow && (
        <p style={{
          color: 'rgba(148,163,184,0.6)', fontSize: '0.7rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', marginBottom: '1.8rem',
          opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(10px)',
          transition: 'opacity 1.2s ease 0.1s, transform 1.2s ease 0.1s',
        }}>{beat.eyebrow}</p>
      )}
      {beat.lines.map((line, i) => (
        <h2 key={i} style={{
          fontSize: SIZE_MAP[beat.size ?? 'lg'],
          fontWeight: 900, color: beat.color ?? '#e2e8f0',
          whiteSpace: 'pre-line', lineHeight: 1.15,
          marginBottom: i < beat.lines.length - 1 ? '0.4em' : 0,
          opacity: show ? 1 : 0,
          transform: show ? 'none' : 'translateY(26px)',
          transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 0.18 + 0.15}s, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 0.18 + 0.15}s`,
          textShadow: '0 0 80px rgba(255,255,255,0.07)',
        }}>{line}</h2>
      ))}
    </div>
  );
}

function StampBeat({ beat, active }: { beat: Beat; active: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center pointer-events-none" style={{ zIndex: 20 }}>
      {beat.lines.map((line, i) => (
        <h2 key={i} style={{
          fontSize: SIZE_MAP[beat.size ?? 'lg'],
          fontWeight: 900, color: beat.color ?? '#e2e8f0',
          lineHeight: 1.1, letterSpacing: '-0.02em',
          marginBottom: i < beat.lines.length - 1 ? '0.2em' : 0,
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(1.35)',
          filter: show ? 'blur(0px)' : 'blur(6px)',
          transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.28}s,
                       transform 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.28}s,
                       filter 0.55s ease ${i * 0.28}s`,
          textShadow: beat.color ? `0 0 60px ${beat.color}50` : undefined,
        }}>{line}</h2>
      ))}
    </div>
  );
}

function TypewriterBeat({ beat, active }: { beat: Beat; active: boolean }) {
  const [charCount, setCharCount] = useState(0);
  const full = beat.lines.join('\n');
  const eyebrowVis = useRef(false);
  const [eb, setEb] = useState(false);

  useEffect(() => {
    if (!active) { setCharCount(0); eyebrowVis.current = false; setEb(false); return; }
    setEb(false);
    const t0 = setTimeout(() => { eyebrowVis.current = true; setEb(true); }, 200);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCharCount(i);
      if (i >= full.length) clearInterval(interval);
    }, 42);
    return () => { clearTimeout(t0); clearInterval(interval); };
  }, [active, full]);

  const displayed = full.slice(0, charCount);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center pointer-events-none" style={{ zIndex: 20 }}>
      {beat.eyebrow && (
        <p style={{
          color: 'rgba(148,163,184,0.55)', fontSize: '0.68rem', letterSpacing: '0.2em',
          textTransform: 'uppercase', marginBottom: '1.6rem',
          opacity: eb ? 1 : 0, transition: 'opacity 0.8s ease',
        }}>{beat.eyebrow}</p>
      )}
      <h2 style={{
        fontSize: SIZE_MAP[beat.size ?? 'lg'],
        fontWeight: 900, color: beat.color ?? '#e2e8f0',
        whiteSpace: 'pre-line', lineHeight: 1.2,
        textShadow: '0 0 80px rgba(255,255,255,0.06)',
        minHeight: '2.5em',
      }}>
        {displayed}
        {charCount < full.length && (
          <span style={{
            display: 'inline-block', width: '0.06em', height: '1em',
            background: '#f59e0b', verticalAlign: 'middle', marginLeft: 2,
            animation: 'cursorBlink 0.7s step-end infinite',
          }} />
        )}
      </h2>
    </div>
  );
}

function SplitBeat({ beat, active }: { beat: Beat; active: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center pointer-events-none" style={{ zIndex: 20 }}>
      {beat.eyebrow && (
        <p style={{
          color: 'rgba(148,163,184,0.55)', fontSize: '0.68rem', letterSpacing: '0.22em',
          textTransform: 'uppercase', marginBottom: '1.6rem',
          opacity: show ? 1 : 0, transition: 'opacity 1s ease 0.3s',
        }}>{beat.eyebrow}</p>
      )}
      {beat.lines.map((line, i) => (
        <div key={i} style={{ overflow: 'hidden', marginBottom: i < beat.lines.length - 1 ? '0.15em' : 0 }}>
          <h2 style={{
            fontSize: SIZE_MAP[beat.size ?? 'lg'],
            fontWeight: 900, color: beat.color ?? '#e2e8f0',
            whiteSpace: 'pre-line', lineHeight: 1.15,
            transform: show ? 'translateX(0)' : i % 2 === 0 ? 'translateX(-60px)' : 'translateX(60px)',
            opacity: show ? 1 : 0,
            transition: `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s, opacity 0.9s ease ${i * 0.15}s`,
          }}>{line}</h2>
        </div>
      ))}
    </div>
  );
}

function TitleBeat({ beat, active }: { beat: Beat; active: boolean }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center pointer-events-none" style={{ zIndex: 20 }}>
      {/* Burst rings */}
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute rounded-full border border-amber-400/20"
          style={{
            width: phase >= 1 ? `${320 + i * 140}px` : '0px',
            height: phase >= 1 ? `${320 + i * 140}px` : '0px',
            opacity: phase >= 1 ? 0 : 0,
            transition: `width 1.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.18}s, height 1.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.18}s`,
            animation: phase >= 1 ? `ringPulse 2.5s ease-in-out ${i * 0.4}s infinite` : 'none',
          }} />
      ))}

      <p style={{
        color: 'rgba(148,163,184,0.55)', fontSize: '0.7rem', letterSpacing: '0.3em',
        textTransform: 'uppercase', marginBottom: '1.2rem',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'none' : 'translateY(10px)',
        transition: 'opacity 1s ease 0.4s, transform 1s ease 0.4s',
      }}>{beat.eyebrow}</p>

      <h1 style={{
        fontSize: SIZE_MAP['xl'],
        fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
        color: '#f8fafc',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1)' : 'scale(0.82)',
        filter: phase >= 1 ? 'blur(0px)' : 'blur(12px)',
        transition: 'opacity 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s, filter 1.2s ease 0.1s',
      }}>
        Play<span style={{
          color: '#f59e0b',
          textShadow: '0 0 60px rgba(245,158,11,0.6)',
        }}>Vista</span>
      </h1>

      <p style={{
        marginTop: '1rem', color: 'rgba(100,116,139,0.6)',
        fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 1s ease',
      }}>The tournament. The universe. The glory.</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VIGNETTE — cinematic letterbox feel
══════════════════════════════════════════════ */
function Vignette() {
  return (
    <>
      {/* Top/bottom letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 z-30"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-30"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
      {/* Edge vignette */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
    </>
  );
}

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
interface Props { onDone: () => void; }

export default function IntroScreen({ onDone }: Props) {
  const { data: quotesData } = useQuotes();
  const [beatIdx, setBeatIdx] = useState(-1);
  const [shipPhase, setShipPhase] = useState<'idle' | 'drift' | 'warp'>('idle');
  const [closing, setClosing] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Merge JSON intro quotes into beat templates (title beat keeps its own fixed lines)
  const beats = useMemo<Beat[]>(() => {
    const introQuotes = quotesData?.intro ?? [];
    return BEAT_TEMPLATES.map((t, i) => ({
      ...t,
      lines: t.lines ?? [introQuotes[i] ?? ''],
    }));
  }, [quotesData]);

  const finish = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setShipPhase('warp');
    localStorage.setItem(STORAGE_KEY, '1');
    timers.current.forEach(clearTimeout);
    setTimeout(onDone, 1100);
  }, [closing, onDone]);

  useEffect(() => {
    if (!beats.length || !beats[0].lines[0]) return; // wait for quotes to load
    const T = timers.current;
    T.forEach(clearTimeout);
    T.length = 0;
    T.push(setTimeout(() => setShipPhase('drift'), 400));
    T.push(setTimeout(() => setBeatIdx(0), 600));

    let cursor = 600;
    for (let i = 0; i < beats.length - 1; i++) {
      cursor += beats[i].duration;
      const next = i + 1;
      T.push(setTimeout(() => setBeatIdx(next), cursor));
    }
    return () => T.forEach(clearTimeout);
  }, [beats]);

  const currentBeat = beats[beatIdx];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden select-none cursor-pointer"
      onClick={finish}
      style={{
        background: 'radial-gradient(ellipse at 50% 18%, #07112a 0%, #020817 45%, #000 100%)',
        opacity: closing ? 0 : 1,
        transition: closing ? 'opacity 1.1s ease' : 'none',
      }}>

      <style>{`
        @keyframes cursorBlink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        @keyframes ringPulse {
          0%   { opacity: 0.18; transform: scale(1); }
          50%  { opacity: 0.08; transform: scale(1.06); }
          100% { opacity: 0.18; transform: scale(1); }
        }
        @keyframes btnGlow {
          0%,100% { box-shadow: 0 0 32px rgba(245,158,11,0.35), 0 8px 32px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 0 52px rgba(245,158,11,0.55), 0 8px 32px rgba(0,0,0,0.5); }
        }
      `}</style>

      {/* Stars */}
      <StarField warpSpeed={shipPhase === 'warp'} />

      {/* Nebula atmosphere */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: [
          'radial-gradient(ellipse 65% 45% at 50% 12%, rgba(99,102,241,0.09) 0%, transparent 65%)',
          'radial-gradient(ellipse 35% 28% at 18% 72%, rgba(245,158,11,0.05) 0%, transparent 60%)',
          'radial-gradient(ellipse 30% 25% at 82% 58%, rgba(129,140,248,0.06) 0%, transparent 60%)',
        ].join(','),
      }} />

      {/* Spacecraft */}
      <Spacecraft phase={shipPhase} />

      {/* Vignette */}
      <Vignette />

      {/* Beat renderer */}
      {currentBeat && (() => {
        const props = { beat: currentBeat, active: true };
        switch (currentBeat.style) {
          case 'slow-rise':   return <SlowRise key={beatIdx} {...props} />;
          case 'stamp':       return <StampBeat key={beatIdx} {...props} />;
          case 'typewriter':  return <TypewriterBeat key={beatIdx} {...props} />;
          case 'split':       return <SplitBeat key={beatIdx} {...props} />;
          case 'title':       return <TitleBeat key={beatIdx} {...props} />;
        }
      })()}

      {/* Tap hint — bottom center, fades in after first beat */}
      <div className="pointer-events-none absolute bottom-10 inset-x-0 flex flex-col items-center gap-2 z-40"
        style={{
          opacity: beatIdx >= 0 ? 0.4 : 0,
          transition: 'opacity 1.5s ease',
        }}>
        <div style={{ color: 'rgba(71,85,105,0.7)', fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          tap anywhere to enter
        </div>
      </div>
    </div>
  );
}

export function useIntroSeen() {
  return localStorage.getItem(STORAGE_KEY) === '1';
}
