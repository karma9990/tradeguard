"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Email ou mot de passe invalide");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Glass card */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      >
        {/* Specular */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
        />

        <div className="px-8 pt-10 pb-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div
              className="flex items-center justify-center h-14 w-14 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(52,211,153,0.9), rgba(16,185,129,0.7))",
                boxShadow: "0 0 24px rgba(52,211,153,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                border: "1px solid rgba(52,211,153,0.3)",
              }}
            >
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white tracking-tight">Content de te revoir</h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Connecte-toi à ton compte TradeGuard
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                Email
              </label>
              <Input
                type="email"
                placeholder="trader@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                Mot de passe
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(248,113,113,0.10)",
                  border: "1px solid rgba(248,113,113,0.20)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-2" loading={loading}>
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "#34d399" }}>
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
