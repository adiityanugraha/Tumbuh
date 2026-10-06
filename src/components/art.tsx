// PLACEHOLDER: ilustrasi SVG sederhana (maskot, tanaman, pot, awan). Diganti/dipoles di Fase 4.
import type { GrowthStage } from "@/lib/types";

/** Kumbi, kumbang tukang kebun. Maskot orisinal. */
export function Mascot({ size = 80, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} role="img" aria-label="Kumbi si kumbang">
      <ellipse cx="40" cy="48" rx="24" ry="22" fill="#2e7d4f" />
      <path d="M40 27v43" stroke="#1d5235" strokeWidth="3" />
      <circle cx="30" cy="44" r="4" fill="#ffd56b" />
      <circle cx="50" cy="44" r="4" fill="#ffd56b" />
      <circle cx="33" cy="58" r="3" fill="#ffd56b" />
      <circle cx="47" cy="58" r="3" fill="#ffd56b" />
      <circle cx="40" cy="24" r="14" fill="#b85c38" />
      <circle cx="35" cy="22" r="3.5" fill="#fff" />
      <circle cx="45" cy="22" r="3.5" fill="#fff" />
      <circle cx="35.6" cy="22.6" r="1.8" fill="#2a2b2e" />
      <circle cx="45.6" cy="22.6" r="1.8" fill="#2a2b2e" />
      <path d="M35 29q5 4 10 0" stroke="#2a2b2e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M33 12q-6-8-12-6M47 12q6-8 12-6" stroke="#2a2b2e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M27 14h26l-4-8H31z" fill="#f4b63f" />
      <rect x="24" y="13" width="32" height="4" rx="2" fill="#b97f0f" />
    </svg>
  );
}

/** Pot gerabah bermotif kawung. */
export function Pot({ width = 220 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.55} viewBox="0 0 120 66" aria-hidden="true">
      <path d="M10 8h100l-12 58H22z" fill="#b85c38" />
      <rect x="4" y="2" width="112" height="14" rx="7" fill="#7f3b21" />
      <g fill="none" stroke="#f8e3d6" strokeWidth="1.6" opacity=".8">
        {[40, 80].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="34" rx="4" ry="6" />
            <ellipse cx={x} cy="50" rx="4" ry="6" />
            <ellipse cx={x - 8} cy="42" rx="6" ry="4" />
            <ellipse cx={x + 8} cy="42" rx="6" ry="4" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Tanaman sesuai tahap tumbuh. Layu: daun cokelat dan batang merunduk. */
export function PlantArt({
  stage,
  color,
  wilted = false,
  size = 210,
}: {
  stage: GrowthStage;
  color: string;
  wilted?: boolean;
  size?: number;
}) {
  const leaf = wilted ? "#a8925c" : "#3f9a5f";
  const stem = wilted ? "#8a7a4a" : "#2e7d4f";
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 130 150"
      role="img"
      aria-label={`Tanaman tahap ${stage}${wilted ? ", sedang layu" : ""}`}
      style={wilted ? { transform: "rotate(-8deg)", transformOrigin: "50% 100%" } : undefined}
    >
      {stage === "bibit" && (
        <>
          <ellipse cx="65" cy="146" rx="34" ry="8" fill="#7f3b21" opacity=".5" />
          <path d="M65 146v-16" stroke={stem} strokeWidth="5" strokeLinecap="round" />
          <path d="M65 132c-10 0-16-6-16-12 8 0 16 4 16 12zM65 130c9 0 14-6 14-11-7 0-14 4-14 11z" fill={leaf} />
        </>
      )}
      {stage === "tunas" && (
        <>
          <path d="M65 150V96" stroke={stem} strokeWidth="5" strokeLinecap="round" />
          <path d="M65 124c-24 0-34-14-34-28 18 0 34 11 34 28zM65 108c20 0 30-12 30-24-15 0-30 9-30 24z" fill={leaf} />
        </>
      )}
      {stage === "tumbuh" && (
        <>
          <path d="M65 150V40" stroke={stem} strokeWidth="6" strokeLinecap="round" />
          <path
            d="M65 100c-30 0-44-18-44-36 22 0 44 14 44 36zM65 78c26 0 40-16 40-32-20 0-40 12-40 32zM65 55c-18 0-28-12-28-24 14 0 28 10 28 24z"
            fill={leaf}
          />
          <circle cx="65" cy="34" r="9" fill={wilted ? "#c9a46a" : "#f4b63f"} />
        </>
      )}
      {stage === "berbunga" && (
        <>
          <path d="M65 150V50" stroke={stem} strokeWidth="6" />
          <path d="M65 110c-28 0-40-16-40-32 20 0 40 12 40 32zM65 90c24 0 36-14 36-28-18 0-36 10-36 28z" fill={leaf} />
          <g transform="translate(65 40)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-17" rx="11" ry="15" fill={color} stroke="#7f3b21" strokeWidth="1.5" transform={`rotate(${a})`} />
            ))}
            <circle r="10" fill="#f4b63f" stroke="#7f3b21" strokeWidth="1.5" />
          </g>
        </>
      )}
    </svg>
  );
}

/** Awan mega mendung berlapis, direntangkan selebar wadah. */
export function MegaMendung({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 110" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 0h1200v64c-30 0-36-20-66-20-34 0-34 26-70 26-30 0-34-18-64-18s-36 30-76 30-40-24-72-24-34 18-66 18-34-22-64-22-38 28-74 28-36-20-68-20-30 16-62 16-38-26-70-26-34 22-66 22-30-14-60-14-40 26-74 26-34-22-64-22-30 18-60 18-34-24-64-24S20 64 0 64z"
        fill="#ddeffc"
      />
      <path
        d="M0 0h1200v40c-26 0-30-14-56-14-28 0-28 18-58 18-26 0-30-12-56-12s-32 22-64 22-34-18-60-18-28 12-56 12-30-16-56-16-32 20-62 20-30-14-56-14-26 12-52 12-32-18-58-18-30 16-56 16-26-10-52-10-34 18-62 18-28-16-54-16-26 12-50 12-30-16-54-16S18 40 0 40z"
        fill="#8cc4f0"
      />
      <path
        d="M0 0h1200v20c-22 0-24-8-46-8-24 0-24 10-48 10s-24-6-46-6-28 12-54 12-28-10-50-10-24 8-48 8-26-10-48-10-28 12-52 12-26-8-48-8-22 6-44 6-28-10-50-10-26 10-48 10-22-6-44-6-30 10-52 10-24-10-46-10-22 8-42 8-26-10-46-10S16 20 0 20z"
        fill="#2f80c9"
      />
    </svg>
  );
}

const ICONS = {
  kebun: (
    <>
      <path d="M12 21v-8M12 13c0-4 3-7 7-7 0 4-3 7-7 7zM12 15c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 21h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  belajar: (
    <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5c-.8 0-1.5.7-1.5 1.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5.7 1.5 1.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  ),
  peta: <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  koleksi: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M17 13l1.2 2.5 2.8.4-2 1.9.5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-1.9 2.8-.4z" fill="currentColor" />
    </>
  ),
  speaker: (
    <>
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};

export function Icon({ name, size = 26 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
