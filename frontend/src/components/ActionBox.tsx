import type { Classification } from "../types";

interface ActionBoxProps {
  classification: Classification;
  actionSummary: string;
}

const STYLES: Record<Classification, { border: string; icon: string; iconCls: string }> = {
  verified:   { border: "border-verified/30 bg-verified-light", icon: "✓", iconCls: "text-verified" },
  noise:      { border: "border-noise/30 bg-noise-light",       icon: "–", iconCls: "text-noise"    },
  unreviewed: { border: "border-unreviewed/30 bg-unreviewed-light", icon: "?", iconCls: "text-unreviewed" },
};

export default function ActionBox({ classification, actionSummary }: ActionBoxProps) {
  const s = STYLES[classification] ?? STYLES.unreviewed;

  return (
    <div className={`border ${s.border} rounded-lg p-3.5 flex gap-3`}>
      <span className={`${s.iconCls} text-base font-bold flex-shrink-0 mt-0.5`}>{s.icon}</span>
      <p className="text-sm text-slate-700 leading-relaxed">{actionSummary}</p>
    </div>
  );
}
