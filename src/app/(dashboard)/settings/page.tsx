"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap } from "lucide-react";

interface UserSettings {
  revengeWindowMinutes: number;
  cooldownMinutes: number;
  plan: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    revengeWindowMinutes: 10,
    cooldownMinutes: 15,
    plan: "FREE",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.revengeWindowMinutes) setSettings(data);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function upgrade() {
    setUpgrading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setUpgrading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-zinc-400" />
          Settings
        </h1>
      </div>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Plan
            <Badge variant={settings.plan === "PRO" ? "default" : "secondary"}>
              {settings.plan}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings.plan === "FREE" ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Upgrade to Pro for unlimited trades, advanced analytics, and priority support.
              </p>
              <Button onClick={upgrade} loading={upgrading}>
                <Zap className="h-4 w-4" />
                Upgrade to Pro — $29/month
              </Button>
            </div>
          ) : (
            <p className="text-sm text-emerald-400">
              You&apos;re on the Pro plan. All features unlocked.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Risk settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discipline Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="window">Revenge Trading Window (minutes)</Label>
              <Input
                id="window"
                type="number"
                min={1}
                max={120}
                value={settings.revengeWindowMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    revengeWindowMinutes: parseInt(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-zinc-500">
                A trade placed within this window after a loss is flagged as a revenge trade.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cooldown">Cooldown Duration (minutes)</Label>
              <Input
                id="cooldown"
                type="number"
                min={1}
                max={240}
                value={settings.cooldownMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    cooldownMinutes: parseInt(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-zinc-500">
                Duration of the forced cooldown after a revenge trade is detected.
              </p>
            </div>

            <Button type="submit" loading={loading}>
              {saved ? "Saved!" : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
