"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/trades/import", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Import failed");
      return;
    }

    const data = await res.json();
    setResult(data);
  }

  const brokers = [
    { name: "Interactive Brokers", columns: "Symbol, Buy/Sell, Quantity, T. Price, Date/Time" },
    { name: "Alpaca", columns: "symbol, side, qty, price, date" },
    { name: "TD Ameritrade", columns: "Symbol, Action, Quantity, Price, Date" },
    { name: "Robinhood", columns: "Instrument, Side, Quantity, Price, Activity Date" },
    { name: "Generic", columns: "Ticker/Symbol, Side/Action, Quantity/Qty, Price, Date" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/trades">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Import Trades</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Upload a CSV file from your broker
          </p>
        </div>
      </div>

      {result ? (
        <Card className="border-emerald-800">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-100">Import Successful</h2>
            <p className="text-zinc-400 mt-2">
              {result.imported} trade{result.imported !== 1 ? "s" : ""} imported
            </p>
            <Button onClick={() => router.push("/trades")} className="mt-6">
              View Trades
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors bg-zinc-800/50">
                  <input
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-zinc-200">{file.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">
                        Click to select or drag and drop
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">CSV files only</p>
                    </div>
                  )}
                </label>

                {error && (
                  <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={loading} disabled={!file} className="w-full">
                  Import Trades
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supported Brokers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {brokers.map((b) => (
                  <div key={b.name} className="p-3 rounded-lg bg-zinc-800">
                    <p className="text-sm font-medium text-zinc-200">{b.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono">{b.columns}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
