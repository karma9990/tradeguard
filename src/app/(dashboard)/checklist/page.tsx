"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Plus, Trash2, GripVertical } from "lucide-react";

interface ChecklistItem {
  id: string;
  question: string;
  required: boolean;
  order: number;
  active: boolean;
}

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/checklist")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setAdding(true);
    const res = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQuestion.trim() }),
    });
    const item = await res.json();
    setItems((prev) => [...prev, item]);
    setNewQuestion("");
    setAdding(false);
  }

  async function removeItem(id: string) {
    await fetch("/api/checklist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function toggleRequired(item: ChecklistItem) {
    const updated = await fetch("/api/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, required: !item.required }),
    }).then((r) => r.json());
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-emerald-400" />
          Pre-Trade Checklist
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          These questions must be answered before logging any trade.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && (
            <p className="text-zinc-500 text-sm py-4 text-center">Loading...</p>
          )}
          {!loading && items.length === 0 && (
            <p className="text-zinc-500 text-sm py-4 text-center">
              No checklist items yet. Add your first question below.
            </p>
          )}
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700 group"
            >
              <GripVertical className="h-4 w-4 text-zinc-600 shrink-0" />
              <span className="text-zinc-400 text-xs w-4 shrink-0">{idx + 1}</span>
              <p className="flex-1 text-sm text-zinc-200">{item.question}</p>
              <button
                onClick={() => toggleRequired(item)}
                className="shrink-0"
                title="Toggle required"
              >
                <Badge variant={item.required ? "default" : "secondary"}>
                  {item.required ? "Required" : "Optional"}
                </Badge>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addItem} className="flex gap-3">
            <Input
              placeholder="e.g. Is my risk/reward at least 1:2?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" loading={adding} disabled={!newQuestion.trim()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
