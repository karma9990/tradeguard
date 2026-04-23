import { TradeSide } from "@/generated/prisma";

export interface ParsedTrade {
  ticker: string;
  side: TradeSide;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  entryAt: Date;
  exitAt?: Date;
  notes?: string;
}

type BrokerFormat = "ibkr" | "alpaca" | "td_ameritrade" | "robinhood" | "generic";

function detectFormat(headers: string[]): BrokerFormat {
  const h = headers.map((s) => s.toLowerCase().trim());
  if (h.includes("ib order id") || h.includes("exec id")) return "ibkr";
  if (h.includes("order id") && h.includes("filled qty")) return "alpaca";
  if (h.includes("transaction id") && h.includes("description")) return "td_ameritrade";
  if (h.includes("activity date") && h.includes("instrument")) return "robinhood";
  return "generic";
}

function parseSide(raw: string): TradeSide {
  const s = raw.toUpperCase().trim();
  if (s === "BUY" || s === "BOT" || s === "B") return TradeSide.BUY;
  if (s === "SELL" || s === "SLD" || s === "S") return TradeSide.SELL;
  if (s === "LONG") return TradeSide.LONG;
  if (s === "SHORT") return TradeSide.SHORT;
  return TradeSide.BUY;
}

function parseDate(raw: string): Date {
  const d = new Date(raw.replace(",", ""));
  if (!isNaN(d.getTime())) return d;
  // Try DD/MM/YYYY
  const parts = raw.split("/");
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return new Date();
}

export function parseCSV(csvText: string): ParsedTrade[] {
  const lines = csvText.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const format = detectFormat(headers);
  const trades: ParsedTrade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = values[idx] ?? ""));

    try {
      const trade = parseRow(row, format);
      if (trade) trades.push(trade);
    } catch {
      // skip malformed rows
    }
  }

  return trades;
}

function parseRow(
  row: Record<string, string>,
  format: BrokerFormat
): ParsedTrade | null {
  // Generic fallback column names
  const ticker =
    row["Symbol"] || row["Ticker"] || row["symbol"] || row["ticker"] || "";
  if (!ticker) return null;

  const side = parseSide(
    row["Action"] ||
      row["Side"] ||
      row["Buy/Sell"] ||
      row["side"] ||
      row["action"] ||
      "BUY"
  );

  const quantity = parseFloat(
    row["Quantity"] || row["Qty"] || row["quantity"] || "0"
  );
  const entryPrice = parseFloat(
    row["Price"] ||
      row["Entry Price"] ||
      row["T. Price"] ||
      row["price"] ||
      "0"
  );
  const exitPrice =
    parseFloat(row["Exit Price"] || row["exit_price"] || "0") || undefined;
  const pnl =
    parseFloat(
      row["Realized P&L"] ||
        row["P&L"] ||
        row["pnl"] ||
        row["Realized P/L"] ||
        "0"
    ) || undefined;

  const entryAt = parseDate(
    row["Date/Time"] ||
      row["Date"] ||
      row["Entry Date"] ||
      row["date"] ||
      row["Activity Date"] ||
      new Date().toISOString()
  );

  return {
    ticker: ticker.toUpperCase(),
    side,
    quantity: Math.abs(quantity),
    entryPrice,
    exitPrice,
    pnl,
    entryAt,
    notes: row["Notes"] || row["Description"] || undefined,
  };
}
