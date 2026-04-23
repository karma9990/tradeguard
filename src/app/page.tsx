"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import Link from "next/link";
import {
  motion, useInView, useScroll, useTransform, useSpring,
  useMotionValue, AnimatePresence,
} from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   SOUND FX — singleton Web Audio
══════════════════════════════════════════════════════════════ */
let _ac: AudioContext | null = null;
function getAc(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ac) _ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return _ac;
  } catch { return null; }
}
function useSoundFx() {
  const tick = useCallback(() => {
    const ac = getAc(); if (!ac) return;
    try {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(880, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(500, ac.currentTime + 0.06);
      g.gain.setValueAtTime(0.03, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07);
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.07);
    } catch {}
  }, []);
  const thunk = useCallback(() => {
    const ac = getAc(); if (!ac) return;
    try {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = "square";
      o.frequency.setValueAtTime(160, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(48, ac.currentTime + 0.14);
      g.gain.setValueAtTime(0.05, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.16);
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.16);
    } catch {}
  }, []);
  return { tick, thunk };
}

/* ══════════════════════════════════════════════════════════════
   GRAIN OVERLAY
══════════════════════════════════════════════════════════════ */
function GrainOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[150] opacity-[0.055]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px",
      }} />
  );
}

/* ══════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════════ */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div style={{ scaleX, transformOrigin: "0%" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] pointer-events-none" />
  );
}

/* ══════════════════════════════════════════════════════════════
   CURSOR DOT
══════════════════════════════════════════════════════════════ */
function CursorDot() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 32 });
  const sy = useSpring(y, { stiffness: 380, damping: 32 });
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return (
    <motion.div suppressHydrationWarning
      style={{ left: sx, top: sy, translateX: "-50%", translateY: "-50%", mixBlendMode: "screen" }}
      className="pointer-events-none fixed z-[200] h-[6px] w-[6px] bg-primary hidden md:block"
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
══════════════════════════════════════════════════════════════ */
function MagneticButton({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 190, damping: 18 });
  const sy = useSpring(y, { stiffness: 190, damping: 18 });
  const { tick, thunk } = useSoundFx();
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width  / 2)) * 0.28);
        y.set((e.clientY - (r.top  + r.height / 2)) * 0.28);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onMouseEnter={tick}
      onClick={() => { thunk(); onClick?.(); }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   3D TILT CARD — mouse-reactive rotateX/Y avec spring
══════════════════════════════════════════════════════════════ */
function TiltCard({ children, className = "", intensity = 10 }: { children: ReactNode; className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 22 });
  const sry = useSpring(ry, { stiffness: 180, damping: 22 });
  return (
    <motion.div ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        ry.set(px * intensity);
        rx.set(-py * (intensity * 0.65));
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FLOATING METRIC — badge de donnée qui lévite
══════════════════════════════════════════════════════════════ */
function FloatingMetric({ label, value, delta, delay = 0, className = "" }: {
  label: string; value: string; delta?: string; delay?: number; className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4 + delay * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
      className={`pointer-events-none absolute ${className}`}>
      <div className="border border-foreground/12 bg-card/80 backdrop-blur-md px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{ backdropFilter: "blur(12px)" }}>
        <div className="label-eyebrow text-muted-foreground">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="num text-[16px] font-medium text-foreground">{value}</span>
          {delta && (
            <span className={`num text-[10px] font-medium ${delta.startsWith("+") ? "text-bull" : "text-bear"}`}>{delta}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCRAMBLE TEXT
══════════════════════════════════════════════════════════════ */
const SC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#!@%";
function ScrambleText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [display, setDisplay] = useState(() => text.replace(/\S/g, "—"));
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setOn(true), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, delay]);
  useEffect(() => {
    if (!on) return;
    let frame = 0;
    const TOTAL = 22;
    const id = setInterval(() => {
      frame++;
      setDisplay(text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (frame > (i / text.length) * TOTAL + 9) return ch;
        return SC[Math.floor(Math.random() * SC.length)];
      }).join(""));
      if (frame >= TOTAL + text.length) { setDisplay(text); clearInterval(id); }
    }, 35);
    return () => clearInterval(id);
  }, [on, text]);
  return <span ref={ref}>{display}</span>;
}

/* ══════════════════════════════════════════════════════════════
   DRAW LINE
══════════════════════════════════════════════════════════════ */
function DrawLine({ delay = 0, className = "", red = false }: { delay?: number; className?: string; red?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} style={{ originX: 0 }}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`h-px ${red ? "bg-primary" : "bg-foreground/12"} ${className}`} />
  );
}

/* ══════════════════════════════════════════════════════════════
   COIN CHARS
══════════════════════════════════════════════════════════════ */
function CoinChar({ char }: { char: string }) {
  const offset = (char.charCodeAt(0) % 7) * 0.8;
  return (
    <span style={{ display: "inline-block", position: "relative", verticalAlign: "baseline" }}>
      <span aria-hidden style={{ visibility: "hidden", userSelect: "none" }}>{char}</span>
      <motion.span aria-label={char}
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--color-primary)",
          transformPerspective: 320, transformOrigin: "center center",
        }}
        animate={{ rotateY: [0, 90, 180, 270, 360] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3.5 + offset, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}>
        {char}
      </motion.span>
    </span>
  );
}
function renderWithCoins(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  let last = 0;
  const re = /[éèêëàâîïùûüôœçÉÈÊËÀÂÎÏÙÛÜÔŒÇ]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) result.push(text.slice(last, m.index));
    result.push(<CoinChar key={m.index} char={m[0]} />);
    last = m.index + 1;
  }
  if (last < text.length) result.push(text.slice(last));
  return result;
}

/* ══════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════ */
function Reveal({ children, className = "", delay = 0, y = 20 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Counter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      setVal((1 - Math.pow(1 - p, 3)) * value);
      if (p < 1) requestAnimationFrame(step); else setVal(value);
    };
    requestAnimationFrame(step);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{val.toFixed(decimals)}{suffix}</span>;
}

function ClockDisplay() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setT(new Date().toUTCString().slice(17, 25));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  /* null pendant le SSR → pas de mismatch, le span apparaît une fois monté */
  return <span className="num">{t ?? "--:--:--"} UTC</span>;
}

function SectionLabel({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <div className="flex items-center gap-4 mb-16">
      <Reveal delay={delay}><span className="label-eyebrow flex-shrink-0">{label}</span></Reveal>
      <DrawLine className="flex-1" delay={delay + 0.05} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BACKGROUND DECOR — dark avec glows ambiants cramoisis
══════════════════════════════════════════════════════════════ */
function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Glow cramoisi bas-gauche */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 45% at 10% 85%, oklch(0.565 0.237 24 / 0.10) 0%, transparent 70%)" }} />
      {/* Glow secondaire haut-droit (bleu froid, profondeur) */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 45% 40% at 88% 8%, oklch(0.30 0.06 240 / 0.07) 0%, transparent 65%)" }} />
      {/* Glow central subtil */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 35% at 50% 50%, oklch(0.565 0.237 24 / 0.025) 0%, transparent 70%)" }} />
      {/* Grille principale 80px */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      {/* Sous-grille 20px */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />
      {/* Règles colonnes */}
      <div className="absolute inset-y-0 left-[16.666%] hidden w-px bg-white/[0.03] lg:block" />
      <div className="absolute inset-y-0 right-[16.666%] hidden w-px bg-white/[0.03] lg:block" />
      {/* Labels latéraux */}
      <div className="absolute left-3 top-1/2 hidden font-mono text-[8px] uppercase tracking-[0.32em] text-foreground/15 md:block"
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}>
        TradeGuard — Protection Active
      </div>
      <div className="absolute right-3 top-1/2 hidden font-mono text-[8px] uppercase tracking-[0.32em] text-foreground/15 md:block"
        style={{ writingMode: "vertical-rl", transform: "translateY(-50%)" }}>
        Live · 2025 · UTC
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GLOBE — avec anneau lumineux cramoisi
══════════════════════════════════════════════════════════════ */
const orbitSymbols = [
  { s: "REVENGE", angle: 0 }, { s: "CHECKLIST", angle: 36 },
  { s: "COOLDOWN", angle: 72 }, { s: "SCORE", angle: 108 },
  { s: "STREAK", angle: 144 }, { s: "DISCIPLINE", angle: 180 },
  { s: "ALERT", angle: 216 }, { s: "BLOCK", angle: 252 },
  { s: "PROTECT", angle: 288 }, { s: "TRACK", angle: 324 },
];
const globeArcs = [
  { from: 20, to: 200 }, { from: 80, to: 280 },
  { from: 150, to: 330 }, { from: 250, to: 60 },
];
const dotPoints = Array.from({ length: 110 }, (_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / 110);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return { x: Math.sin(phi) * Math.cos(theta) * 0.92, y: Math.sin(phi) * Math.sin(theta) * 0.92, size: 0.8 + ((i * 13) % 7) * 0.18 };
});

function Globe() {
  const SZ = 480, cx = 240, cy = 240, r = 185;
  return (
    <div className="relative" style={{ width: SZ, height: SZ }}>
      {/* Glow atmosphérique cramoisi */}
      <motion.div
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(ellipse 85% 85% at 50% 50%, oklch(0.565 0.237 24 / 0.08) 0%, transparent 70%)", }} />
      {/* Anneau cramoisi pulsant */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid oklch(0.565 0.237 24 / 0.4)", boxShadow: "0 0 30px oklch(0.565 0.237 24 / 0.2)" }} />

      <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-foreground/8" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-full border border-dashed border-foreground/6" />

      <motion.svg viewBox={`0 0 ${SZ} ${SZ}`} className="absolute inset-0 h-full w-full"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="0.8" className="text-foreground/20" />
        {[-60, -30, 0, 30, 60].map(lat => {
          const ry = r * Math.cos((lat * Math.PI) / 180);
          const off = r * Math.sin((lat * Math.PI) / 180);
          return <ellipse key={lat} cx={cx} cy={cy + off} rx={r * Math.cos((lat * Math.PI) / 180)} ry={Math.max(2, ry * 0.18)} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/12" />;
        })}
        <motion.g style={{ originX: `${cx}px`, originY: `${cy}px` }} animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
          {[0, 30, 60, 90, 120, 150].map((lng, i) => (
            <ellipse key={lng} cx={cx} cy={cy} rx={r * Math.abs(Math.cos((lng * Math.PI) / 180)) || 1} ry={r}
              fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/9"
              transform={`rotate(${i * 5} ${cx} ${cy})`} />
          ))}
        </motion.g>
        {dotPoints.map((p, i) => (
          <motion.circle key={i} cx={cx + p.x * r} cy={cy + p.y * r} r={p.size}
            className="fill-foreground/30"
            animate={{ opacity: [0.1, 0.55, 0.1] }}
            transition={{ duration: 3 + (i % 5), delay: (i % 7) * 0.14, repeat: Infinity }} />
        ))}
        {globeArcs.map((a, i) => {
          const ang1 = (a.from * Math.PI) / 180, ang2 = (a.to * Math.PI) / 180;
          const x1 = cx + Math.cos(ang1) * r, y1 = cy + Math.sin(ang1) * r;
          const x2 = cx + Math.cos(ang2) * r, y2 = cy + Math.sin(ang2) * r;
          return (
            <g key={i}>
              <motion.path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} fill="none" stroke="var(--color-primary)" strokeWidth="0.8"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [0, 0.6, 0] }}
                transition={{ duration: 3.5, delay: i * 1.1, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }} />
              <motion.circle r="2.5" fill="var(--color-primary)"
                initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0], cx: [x1, cx, x2], cy: [y1, cy, y2] }}
                transition={{ duration: 3.5, delay: i * 1.1, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 4px var(--color-primary))" }} />
            </g>
          );
        })}
      </motion.svg>

      <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
        {orbitSymbols.map(sym => {
          const rad = (sym.angle * Math.PI) / 180, orbit = r + 54;
          return (
            <motion.div key={sym.s} animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", left: `calc(50% + ${Math.cos(rad) * orbit}px)`, top: `calc(50% + ${Math.sin(rad) * orbit}px)`, transform: "translate(-50%,-50%)" }}
              className="font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/40">
              <div className="flex items-center gap-1 border border-foreground/15 bg-card/80 px-1.5 py-0.5 backdrop-blur-sm" style={{ backdropFilter: "blur(8px)" }}>
                <span className="h-1 w-1 bg-primary animate-pulse-dot" style={{ boxShadow: "0 0 4px var(--color-primary)" }} />
                {sym.s}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function LineReveal({ text, delay = 0, italic, uppercase }: { text: string; delay?: number; italic?: boolean; uppercase?: boolean }) {
  const display = uppercase ? text.toUpperCase() : text;
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span initial={{ y: "110%" }} animate={{ y: "0%" }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`inline-block ${italic ? "italic font-light" : ""}`}>
        {renderWithCoins(display)}
      </motion.span>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO INTRO
══════════════════════════════════════════════════════════════ */
function HeroIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const globeScale   = useTransform(scrollYProgress, [0, 1],      [1, 1.55]);
  const globeOpacity = useTransform(scrollYProgress, [0, 0.65, 1],[1, 0.15, 0]);
  const contentY     = useTransform(scrollYProgress, [0, 1],      [0, -70]);
  const contentOp    = useTransform(scrollYProgress, [0, 0.45],   [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] w-full overflow-hidden border-b border-border bg-background">
      <motion.div style={{ opacity: contentOp }}
        className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-border/35 px-6 py-4 label-eyebrow">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 5 }}>N° 001 — Protection</motion.span>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 5 }} className="hidden md:inline">TradeGuard · Discipline active</motion.span>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 5 }}><ClockDisplay /></motion.span>
      </motion.div>

      <motion.div style={{ scale: globeScale, opacity: globeOpacity }}
        className="absolute inset-0 flex items-center justify-center">
        <Globe />
      </motion.div>

      <motion.div style={{ opacity: contentOp, y: contentY }}
        className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 5 }} className="label-eyebrow mb-8">000 / Couverture</motion.div>

        <h1 className="font-display text-[50px] leading-[0.88] tracking-[-0.022em] md:text-[106px]">
          <LineReveal text="La discipline," delay={5.2} uppercase />
          <br />
          <LineReveal text="c'est ton edge." delay={5.45} italic uppercase />
        </h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 5.9 }}
          className="mt-7 max-w-[340px] text-[13px] leading-relaxed text-muted-foreground">
          Revenge trades, impulsions, checklists oubliées — détectés et bloqués en temps réel.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 6.3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="label-eyebrow">Défiler</span>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-7 w-px bg-foreground/28" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════════════ */
function Nav() {
  const { tick } = useSoundFx();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 border-b border-border transition-colors duration-300 ${scrolled ? "bg-background/92 backdrop-blur-md" : "bg-background"}`}>
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5" onMouseEnter={tick}>
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}
            className="h-2.5 w-2.5 bg-primary" style={{ boxShadow: "0 0 8px var(--color-primary)" }} />
          <span className="font-display text-[16px] tracking-wide">TradeGuard</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[12px] tracking-wide text-muted-foreground md:flex">
          {[["Fonctionnalités","#features"],["Classement","#classement"],["Tarifs","#tarifs"],["FAQ","#faq"]].map(([l, h]) => (
            <a key={l} href={h} className="underline-grow hover:text-foreground transition-colors duration-200" onMouseEnter={tick}>{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-[12px] text-muted-foreground hover:text-foreground sm:block underline-grow transition-colors" onMouseEnter={tick}>Connexion</Link>
          <MagneticButton>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ boxShadow: "0 0 20px oklch(0.565 0.237 24 / 0.35)" }}>
              Commencer <span className="font-mono text-[10px]">→</span>
            </Link>
          </MagneticButton>
        </div>
      </div>
    </motion.header>
  );
}

/* ══════════════════════════════════════════════════════════════
   DISCIPLINE DASHBOARD — 3D avec TiltCard + glow
══════════════════════════════════════════════════════════════ */
function DisciplineDashboard() {
  const logs = [
    { pair: "AAPL", type: "LONG",  entry: "228.14", tp: "235.00", sl: "225.00", pnl: "+2.95%",  up: true,  delay: 0   },
    { pair: "TSLA", type: "SHORT", entry: "242.07", tp: "232.00", sl: "248.00", pnl: "BLOQUÉ",   up: false, delay: 0.1 },
    { pair: "NVDA", type: "LONG",  entry: "126.55", tp: "136.00", sl: "122.00", pnl: "+1.74%",  up: true,  delay: 0.2 },
  ];
  const pts  = [8,12,11,15,19,17,23,27,25,32,36,33,42,48,45,54,60,67,64,74];
  const max  = Math.max(...pts);
  const W = 800, H = 110, step = W / (pts.length - 1);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${H - (p / max) * H}`).join(" ");

  return (
    <TiltCard className="w-full" intensity={6}>
      <div className="border border-foreground/10 bg-card"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px oklch(1 0 0 / 0.06), 0 0 40px oklch(0.565 0.237 24 / 0.06)" }}>

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="label-eyebrow">FIG. 01</span>
            <span className="text-[12px] font-medium">Session active — Matthieu R.</span>
          </div>
          <div className="flex items-center gap-1.5 label-eyebrow text-bear">
            <span className="h-1.5 w-1.5 animate-pulse-dot bg-bear" style={{ boxShadow: "0 0 4px var(--color-bear)" }} />REC
          </div>
        </div>

        <div className="grid gap-px bg-border md:grid-cols-3">
          {logs.map((l, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 1.3 + l.delay }}
              className={`bg-card p-5 ${l.pnl === "BLOQUÉ" ? "border-l-2 border-l-bear" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-medium">{l.pair}</span>
                <span className={`font-mono text-[9px] tracking-wider px-1.5 py-0.5 ${l.type === "LONG" ? "text-bull bg-bull/10" : "text-bear bg-bear/10"}`}>{l.type}</span>
              </div>
              <div className="mt-4 space-y-1.5 num text-[11px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Entrée</span><span>{l.entry}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">TP</span><span className="text-bull">{l.tp}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SL</span><span className="text-bear">{l.sl}</span></div>
              </div>
              <div className={`mt-4 border-t border-border pt-3 text-right num text-[12px] font-medium ${l.pnl === "BLOQUÉ" ? "text-bear" : l.up ? "text-bull" : "text-bear"}`}>
                {l.pnl === "BLOQUÉ" ? "REVENGE DÉTECTÉ" : l.pnl}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-border p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="label-eyebrow">FIG. 02 — Score discipline / 30j</span>
            <span className="num text-[11px] font-medium text-bull" style={{ textShadow: "0 0 8px var(--color-bull)" }}>+34 pts</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none">
            <defs>
              <filter id="glow-bull">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <motion.path d={path} stroke="var(--color-bull)" strokeWidth="1.5" fill="none"
              filter="url(#glow-bull)"
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
              viewport={{ once: true }} transition={{ duration: 2, delay: 0.3 }} />
            <motion.circle r="4" cx={(pts.length - 1) * step} cy={H - (pts[pts.length - 1] / max) * H}
              fill="var(--color-bull)"
              style={{ filter: "drop-shadow(0 0 6px var(--color-bull))" }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.2 }} />
          </svg>
        </div>
      </div>
    </TiltCard>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO — headline + floating metrics + dashboard 3D
══════════════════════════════════════════════════════════════ */
function Hero() {
  const { tick } = useSoundFx();
  const [revenge, setRevenge] = useState(1247);
  useEffect(() => {
    const t = setInterval(() => setRevenge(v => v + Math.floor(Math.random() * 3 + 1)), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative border-b border-border overflow-hidden">
      {/* Watermark 01 */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 select-none font-display leading-none text-foreground/[0.022] hidden xl:block" style={{ fontSize: "clamp(180px, 18vw, 260px)", lineHeight: 0.85 }}>01</div>

      <div className="relative mx-auto max-w-[1400px] px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <SectionLabel label="001 / Protection" />

        {/* HEADLINE */}
        <h1 className="font-display leading-[0.86] tracking-[-0.025em]" style={{ fontSize: "clamp(58px, 10.5vw, 136px)" }}>
          <span className="block overflow-hidden">
            <motion.span className="block" initial={{ y: "112%" }} animate={{ y: "0%" }}
              transition={{ duration: 0.72, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}>
              <ScrambleText text="ARRÊTE" delay={0.6} />
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block" initial={{ y: "112%" }} animate={{ y: "0%" }}
              transition={{ duration: 0.72, delay: 0.17, ease: [0.22, 1, 0.36, 1] }}>DE TE</motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="block italic font-light" initial={{ y: "112%" }} animate={{ y: "0%" }}
              transition={{ duration: 0.72, delay: 0.30, ease: [0.22, 1, 0.36, 1] }}>
              saboter.
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="caret-blink" />
            </motion.span>
          </span>
        </h1>

        <div className="mt-8"><DrawLine red delay={0.5} className="w-24" /></div>

        {/* Sub + CTAs */}
        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <Reveal delay={0.85} className="md:col-span-5" y={12}>
            <p className="text-[14px] leading-[1.7] text-muted-foreground">
              Détection revenge trades en temps réel. Checklist obligatoire avant chaque trade.
              Cooldown forcé. Score de discipline quotidien.
            </p>
          </Reveal>
          <Reveal delay={1.0} className="md:col-span-4 md:col-start-8 flex flex-col gap-2.5 self-end" y={12}>
            <MagneticButton>
              <Link href="/register"
                className="group inline-flex items-center justify-between gap-2 w-full bg-primary px-5 py-3.5 text-[13px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                style={{ boxShadow: "0 0 30px oklch(0.565 0.237 24 / 0.4)" }}
                onMouseEnter={tick}>
                Essai gratuit 7 jours
                <span className="font-mono arrow-slide text-[11px]">→</span>
              </Link>
            </MagneticButton>
            <Link href="#classement"
              className="inline-flex items-center justify-between gap-2 border border-foreground/18 px-5 py-3.5 text-[13px] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-200"
              onMouseEnter={tick}>
              Voir le classement
              <motion.span animate={{ y: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}
                className="font-mono inline-block text-[11px]">↓</motion.span>
            </Link>
          </Reveal>
        </div>

        {/* Meta strip */}
        <Reveal delay={1.1} className="mt-14">
          <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {[
              { k: "Statut", v: <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse-dot bg-bull" style={{ boxShadow: "0 0 4px var(--color-bull)" }} />En ligne</span> },
              { k: "Revenge aujourd'hui", v: <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>{revenge}</motion.span> },
              { k: "Traders protégés", v: "12 400+" },
              { k: "Latence détection", v: "0.8s" },
            ].map(({ k, v }) => (
              <div key={k} className="bg-card px-5 py-4 hover:bg-surface transition-colors cursor-default">
                <div className="label-eyebrow">{k}</div>
                <div className="mt-1 num text-[13px]">{v}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Dashboard 3D + floating metrics */}
        <Reveal delay={1.25} className="mt-14 relative" y={24}>
          {/* Floating metrics autour du dashboard */}
          <div className="hidden lg:block">
            <FloatingMetric label="Score discipline" value="99/100" delta="+8 pts" delay={0} className="-top-6 -left-4" />
            <FloatingMetric label="Streak actif" value="47 jours" delay={1.2} className="-top-4 -right-6" />
            <FloatingMetric label="Revenge bloqués" value="234" delta="-89%" delay={0.6} className="-bottom-4 -left-2" />
          </div>
          <DisciplineDashboard />
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   TICKER
══════════════════════════════════════════════════════════════ */
const tickerItems = [
  { s: "REVENGE DÉTECTÉ", p: "@mk_l · TSLA",    c: "BLOQUÉ",   up: false },
  { s: "SCORE",           p: "@aiko · 99/100",  c: "+8 pts",   up: true  },
  { s: "STREAK",          p: "@sofr_fx",         c: "47 jours", up: true  },
  { s: "COOLDOWN",        p: "@dv_idx",          c: "18:34",    up: false },
  { s: "CHECKLIST",       p: "@pierre_t · NVDA", c: "VALIDÉE",  up: true  },
  { s: "REVENGE DÉTECTÉ", p: "@ryu_t · SPY",     c: "BLOQUÉ",   up: false },
  { s: "SCORE",           p: "@clara_m · 95/100",c: "+12 pts",  up: true  },
  { s: "COOLDOWN",        p: "@j_trade",         c: "23:00",    up: false },
];
function Ticker() {
  const row = [...tickerItems, ...tickerItems];
  return (
    <div className="relative overflow-hidden border-b border-border bg-surface/40 py-2.5">
      <div className="flex w-max gap-10 animate-ticker font-mono text-[11px]">
        {row.map((it, i) => (
          <div key={i} className="flex items-center gap-2.5 whitespace-nowrap">
            <span className={`h-[5px] w-[5px] flex-shrink-0 ${it.up ? "bg-bull" : "bg-bear"}`} />
            <span className="text-muted-foreground uppercase tracking-[0.1em]">{it.s}</span>
            <span className="text-foreground num">{it.p}</span>
            <span className={`num font-medium ${it.up ? "text-bull" : "text-bear"}`}>{it.c}</span>
            <span className="text-foreground/12 mx-1">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BLOCK DEMO — "BLOQUÉ." cramoisi avec glow
══════════════════════════════════════════════════════════════ */
function BlockDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section ref={ref} className="relative border-b border-border overflow-hidden bg-background">
      {/* Glow cramoisi derrière le mot BLOQUÉ */}
      <motion.div
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 60% at 25% 50%, oklch(0.565 0.237 24 / 0.10) 0%, transparent 70%)" }} />

      <motion.div style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }} className="absolute top-0 left-0 right-0 h-[2px] bg-primary"
        style={{ boxShadow: "0 0 12px var(--color-primary)" } as React.CSSProperties} />

      <div className="relative mx-auto max-w-[1400px] px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-8">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }} className="flex items-center gap-3 mb-6">
              <span className="h-1.5 w-1.5 animate-pulse-dot bg-primary" style={{ boxShadow: "0 0 6px var(--color-primary)" }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Live detection · 0.8s</span>
              <span className="font-mono text-[10px] text-muted-foreground">TSLA SHORT · @mk_trades</span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.div initial={{ y: "105%" }} animate={inView ? { y: "0%" } : {}}
                transition={{ duration: 0.65, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-primary leading-[0.88] tracking-[-0.025em]"
                style={{ fontSize: "clamp(72px, 12vw, 160px)", textShadow: "0 0 60px oklch(0.565 0.237 24 / 0.4)" }}>
                BLOQUÉ.
              </motion.div>
            </div>

            <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="mt-7 max-w-[420px] text-[13px] text-muted-foreground leading-relaxed">
              Revenge trade détecté 0.8 seconde après la perte précédente. Trade TSLA SHORT bloqué
              automatiquement. Cooldown de 20 minutes activé.
            </motion.p>
          </div>

          <div className="md:col-span-4">
            {[
              { k: "Délai détecté",    v: "0.8s"  },
              { k: "Perte précédente", v: "−$347"  },
              { k: "Cooldown activé",  v: "20 min" },
              { k: "Capital protégé",  v: "$5 200" },
            ].map((item, i) => (
              <motion.div key={item.k}
                initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.45 + i * 0.08 }}
                className="border-b border-border py-4 flex items-center justify-between">
                <span className="label-eyebrow">{item.k}</span>
                <span className="num text-[14px] font-medium">{item.v}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.8 }} className="absolute bottom-0 left-0 right-0 h-px bg-primary/25" />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATS — chiffres full-width en 130px
══════════════════════════════════════════════════════════════ */
const stats = [
  { v: 89,    prefix: "−", suffix: "%", decimals: 0, k: "Revenge trades en moins sur 30 jours",  n: "01" },
  { v: 12400, prefix: "",  suffix: "+", decimals: 0, k: "Traders actifs sur la plateforme",       n: "02" },
  { v: 67,    prefix: "",  suffix: "%", decimals: 0, k: "Score de discipline moyen après 30j",    n: "03" },
  { v: 0.8,   prefix: "",  suffix: "s", decimals: 1, k: "Latence de détection en temps réel",     n: "04" },
];
function StatRow({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="group border-b border-border hover:bg-surface/30 transition-colors cursor-default">
      <DrawLine delay={index * 0.06} />
      <div className="mx-auto max-w-[1400px] px-6 py-6 md:py-8">
        <div className="flex items-center gap-6 md:gap-10">
          <span className="label-eyebrow text-muted-foreground/40 w-6 flex-shrink-0">{stat.n}</span>
          <div className="font-display leading-none tracking-[-0.04em] tabular-nums flex-shrink-0 text-foreground group-hover:text-primary transition-colors duration-300"
            style={{ fontSize: "clamp(56px, 9vw, 130px)" }}>
            <Counter value={stat.v} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
          </div>
          <div className="hidden md:block flex-1 h-px bg-foreground/8" />
          <span className="text-[13px] text-muted-foreground leading-relaxed md:w-64 flex-shrink-0 ml-auto md:ml-0">{stat.k}</span>
          <span className="font-mono text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ textShadow: "0 0 8px var(--color-primary)" }}>→</span>
        </div>
      </div>
    </motion.div>
  );
}
function Stats() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-6 pt-20 pb-4"><SectionLabel label="Résultats mesurés" /></div>
      {stats.map((s, i) => <StatRow key={s.k} stat={s} index={i} />)}
      <div className="h-16" />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════════════ */
const features = [
  { n: "01", title: "Score de discipline",  desc: "Un score 0–100 calculé chaque jour. Respect de tes règles, régularité, résultats réels. Pas de mensonge, juste les faits." },
  { n: "02", title: "Détection revenge",    desc: "Délai mesuré entre chaque perte et le trade suivant. Trop vite = drapeau rouge en 0.8s. Trade bloqué automatiquement." },
  { n: "03", title: "Checklist pré-trade",  desc: "Tes critères d'entrée, gravés dans le marbre. Validation obligatoire avant chaque trade. Impossible de contourner." },
  { n: "04", title: "Cooldown forcé",       desc: "Revenge détecté = trading suspendu 15–60 min. Tu reviens quand tu es calme, pas quand tu es en colère." },
  { n: "05", title: "Analytics avancées",   desc: "Win rate, R-multiple, drawdown, score Sharpe. Par trade, par actif, par session. Décide avec des données." },
  { n: "06", title: "Alertes temps réel",   desc: "Push notifications à l'instant où un pattern d'échec est détecté. Pause le trading depuis n'importe où." },
];
function Features() {
  const { tick } = useSoundFx();
  return (
    <section id="features" className="relative border-b border-border overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 select-none font-display leading-none text-foreground/[0.02] hidden xl:block" style={{ fontSize: "220px", lineHeight: 0.85 }}>02</div>
      <div className="relative mx-auto max-w-[1400px] px-6 py-24">
        <SectionLabel label="§ 02 / Fonctionnalités" />
        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <h2 className="font-display leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(34px, 3.6vw, 58px)" }}>
              {renderWithCoins("La boîte")}<br />{renderWithCoins("à outils,")}<br />
              <span className="italic font-light">du signal<br />{renderWithCoins("à la protection.")}</span>
            </h2>
            <p className="mt-6 text-[13px] text-muted-foreground leading-relaxed max-w-[255px]">
              Six mécanismes. Détection, blocage, checklist, cooldown, analytics, alertes.
            </p>
          </Reveal>
          <div className="md:col-span-8">
            {features.map((f, i) => (
              <div key={f.n}>
                <DrawLine delay={i * 0.04} />
                <Reveal delay={i * 0.055}>
                  <div className="group grid grid-cols-12 gap-6 py-6 -mx-3 px-3 hover:bg-surface/40 transition-colors cursor-default" onMouseEnter={tick}>
                    <div className="col-span-1 label-eyebrow pt-0.5">{f.n}</div>
                    <div className="col-span-8">
                      <h3 className="font-display text-[20px] tracking-wide group-hover:text-primary transition-colors duration-200">{f.title}</h3>
                      <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                    <div className="col-span-3 flex justify-end items-start pt-0.5">
                      <span className="font-mono text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ textShadow: "0 0 8px var(--color-primary)" }}>→</span>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
            <DrawLine delay={features.length * 0.04} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   CLASSEMENT
══════════════════════════════════════════════════════════════ */
const traders = [
  { name: "Matthieu K.", handle: "@mk_trades",  style: "Day trading", score: "99/100", streak: "47j", blocked: "234", initials: "MK" },
  { name: "Sofia R.",    handle: "@sofr_fx",    style: "Swing",       score: "97/100", streak: "31j", blocked: "187", initials: "SR" },
  { name: "Aiko T.",     handle: "@aiko_nvda",  style: "Scalping",    score: "95/100", streak: "28j", blocked: "156", initials: "AT" },
  { name: "David O.",    handle: "@dv_idx",     style: "Indices",     score: "93/100", streak: "24j", blocked: "142", initials: "DO" },
];
function Classement() {
  const { tick } = useSoundFx();
  return (
    <section id="classement" className="border-b border-border bg-surface/20">
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <SectionLabel label="§ 03 / Classement" />
        <div className="grid gap-14 md:grid-cols-12 mb-14">
          <Reveal className="md:col-span-6">
            <h2 className="font-display leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(34px, 3.6vw, 58px)" }}>
              Les traders<br /><span className="italic font-light">{renderWithCoins("les plus disciplinés.")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9 self-end">
            <p className="text-[13px] text-muted-foreground leading-relaxed">Mis à jour toutes les 24h. Score de discipline moyen sur 30 jours.</p>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <div className="border border-border bg-card" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}>
            <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface/30 px-6 py-3 label-eyebrow">
              <div className="col-span-1">#</div><div className="col-span-4">Trader</div>
              <div className="col-span-2">Style</div><div className="col-span-2 text-right">Score</div>
              <div className="col-span-1 text-right">Streak</div><div className="col-span-2 text-right">Bloqués</div>
            </div>
            {traders.map((t, i) => (
              <motion.div key={t.handle}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="group grid grid-cols-12 items-center gap-4 border-b border-border px-6 py-5 last:border-0 hover:bg-surface/40 transition-colors cursor-pointer"
                onMouseEnter={tick}>
                <div className="col-span-1 num text-[11px] text-muted-foreground">0{i+1}</div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-foreground/14 font-mono text-[10px] group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors" style={{ transitionProperty: "border-color, background-color, color" }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{t.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{t.handle}</div>
                  </div>
                </div>
                <div className="col-span-2 text-[12px] text-muted-foreground">{t.style}</div>
                <div className="col-span-2 text-right num text-[13px] font-medium text-bull">{t.score}</div>
                <div className="col-span-1 text-right num text-[12px] text-bull">{t.streak}</div>
                <div className="col-span-2 text-right num text-[12px] text-muted-foreground">{t.blocked}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRICING — 3 plans avec TiltCard sur le plan vedette
══════════════════════════════════════════════════════════════ */
const tiers = [
  {
    n: "01", name: "Gratuit", price: "$0", period: "pour toujours",
    desc: "Vois tes patterns, commence à te discipliner.",
    features: ["Journal illimité", "Checklist 3 questions", "Score quotidien", "Détection revenge", "Historique 30 jours"],
    cta: "Commencer", featured: false,
  },
  {
    n: "02", name: "Pro", price: "$19", period: "/ mois",
    desc: "Tout débloquer et protéger ton capital.",
    features: ["Tout le plan Gratuit", "Checklist illimitée", "Historique complet", "Streak & badges", "Export CSV/PDF", "Stats avancées", "Alertes cooldown"],
    cta: "Essai 7 jours gratuit", featured: true,
  },
  {
    n: "03", name: "Elite", price: "$49", period: "/ mois",
    desc: "Pour les traders sérieux qui gèrent du capital.",
    features: ["Tout le plan Pro", "Alertes SMS & push", "API accès complet", "Rapports PDF hebdo", "Manager dédié", "Stratégies custom"],
    cta: "Contacter", featured: false,
  },
];
function Pricing() {
  const { tick } = useSoundFx();
  return (
    <section id="tarifs" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <SectionLabel label="§ 04 / Tarifs" />
        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <h2 className="font-display leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(34px, 3.6vw, 58px)" }}>
              Plans simples.<br /><span className="italic font-light">Pas de surprises.</span>
            </h2>
            <p className="mt-6 text-[13px] text-muted-foreground leading-relaxed">Commence gratuitement. Upgrade quand tu veux. Résiliation à tout moment.</p>
          </Reveal>

          <div className="md:col-span-8 grid gap-px bg-border border border-border md:grid-cols-3">
            {tiers.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.09}>
                {t.featured ? (
                  <TiltCard className="h-full" intensity={5}>
                    <div className="relative flex flex-col h-full p-8 bg-surface-elevated"
                      style={{ boxShadow: "0 0 40px oklch(0.565 0.237 24 / 0.15), inset 0 0 0 1px oklch(1 0 0 / 0.08)" }}>
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" style={{ boxShadow: "0 0 12px var(--color-primary)" }} />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t.n} / {t.name}</span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-primary px-1.5 py-0.5" style={{ background: "oklch(0.565 0.237 24 / 0.12)" }}>Populaire</span>
                      </div>
                      <div className="mt-7">
                        <span className="font-display text-[52px] leading-none tracking-[-0.02em]">{t.price}</span>
                        <span className="ml-2 text-[11px] text-muted-foreground">{t.period}</span>
                      </div>
                      <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">{t.desc}</p>
                      <ul className="mt-7 space-y-2 text-[12px] flex-1">
                        {t.features.map(f => (
                          <li key={f} className="flex items-start gap-2.5">
                            <span className="mt-[8px] h-px w-2.5 flex-shrink-0 bg-primary/40" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="mt-9">
                        <Link href="/register"
                          className="block w-full py-3 px-4 text-center text-[12px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                          style={{ boxShadow: "0 0 20px oklch(0.565 0.237 24 / 0.4)" }}
                          onMouseEnter={tick}>{t.cta} →</Link>
                      </MagneticButton>
                    </div>
                  </TiltCard>
                ) : (
                  <div className="relative flex flex-col h-full p-8 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t.n} / {t.name}</span>
                    </div>
                    <div className="mt-7">
                      <span className="font-display text-[52px] leading-none tracking-[-0.02em]">{t.price}</span>
                      <span className="ml-2 text-[11px] text-muted-foreground">{t.period}</span>
                    </div>
                    <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">{t.desc}</p>
                    <ul className="mt-7 space-y-2 text-[12px] flex-1">
                      {t.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span className="mt-[8px] h-px w-2.5 flex-shrink-0 bg-foreground/20" />
                          <span className="text-foreground/80">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="mt-9">
                      <Link href="/register"
                        className="block w-full py-3 px-4 text-center text-[12px] font-medium border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
                        onMouseEnter={tick}>{t.cta} →</Link>
                    </MagneticButton>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════════ */
const faqs = [
  { q: "C'est quoi un revenge trade ?",        a: "Un trade passé par impulsion juste après une perte pour récupérer. TradeGuard mesure automatiquement le délai entre ta perte et ton trade suivant." },
  { q: "Comment fonctionne le cooldown ?",     a: "Revenge détecté = trading suspendu pour une durée configurée (15–60 min). Un bandeau rouge s'affiche. Aucun nouveau trade possible pendant ce temps." },
  { q: "Ça se connecte à mon broker ?",        a: "Non, c'est un journal manuel. La saisie consciente force la réflexion — c'est intentionnel, pas un manque de fonctionnalité." },
  { q: "Puis-je personnaliser la checklist ?", a: "Oui totalement. Tes règles, tes questions. Tu choisis lesquelles sont bloquantes avant de pouvoir saisir un trade." },
  { q: "Puis-je changer de plan ?",            a: "Oui à tout moment, sans friction. Pro annulé = retour automatique au plan Gratuit, immédiatement." },
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const { tick } = useSoundFx();
  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <SectionLabel label="§ 05 / FAQ" />
        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <h2 className="font-display leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(34px, 3.6vw, 58px)" }}>
              Questions<br /><span className="italic font-light">{renderWithCoins("fréquentes.")}</span>
            </h2>
          </Reveal>
          <div className="md:col-span-8">
            {faqs.map((f, i) => (
              <div key={i}>
                <DrawLine delay={i * 0.04} />
                <button onClick={() => { setOpen(open === i ? null : i); tick(); }}
                  className="group w-full flex items-start justify-between gap-6 py-5 text-left cursor-pointer">
                  <span className="text-[14px] font-medium group-hover:text-primary transition-colors duration-200">{f.q}</span>
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                    className="font-mono text-[16px] text-muted-foreground flex-shrink-0 mt-0.5">+</motion.span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                      <p className="pb-6 text-[13px] leading-relaxed text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <DrawLine delay={faqs.length * 0.04} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
function Footer() {
  const { tick } = useSoundFx();
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 bg-primary" style={{ boxShadow: "0 0 8px var(--color-primary)" }} />
              <span className="font-display text-[16px] tracking-wide">TradeGuard</span>
            </div>
            <p className="mt-5 text-[12px] text-muted-foreground leading-relaxed max-w-[235px]">
              Protection contre le revenge trading. Checklist, cooldown, score de discipline — tout en un.
            </p>
          </div>
          {[
            { n: "A", title: "Produit",    links: ["Fonctionnalités","Tarifs","Classement","Roadmap"] },
            { n: "B", title: "Entreprise", links: ["À propos","Blog","Carrières","Contact"] },
            { n: "C", title: "Légal",      links: ["Conditions","Confidentialité","Divulgation risques","Cookies"] },
          ].map(col => (
            <div key={col.n} className="md:col-span-2">
              <div className="label-eyebrow">{col.n} / {col.title}</div>
              <ul className="mt-4 space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-[12px] text-foreground/70 hover:text-primary transition-colors duration-200 underline-grow" onMouseEnter={tick}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <DrawLine className="mt-14 mb-5" />
        <div className="flex flex-col justify-between gap-2 font-mono text-[10px] text-muted-foreground/45 md:flex-row">
          <div>© 2025 TRADEGUARD — LE TRADING IMPLIQUE DES RISQUES. LES PERFORMANCES PASSÉES NE GARANTISSENT PAS LES RÉSULTATS FUTURS.</div>
          <div>v2.0 / BUILT IN EU</div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE ROOT — dark-theme
══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <ScrollProgressBar />
      <CursorDot />
      <GrainOverlay />

      <div className="dark-theme relative min-h-screen bg-background text-foreground">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 5 }}>
          <BackgroundDecor />
        </motion.div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 5, ease: [0.22, 1, 0.36, 1] }}>
            <Nav />
          </motion.div>

          <main>
            <HeroIntro />
            <Hero />
            <Ticker />
            <BlockDemo />
            <Stats />
            <Features />
            <Classement />
            <Pricing />
            <FAQ />
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
