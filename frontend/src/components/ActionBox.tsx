import type { Classification } from "../types";

interface ActionBoxProps {
  classification: Classification;
  actionSummary: string;
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconMinus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const STYLES: Record<Classification, { border: string; iconCls: string; Icon: () => JSX.Element }> = {
  verified:   { border: "border-verified/30 bg-verified-light",       iconCls: "text-verified",   Icon: IconCheck },
  noise:      { border: "border-noise/30 bg-noise-light",             iconCls: "text-noise",      Icon: IconMinus },
  unreviewed: { border: "border-unreviewed/30 bg-unreviewed-light",   iconCls: "text-unreviewed", Icon: IconInfo  },
};

export default function ActionBox({ classification, actionSummary }: ActionBoxProps) {
  const s = STYLES[classification] ?? STYLES.unreviewed;

  return (
    <div className={`border ${s.border} rounded-lg p-3.5 flex gap-3`}>
      <span className={`${s.iconCls} flex-shrink-0 mt-0.5`}><s.Icon /></span>
      <p className="text-sm text-slate-700 leading-relaxed">{actionSummary}</p>
    </div>
  );
}
