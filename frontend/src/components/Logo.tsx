type LogoVariant = "icon" | "icon-sm" | "horizontal";

type LogoProps = {
  variant?: LogoVariant;
};

const sizes: Record<LogoVariant, { w: number; h: number; bar: number; gap: number; thick: number; rx: number; brk: number }> = {
  "icon":       { w: 200, h: 200, bar: 112, gap: 14, thick: 8, rx: 4, brk: 28 },
  "icon-sm":    { w: 28,  h: 28,  bar: 22,  gap: 3,  thick: 2, rx: 1, brk: 5 },
  "horizontal": { w: 56,  h: 64,  bar: 48,  gap: 8,  thick: 3, rx: 1.5, brk: 12 },
};

export function Logo({ variant = "icon" }: LogoProps) {
  const s = sizes[variant];

  // 6 bars = 6 yao lines, exactly matching the original Pulse design
  const barCount = 6;
  const brokenIdx = 2; // 3rd bar from top is broken (yin yao)

  const totalH = barCount * s.thick + (barCount - 1) * s.gap;
  const y0 = Math.round((s.h - totalH) / 2);
  const x0 = Math.round((s.w - s.bar) / 2);

  const barY = (i: number) => y0 + i * (s.thick + s.gap);
  const halfPiece = Math.round((s.bar - s.brk) / 2);

  const barEls = [];
  for (let i = 0; i < barCount; i++) {
    const y = barY(i);
    if (i === brokenIdx) {
      barEls.push(
        <g key={i}>
          <rect x={x0} y={y} width={halfPiece} height={s.thick} rx={s.rx} />
          <rect x={x0 + halfPiece + s.brk} y={y} width={halfPiece} height={s.thick} rx={s.rx} />
        </g>
      );
    } else {
      barEls.push(
        <rect key={i} x={x0} y={y} width={s.bar} height={s.thick} rx={s.rx} />
      );
    }
  }

  if (variant === "horizontal") {
    return (
      <span className="logo logo-horizontal" aria-label="AI易经">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${Math.round(s.w)} ${Math.round(s.h)}`}
          width={Math.round(s.w)}
          height={Math.round(s.h)}
          fill="none"
        >
          <g fill="currentColor">{barEls}</g>
        </svg>
        <span className="logo-wordmark">
          <span className="logo-ai">AI</span>
          <span className="logo-yijing">易经</span>
        </span>
      </span>
    );
  }

  return (
    <span className="logo" aria-label="易境">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${Math.round(s.w)} ${Math.round(s.h)}`}
        width={Math.round(s.w)}
        height={Math.round(s.h)}
        fill="none"
      >
        <g fill="currentColor">{barEls}</g>
      </svg>
    </span>
  );
}
