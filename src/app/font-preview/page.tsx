"use client";

// Une entrée par famille (police la plus représentative)
const fonts: { name: string; file: string }[] = [
  { name: "Amesta",                  file: "Amesta-BF69a1028e2ddd5.otf" },
  { name: "Angeris Stitched",        file: "AngerisStitched-Regular_demo-BF69ddfb2f3308f.otf" },
  { name: "Anmox",                   file: "Anmox-KV95o.ttf" },
  { name: "Arton Regular",           file: "Arton-Regular-BF69afa5ef6ed53.otf" },
  { name: "Arton Slant",             file: "Arton-Slant-BF69afa5efa9c4c.otf" },
  { name: "Astoin",                  file: "Astoin-lx0Wy.ttf" },
  { name: "Aurora",                  file: "Aurora-BF69a7a70e182ce.ttf" },
  { name: "Basenji",                 file: "Basenji-SemiBold.otf" },
  { name: "Biarty",                  file: "Biarty-Regular-BF69bf4bb2c0835.otf" },
  { name: "Bigase",                  file: "BigaseRegular-m2e9G.ttf" },
  { name: "Blone",                   file: "Blone-BF69ccb117b2366.otf" },
  { name: "Boundt",                  file: "Boundt.otf" },
  { name: "Brezo",                   file: "BrezoRegular-PVEgP.ttf" },
  { name: "Bubblu",                  file: "BUBBLU-Regular-BF69dca68ae6002.otf" },
  { name: "Bunko",                   file: "Bunko.otf" },
  { name: "Burnian",                 file: "Burnian-BF69cd323bf1a89.otf" },
  { name: "Captain",                 file: "Captain-BF69cbcb48ab341.otf" },
  { name: "Castelle",                file: "Castelle-PERSONAL-USE-ONLY.ttf" },
  { name: "Chamer Black",            file: "Chamer-Black.ttf" },
  { name: "Chamer Medium",           file: "Chamer-Medium.ttf" },
  { name: "Cluster Edge",            file: "ClusterEdge-Semibold.otf" },
  { name: "Combe",                   file: "Combe-BF69dc74b9b7182.otf" },
  { name: "Committed",               file: "Committed-BF69dfc80cd1714.ttf" },
  { name: "Corva Bold Inside",       file: "CorvaBoldInsideRegular-wonp6.otf" },
  { name: "Corva Round",             file: "CorvaRoundRegular-drmwZ.otf" },
  { name: "Cranity",                 file: "Cranity-BF69c89550bf722.otf" },
  { name: "Crosa",                   file: "CrosaRegular-q2OV6.ttf" },
  { name: "Enghola",                 file: "Enghola.ttf" },
  { name: "Etgea Bold",              file: "EtgeaBold-1jALL.ttf" },
  { name: "Evential",                file: "Evential-BF69dd0cbec4070.otf" },
  { name: "GC Skined",               file: "GC-Skined-Demo-BF69ba660ad987c.ttf" },
  { name: "GC Akihiko Regular",      file: "GCAkihikoDemo-Regular-BF69e0975868fd8.ttf" },
  { name: "GC Akihiko Bold",         file: "GCAkihikoDemo-Bold-BF69e09757d1553.ttf" },
  { name: "GC Dooze Regular",        file: "GCDoozeDemo-Regular-BF69d4da89afc81.ttf" },
  { name: "GC Dooze Bold",           file: "GCDoozeDemo-Bold-BF69d4da89a01e4.ttf" },
  { name: "GC Magnu Regular",        file: "GCMagnuDemo-Regular-BF69b9235e9a373.ttf" },
  { name: "GC Magnu Bold",           file: "GCMagnuDemo-Bold-BF69b9235e59dc0.ttf" },
  { name: "GC Monza Regular",        file: "GCMonzaSansDemo-Regular-BF69a0a8aa284ed.ttf" },
  { name: "GC Monza Bold Cond.",     file: "GCMonzaSansDemo-BoldCondensed-BF69a0a8a782f75.ttf" },
  { name: "GC Monza Expanded",       file: "GCMonzaSansDemo-Expanded-BF69a0a8a6ea41f.ttf" },
  { name: "GC Neue Rumble Regular",  file: "GCNeueRumbleDemo-Regular-BF69d4daec8a6b2.ttf" },
  { name: "GC Neue Rumble Bold",     file: "GCNeueRumbleDemo-Bold-BF69d4daec151fa.ttf" },
  { name: "GODAM",                   file: "GODAM.otf" },
  { name: "Gadey",                   file: "Gadey-5yG4z.ttf" },
  { name: "Gatilca Regular",         file: "Gatilca-Regular.otf" },
  { name: "Gatilca Bold",            file: "Gatilca-Bold.otf" },
  { name: "Genttomy",                file: "Genttomy.ttf" },
  { name: "Gevora",                  file: "GevoraRegular-yYR2q.ttf" },
  { name: "Glavia",                  file: "GlaviaDEMO-Regular-BF69a5bb3cc5a50.ttf" },
  { name: "Gonela",                  file: "Gonela-BF69db85b8ea0d0.otf" },
  { name: "Goodhers Hooney",         file: "Goodhershooney-OGaXo.otf" },
  { name: "Grand Canyon",            file: "Grand-Canyon-Free-BF69cfcaacf122b.otf" },
  { name: "Grand Meta",              file: "GrandMetaRegular-OGa6d.ttf" },
  { name: "Griche",                  file: "Griche.otf" },
  { name: "Grityle",                 file: "GrityleBlack-2vAZo.otf" },
  { name: "Groopa",                  file: "Groopa-2vJje.otf" },
  { name: "GW Lazor Regular",        file: "GwLazorRegularTrial-3l3ez.otf" },
  { name: "GW Lazor Condensed",      file: "GwLazorCondensedTrial-Zp1wK.otf" },
  { name: "Harper",                  file: "Harper-BF69de5a624ffb5.otf" },
  { name: "Heightall",               file: "Heightall-BF69b58602b5e60.otf" },
  { name: "Heroic",                  file: "Heroic-BF69de59c81af21.otf" },
  { name: "Hinroda",                 file: "Hinroda-Demo-BF69ca699f36f09.otf" },
  { name: "Hobsky",                  file: "HobskyDEMO-BF69d47c5c95726.otf" },
  { name: "IT Kroxen Regular",       file: "ITKroxenDemo-Regular.otf" },
  { name: "IT Kroxen Black",         file: "ITKroxenDemo-Black.otf" },
  { name: "IT Monelix",              file: "ITMonelixDemo-Regular.otf" },
  { name: "IT Seron Regular",        file: "ITSeronDemo-Regular.otf" },
  { name: "IT Seron Italic",         file: "ITSeronDemo-Italic.otf" },
  { name: "Jengah",                  file: "Jengah-Demo-BF69c7718cdbd44.otf" },
  { name: "Johnsun",                 file: "Johnsun-BF69b26afb3b4b4.otf" },
  { name: "Karis",                   file: "KarisDemoRegular-OGaPp.otf" },
  { name: "Kelantis",                file: "KelantisDEMO-Regular-BF69d8edb42e4c4.ttf" },
  { name: "Keratus",                 file: "KeratusMedium-G3Lza.ttf" },
  { name: "Khelyn",                  file: "Khelyn.ttf" },
  { name: "LT Verola",               file: "LTVerolaFreeforpersonaluse-Regular.otf" },
  { name: "Linkage",                 file: "Linkage-Free-BF69bae0f445c1e.otf" },
  { name: "Louvere",                 file: "Louvere-PERSONAL-USE-ONLY.ttf" },
  { name: "Macrola",                 file: "Macrola-DEMO-BF69aebeb2c52bf.ttf" },
  { name: "Meganors",                file: "Meganors.ttf" },
  { name: "Meltdown",                file: "Meltdown-BF69b664821cce2.ttf" },
  { name: "Merica Futurist Regular", file: "MericaFuturistRegular_PERSONAL_USE_ONLY.otf" },
  { name: "Merica Futurist Black",   file: "MericaFuturistBlack_PERSONAL_USE_ONLY.otf" },
  { name: "Minims",                  file: "Minims-Regular.ttf" },
  { name: "Mision",                  file: "Mision.ttf" },
  { name: "Modinova",                file: "Modinova-SemiBold.ttf" },
  { name: "Molekt",                  file: "Molekt-MAeEx.otf" },
  { name: "Monvera",                 file: "Monvera-BF69cfd3df2cd11.otf" },
  { name: "Morica Regular",          file: "Morica-Regular-BF69afa5784a481.otf" },
  { name: "Morica Slant",            file: "Morica-Slant-BF69afa5785799c.otf" },
  { name: "Nakila",                  file: "NakilaRegular-ovax4.ttf" },
  { name: "Naria",                   file: "NariaRegular-Jpojm.ttf" },
  { name: "Neotheric",               file: "NeothericDEMO-BF69b5868176565.ttf" },
  { name: "Neueral Regular",         file: "Neueral-Regular.otf" },
  { name: "Neueral ExtraLight",      file: "neueral-extralight.ttf" },
  { name: "Nexsa",                   file: "Nexsa-PERSONAL-USE-ONLY.ttf" },
  { name: "Nocpro",                  file: "Nocpro-Demo-BF69ce222b8f1fc.otf" },
  { name: "Norvas Expanded",         file: "NorvasDEMO-Expanded-BF69ac49c02b921.ttf" },
  { name: "Novera",                  file: "Novera-BF69b26c3779ac2.otf" },
  { name: "OBLISK",                  file: "OBLISK.otf" },
  { name: "Otfits Grotesk",          file: "Otfits-Grotesk-Reg-Trial.otf" },
  { name: "Over Heat",               file: "Over-Heat-DEMO-BF69baa32743a50.ttf" },
  { name: "Palgea",                  file: "Palgea-BF69a7dc095d2bb.otf" },
  { name: "Petrichor",               file: "PetrichorDEMO-Regular-BF69dc56e0cc81c.ttf" },
  { name: "Pingled",                 file: "Pingled-nA0Z4.otf" },
  { name: "Povlar",                  file: "Povlar-Demo-BF69b22aa436033.ttf" },
  { name: "Povlar Slant",            file: "Povlar-Slant-Demo-BF69b22aa44278e.ttf" },
  { name: "Qebica",                  file: "Qebica.otf" },
  { name: "Qilargo",                 file: "Qilargo-Demo-BF69c4e5a1ae64c.otf" },
  { name: "Quantro Sans",            file: "QuantroSansMedium-e97wn.ttf" },
  { name: "Quinget Med. Cond.",      file: "Quinget-MediumCondensed-BF69ce32b8e3f87.otf" },
  { name: "Prime Serif",             file: "RCL-Prime-Serif-Demo-Regular-BF69a69b28c8c6e.ttf" },
  { name: "Radets",                  file: "RadetsMedium-j9o0v.ttf" },
  { name: "Raisket",                 file: "Raisket-Regular-BF69def80793a19.otf" },
  { name: "Redifine Regular",        file: "Redifine-BF69d680eccef7e.ttf" },
  { name: "Redifine Bold",           file: "Redifine-Bold-BF69d680ecaf4cd.ttf" },
  { name: "Remva",                   file: "Remva.otf" },
  { name: "Revold",                  file: "RevoldFreeVersion.otf" },
  { name: "Rockan",                  file: "Rockan-BF69de59fc0a855.otf" },
  { name: "Rodeas",                  file: "Rodeas-BF69c9f0b9e6484.otf" },
  { name: "Romano",                  file: "Romano-PERSONAL-USE-ONLY.ttf" },
  { name: "Roygen",                  file: "Roygen-DEMO-VERSION-BF69d9ac3aaa335.otf" },
  { name: "SFT Schrifted Round",     file: "SFTSchriftedRoundTRIAL-Regular.ttf" },
  { name: "SFT Schrifted Blk",       file: "SFTSchriftedRoundTRIAL-Black.ttf" },
  { name: "SFT Schrifted Comp.",     file: "SFTSchriftedRoundTRIAL-CompBold.ttf" },
  { name: "SIPPER",                  file: "SIPPER.otf" },
  { name: "Schales",                 file: "SchalesDEMO-Regular-BF69bffe89ea014.ttf" },
  { name: "Sicelka",                 file: "Sicelka-BF69df03e38e205.otf" },
  { name: "Sixseven",                file: "Sixseven-BF69b41cbb8faa3.ttf" },
  { name: "Skewrom",                 file: "Skewrom-Regular-BF69a96df8ede31.otf" },
  { name: "Stalfolk",                file: "Stalfolk-Demo-BF69b7a9712cb43.otf" },
  { name: "TBJ Gobank Regular",      file: "TBJGobankDemo-Regular-BF69cb9fd8808f8.ttf" },
  { name: "TBJ Gobank Bold",         file: "TBJGobankDemo-Bold-BF69cb9fd8955e2.ttf" },
  { name: "TBJ Fonder",              file: "TBJ-Fonder-Demo-BF69d6501e6450d.ttf" },
  { name: "TBJ Moder",               file: "TBJ-Moder-Demo-BF69e0f092d0c83.ttf" },
  { name: "Timaday",                 file: "Timaday.otf" },
  { name: "Unytour Pro",             file: "UnytourPro-SemiBold.otf" },
  { name: "Valcore",                 file: "Valcore-BF69d723d89e2cf.otf" },
  { name: "Vanelo",                  file: "VaneloDEMO-Regular-BF69d8eb2af3fe4.ttf" },
  { name: "Voltra",                  file: "Voltra-PERSONAL-USE-ONLY.ttf" },
  { name: "Gregory Text",            file: "Gregory-Text-Regular-Demo.ttf" },
  { name: "Gregory Text Bold",       file: "Gregory-Text-Bold-Demo.ttf" },
  { name: "YOBAGE",                  file: "YOBAGE.otf" },
  { name: "Wolfsschanze",            file: "ZaiWolfsschanzeTypewriter-nAWpO.ttf" },
];

const SAMPLE = "Arrête de te saboter. La discipline c'est ton edge.";
const SAMPLE_SHORT = "TradeGuard — Discipline";

export default function FontPreviewPage() {
  return (
    <div style={{ background: "#f0efed", minHeight: "100vh", padding: "32px 24px", fontFamily: "sans-serif" }}>
      <style>{fonts.map(f => `@font-face { font-family: "f-${f.file}"; src: url("/fonts/${f.file}"); font-display: swap; }`).join("\n")}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999" }}>
          TradeGuard · {fonts.length} polices
        </p>
        <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
          Clique sur une police pour noter son nom
        </p>
      </div>

      {/* Grille */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {fonts.map((f) => (
          <div
            key={f.file}
            style={{ background: "#fff", padding: "20px 22px", cursor: "default", borderLeft: "2px solid transparent" }}
            onMouseEnter={e => (e.currentTarget.style.borderLeft = "2px solid #e02020")}
            onMouseLeave={e => (e.currentTarget.style.borderLeft = "2px solid transparent")}
          >
            {/* Nom */}
            <p style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbb", marginBottom: 10 }}>
              {f.name}
            </p>

            {/* Grand specimen */}
            <p style={{ fontFamily: `"f-${f.file}"`, fontSize: 36, lineHeight: 1.0, color: "#0a0a0a", marginBottom: 8, letterSpacing: "-0.01em" }}>
              {SAMPLE_SHORT}
            </p>

            {/* Phrase complète plus petite */}
            <p style={{ fontFamily: `"f-${f.file}"`, fontSize: 14, lineHeight: 1.5, color: "#444" }}>
              {SAMPLE}
            </p>

            {/* Chiffres et labels */}
            <p style={{ fontFamily: `"f-${f.file}"`, fontSize: 12, color: "#888", marginTop: 8, letterSpacing: "0.08em" }}>
              SCORE 99/100 · STREAK 47J · 0.8s · 12 400+
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
