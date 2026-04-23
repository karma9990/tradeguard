"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checklist", label: "Checklist", icon: ListChecks },
  { href: "/trades", label: "Trades", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
              active ? "text-emerald-300" : "text-white/40 hover:text-white/80"
            )}
            style={
              active
                ? {
                    background: "rgba(52,211,153,0.10)",
                    border: "1px solid rgba(52,211,153,0.15)",
                    backdropFilter: "blur(20px)",
                  }
                : { border: "1px solid transparent" }
            }
          >
            {/* Active indicator */}
            {active && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                style={{ background: "rgba(52,211,153,0.9)", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }}
              />
            )}

            <item.icon
              className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-emerald-400" : "text-white/30 group-hover:text-white/60")}
            />
            <span className="flex-1 font-medium">{item.label}</span>

            {active && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#34d399", boxShadow: "0 0 6px rgba(52,211,153,0.8)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
