import clsx from "clsx";

const STATUS_MAP = {
  verified: { label: "AI VERIFIED", color: "#1FAE6B", ring: "stroke-signal-green" },
  needs_review: { label: "NEEDS REVIEW", color: "#E8A23D", ring: "stroke-signal-amber" },
  failed: { label: "FAILED", color: "#E5484D", ring: "stroke-signal-red" },
  not_verified: { label: "NOT VERIFIED", color: "#8A93A6", ring: "stroke-signal-grey" }
};

export default function TrustBadge({ score = 0, status = "not_verified", size = 64 }) {
  const meta = STATUS_MAP[status] || STATUS_MAP.not_verified;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-black/10"
            strokeWidth={5}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={meta.color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-medium">
          {score}
        </div>
      </div>
      <div className="flex flex-col">
        <span
          className={clsx("font-mono text-[11px] tracking-wider font-medium")}
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
        <span className="text-xs text-black/40 font-mono">TRUST SCORE</span>
      </div>
    </div>
  );
}
