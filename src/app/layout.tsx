import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { AnimatedBackground } from "@/components/ui/animated-background";
import "./globals.css";
import localFont from "next/font/local";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

/* ── Display : Barlow Condensed — condensé ultra-bold, italic natif
   Parfait pour les headlines "ARRÊTE / DE TE / saboter." + "BLOQUÉ."
   Couverture complète latin-ext (accents français) ── */
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

/* ── Body : DM Sans — grotesque propre, professionnel, lisible à toutes tailles
   Système complet : Light → Bold, accents français inclus ── */
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

/* ── Mono : QuantroSans — données, labels, ticker financier ── */
const quantro = localFont({
  src: [{ path: "../../public/fonts/QuantroSansMedium-e97wn.ttf", weight: "500", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradeGuard — Arrête de te saboter",
  description: "Détection revenge trades, checklist pré-trade, score de discipline. Stop l'impulsion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn("h-full", barlowCondensed.variable, dmSans.variable, quantro.variable)}>
      <body className="min-h-full antialiased">

        {/* ── Background animé MeshGradient + overlays ── */}
        <AnimatedBackground />

        <div className="relative" style={{ zIndex: 1 }}>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
