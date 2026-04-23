"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  question: string;
  required: boolean;
}

interface TradeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }}
      />
      {children}
    </div>
  );
}

export function TradeForm({ onSuccess, onCancel }: TradeFormProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [ticker, setTicker] = useState("");
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [pnl, setPnl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"checklist" | "trade">("checklist");

  useEffect(() => {
    fetch("/api/checklist")
      .then((r) => r.json())
      .then((items: ChecklistItem[]) => {
        setChecklist(items);
        if (items.length === 0) setStep("trade");
      });
  }, []);

  const allRequiredAnswered = checklist
    .filter((i) => i.required)
    .every((i) => answers[i.id] === true);

  function proceedToTrade() {
    if (!allRequiredAnswered) {
      setError("Tu dois répondre OUI à toutes les questions obligatoires.");
      return;
    }
    setError("");
    setStep("trade");
  }

  async function submitTrade(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const checklistResponses = checklist.map((i) => ({
      checklistItemId: i.id,
      answer: answers[i.id] ?? false,
    }));

    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker, side,
        quantity: parseFloat(quantity),
        entryPrice: parseFloat(entryPrice),
        exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
        pnl: pnl ? parseFloat(pnl) : undefined,
        entryAt: new Date().toISOString(),
        notes, checklistResponses,
      }),
    });

    if (res.status === 423) {
      const data = await res.json();
      setError(`Cooldown actif jusqu'à ${new Date(data.cooldownEndsAt).toLocaleTimeString("fr-FR")}. Éloigne-toi de l'écran.`);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Impossible d'enregistrer le trade");
      setLoading(false);
      return;
    }
    onSuccess();
  }

  return (
    <GlassPanel>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <span className="font-semibold text-white text-sm">
          {step === "checklist" ? "Checklist pré-trade" : "Enregistrer un trade"}
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full transition-all"
            style={{ background: step === "checklist" ? "#34d399" : "rgba(255,255,255,0.15)", boxShadow: step === "checklist" ? "0 0 6px rgba(52,211,153,0.6)" : "none" }}
          />
          <div
            className="h-2 w-2 rounded-full transition-all"
            style={{ background: step === "trade" ? "#34d399" : "rgba(255,255,255,0.15)", boxShadow: step === "trade" ? "0 0 6px rgba(52,211,153,0.6)" : "none" }}
          />
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Checklist step */}
        {step === "checklist" && (
          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex-1">
                  <p className="text-sm text-white/80">{item.question}</p>
                  {item.required && (
                    <span className="inline-block mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider" style={{ background: "rgba(251,146,60,0.12)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}>
                      Obligatoire
                    </span>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setAnswers((a) => ({ ...a, [item.id]: true }))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={answers[item.id] === true
                      ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)", boxShadow: "0 0 8px rgba(52,211,153,0.2)" }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Oui
                  </button>
                  <button
                    onClick={() => setAnswers((a) => ({ ...a, [item.id]: false }))}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={answers[item.id] === false
                      ? { background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Non
                  </button>
                </div>
              </div>
            ))}

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.20)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
              <Button onClick={proceedToTrade} className="flex-1" disabled={checklist.length === 0}>
                Continuer →
              </Button>
            </div>
          </div>
        )}

        {/* Trade step */}
        {step === "trade" && (
          <form onSubmit={submitTrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Ticker</label>
                <Input placeholder="AAPL" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Direction</label>
                <Select value={side} onChange={(e) => setSide(e.target.value)}>
                  <option value="BUY">BUY / LONG</option>
                  <option value="SELL">SELL / SHORT</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Quantité</label>
                <Input type="number" placeholder="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" step="any" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Prix d'entrée</label>
                <Input type="number" placeholder="150.00" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} min="0" step="any" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Prix de sortie</label>
                <Input type="number" placeholder="155.00" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} min="0" step="any" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>P&L</label>
                <Input type="number" placeholder="500.00" value={pnl} onChange={(e) => setPnl(e.target.value)} step="any" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Notes</label>
              <Textarea placeholder="Quel était ton setup ? Qu'as-tu remarqué ?" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.20)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("checklist")} className="flex-1">← Retour</Button>
              <Button type="submit" loading={loading} className="flex-1">Enregistrer</Button>
            </div>
          </form>
        )}
      </div>
    </GlassPanel>
  );
}
