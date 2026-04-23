import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateDisciplineScore } from "@/lib/discipline-calculator";
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Flame, Target } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { startOfDay, endOfDay } from "date-fns";

async function getDashboardData(userId: string) {
  const today = new Date();
  const [allTrades, todayTrades, discipline] = await Promise.all([
    db.trade.findMany({ where: { userId }, select: { pnl: true, isRevengeFlagged: true } }),
    db.trade.findMany({ where: { userId, createdAt: { gte: startOfDay(today), lte: endOfDay(today) } }, select: { pnl: true } }),
    calculateDisciplineScore(userId, today),
  ]);
  const closed = allTrades.filter((t: { pnl: number | null; isRevengeFlagged: boolean }) => t.pnl !== null);
  const wins = closed.filter((t: { pnl: number | null }) => (t.pnl ?? 0) > 0);
  const totalPnl = closed.reduce((s: number, t: { pnl: number | null }) => s + (t.pnl ?? 0), 0);
  const todayPnl = todayTrades.reduce((s: number, t: { pnl: number | null }) => s + (t.pnl ?? 0), 0);
  return {
    totalTrades: allTrades.length,
    winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
    totalPnl, todayPnl,
    revengeTrades: allTrades.filter((t: { isRevengeFlagged: boolean }) => t.isRevengeFlagged).length,
    discipline,
  };
}

function GlassPanel({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        ...style,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
      />
      {children}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const isGood = score >= 80;
  const isMid = score >= 60;
  const strokeColor = isGood ? "#34d399" : isMid ? "#facc15" : "#f87171";
  const glowColor = isGood ? "rgba(52,211,153,0.4)" : isMid ? "rgba(250,204,21,0.4)" : "rgba(248,113,113,0.4)";
  const textColor = isGood ? "#34d399" : isMid ? "#facc15" : "#f87171";
  const label = isGood ? "Excellent" : isMid ? "Good" : "Needs work";

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <div className="relative w-32 h-32">
        {/* Glow behind ring */}
        <div
          className="absolute inset-4 rounded-full"
          style={{ background: glowColor, filter: "blur(16px)", opacity: 0.5 }}
        />
        <svg className="relative w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={strokeColor} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${strokeColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-3xl font-bold tabular-nums leading-none" style={{ color: textColor }}>{score}</span>
          <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>/100</span>
        </div>
      </div>
      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: textColor }}>{label}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData(session!.user!.id as string);
  const isOnTrack = data.discipline.score >= 70;

  const breakdown = [
    { label: "No revenge trades", value: data.discipline.breakdown.noRevengeTrades, max: 33, color: "#34d399", glow: "rgba(52,211,153,0.5)" },
    { label: "Checklist completion", value: data.discipline.breakdown.checklistCompletion, max: 34, color: "#60a5fa", glow: "rgba(96,165,250,0.5)" },
    { label: "Consistency bonus", value: data.discipline.breakdown.consistencyBonus, max: 33, color: "#c084fc", glow: "rgba(192,132,252,0.5)" },
  ];

  const stats = [
    {
      label: "Total P&L",
      value: formatCurrency(data.totalPnl),
      icon: data.totalPnl >= 0 ? TrendingUp : TrendingDown,
      color: data.totalPnl >= 0 ? "#34d399" : "#f87171",
      sub: `Aujourd'hui: ${formatCurrency(data.todayPnl)}`,
    },
    {
      label: "Win Rate",
      value: formatPercent(data.winRate),
      icon: Target,
      color: data.winRate >= 50 ? "#34d399" : "#facc15",
      sub: `${data.totalTrades} trades au total`,
    },
    {
      label: "Revenge Trades",
      value: data.revengeTrades.toString(),
      icon: AlertTriangle,
      color: data.revengeTrades > 0 ? "#f87171" : "#34d399",
      sub: data.revengeTrades === 0 ? "Aucun — parfait" : "À éviter",
    },
    {
      label: "Streak",
      value: `${data.discipline.streak}j`,
      icon: Flame,
      color: data.discipline.streak > 0 ? "#fb923c" : "rgba(255,255,255,0.3)",
      sub: "Jours discipline ≥ 70",
    },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Ton aperçu de discipline de trading</p>
      </div>

      {/* Score card */}
      <GlassPanel>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center h-7 w-7 rounded-lg"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}
            >
              <ShieldCheck className="h-4 w-4" style={{ color: "#34d399" }} />
            </div>
            <span className="font-semibold text-white">Score de discipline du jour</span>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={isOnTrack
              ? { background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }
              : { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }
            }
          >
            {isOnTrack ? "On track ✓" : "At risk ⚠"}
          </span>
        </div>

        <div className="px-6 py-6 flex items-center gap-10">
          <ScoreRing score={data.discipline.score} />
          <div className="flex-1 space-y-4">
            {breakdown.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)" }} className="tabular-nums font-medium">
                    {item.value}<span style={{ color: "rgba(255,255,255,0.2)" }}>/{item.max}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(item.value / item.max) * 100}%`,
                      background: item.color,
                      boxShadow: `0 0 8px ${item.glow}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassPanel key={stat.label} className="px-5 py-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
              <div
                className="flex items-center justify-center h-7 w-7 rounded-lg"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}
              >
                <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{stat.sub}</p>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
