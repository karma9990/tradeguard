"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TradeForm } from "@/components/trades/trade-form";
import { formatCurrency } from "@/lib/utils";
import { Upload, Plus, AlertTriangle, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface Trade {
  id: string;
  ticker: string;
  side: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  pnl: number | null;
  entryAt: string;
  isRevengeFlagged: boolean;
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

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadTrades() {
    const res = await fetch("/api/trades?limit=20");
    const data = await res.json();
    setTrades(data.trades);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => { loadTrades(); }, []);

  function onTradeAdded() {
    setShowForm(false);
    loadTrades();
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trades</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {total} trade{total !== 1 ? "s" : ""} enregistré{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/trades/import">
            <Button variant="outline" size="sm">
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Log Trade
          </Button>
        </div>
      </div>

      {showForm && (
        <TradeForm onSuccess={onTradeAdded} onCancel={() => setShowForm(false)} />
      )}

      {/* Trade list */}
      <GlassPanel>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold text-white">Trades récents</h2>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Chargement...</p>
          </div>
        )}

        {!loading && trades.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <div
              className="flex items-center justify-center h-12 w-12 rounded-2xl mx-auto mb-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <TrendingUp className="h-5 w-5" style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Aucun trade encore</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Enregistre ton premier trade ou importe un CSV.</p>
          </div>
        )}

        {trades.length > 0 && (
          <div>
            {trades.map((trade, i) => {
              const isBuy = trade.side === "BUY" || trade.side === "LONG";
              const isPnlPositive = trade.pnl !== null && trade.pnl >= 0;

              return (
                <div
                  key={trade.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-all"
                  style={{
                    borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Direction icon */}
                  <div
                    className="flex items-center justify-center h-9 w-9 rounded-xl shrink-0"
                    style={{
                      background: isBuy ? "rgba(52,211,153,0.10)" : "rgba(248,113,113,0.10)",
                      border: isBuy ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(248,113,113,0.15)",
                    }}
                  >
                    {isBuy
                      ? <TrendingUp className="h-4 w-4" style={{ color: "#34d399" }} />
                      : <TrendingDown className="h-4 w-4" style={{ color: "#f87171" }} />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm tracking-wide">{trade.ticker}</span>

                      {/* Side badge */}
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider"
                        style={isBuy
                          ? { background: "rgba(52,211,153,0.10)", color: "#34d399", border: "1px solid rgba(52,211,153,0.20)" }
                          : { background: "rgba(248,113,113,0.10)", color: "#f87171", border: "1px solid rgba(248,113,113,0.20)" }
                        }
                      >
                        {trade.side}
                      </span>

                      {/* Revenge badge */}
                      {trade.isRevengeFlagged && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider"
                          style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Revenge
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {trade.quantity} × ${trade.entryPrice}
                      {trade.exitPrice ? ` → $${trade.exitPrice}` : " (ouvert)"}
                    </p>
                  </div>

                  {/* P&L + date */}
                  <div className="text-right shrink-0">
                    {trade.pnl !== null ? (
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: isPnlPositive ? "#34d399" : "#f87171" }}
                      >
                        {isPnlPositive ? "+" : ""}{formatCurrency(trade.pnl)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        <Clock className="h-3 w-3" />
                        Ouvert
                      </span>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                      {new Date(trade.entryAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
