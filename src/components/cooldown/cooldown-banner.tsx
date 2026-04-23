"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, X, Clock } from "lucide-react";

export function CooldownBanner() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const fetchCooldown = useCallback(async () => {
    const res = await fetch("/api/cooldown");
    if (!res.ok) return;
    const data = await res.json();
    setActive(data.active);
    setRemainingSeconds(data.remainingSeconds);
    setSessionId(data.session?.id ?? null);
  }, []);

  useEffect(() => {
    fetchCooldown();
    const poll = setInterval(fetchCooldown, 5000);
    return () => clearInterval(poll);
  }, [fetchCooldown]);

  useEffect(() => {
    if (!active || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) { setActive(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, remainingSeconds]);

  async function dismiss() {
    if (!sessionId) return;
    await fetch("/api/cooldown", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sessionId }),
    });
    setActive(false);
  }

  if (!active) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "rgba(185,28,28,0.25)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderBottom: "1px solid rgba(248,113,113,0.2)",
        boxShadow: "inset 0 1px 0 rgba(248,113,113,0.15), 0 4px 24px rgba(185,28,28,0.3)",
      }}
    >
      {/* Specular */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.4), transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4">
        {/* Icon */}
        <div
          className="flex items-center justify-center h-8 w-8 rounded-xl shrink-0 animate-pulse"
          style={{
            background: "rgba(248,113,113,0.15)",
            border: "1px solid rgba(248,113,113,0.25)",
          }}
        >
          <ShieldAlert className="h-4 w-4" style={{ color: "#f87171" }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight" style={{ color: "#fca5a5" }}>
            Revenge trade détecté — Cooldown actif
          </p>
          <p className="text-xs truncate" style={{ color: "rgba(248,113,113,0.6)" }}>
            Trade placé trop vite après une perte. Pause et respire.
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{
              background: "rgba(185,28,28,0.3)",
              border: "1px solid rgba(248,113,113,0.2)",
            }}
          >
            <Clock className="h-3.5 w-3.5" style={{ color: "#f87171" }} />
            <span className="font-mono text-sm font-bold tabular-nums" style={{ color: "#fca5a5" }}>
              {display}
            </span>
          </div>
          <button
            onClick={dismiss}
            className="flex items-center justify-center h-7 w-7 rounded-lg transition-all"
            style={{ color: "rgba(248,113,113,0.5)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(248,113,113,0.1)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(248,113,113,0.5)";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
