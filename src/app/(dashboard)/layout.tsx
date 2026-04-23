import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, LogOut } from "lucide-react";
import { CooldownBanner } from "@/components/cooldown/cooldown-banner";
import { NavLinks } from "@/components/nav-links";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const initials = (session.user?.name ?? session.user?.email ?? "T")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Glass sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center justify-center h-9 w-9 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(52,211,153,0.9), rgba(16,185,129,0.7))",
              boxShadow: "0 0 16px rgba(52,211,153,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          >
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-[15px]">TradeGuard</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(52,211,153,0.6)" }}>
              Discipline
            </div>
          </div>
        </div>

        {/* Nav */}
        <NavLinks />

        {/* User */}
        <div
          className="p-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(52,211,153,0.7), rgba(16,185,129,0.5))",
                border: "1px solid rgba(52,211,153,0.3)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate font-medium">{session.user?.name ?? "Trader"}</p>
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{session.user?.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-white/[0.06]"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CooldownBanner />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
