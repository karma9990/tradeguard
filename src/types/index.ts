import type { User, Trade, ChecklistItem, CooldownSession, Plan, TradeSide } from "@/generated/prisma";

export type { Plan, TradeSide };

export type SafeUser = Omit<User, "password"> & {
  id: string;
};

export type TradeWithChecklist = Trade & {
  checklistResponses: {
    id: string;
    answer: boolean;
    checklistItem: ChecklistItem;
  }[];
};

export type DashboardStats = {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  revengeTrades: number;
  disciplineScore: number;
  streak: number;
};

export type CooldownStatus = {
  active: boolean;
  session: CooldownSession | null;
  remainingSeconds: number;
};
