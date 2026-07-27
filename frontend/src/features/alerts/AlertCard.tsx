import type { Alert } from "../../types";

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const TYPE_LABELS: Record<string, string> = {
  phishing: "Phishing",
  breach: "Breach",
  scam: "Scam",
  crime: "Crime",
  accident: "Accident",
  disaster: "Disaster",
  outage: "Outage",
  general: "General",
};

const CLASSIFICATION_LABEL: Record<string, { label: string; textCls: string; bgCls: string }> = {
  verified:   { label: "Verified",   textCls: "text-verified",   bgCls: "bg-verified-light" },
  noise:      { label: "Noise",      textCls: "text-noise",      bgCls: "bg-noise-light"    },
  unreviewed: { label: "Unreviewed", textCls: "text-unreviewed", bgCls: "bg-unreviewed-light" },
};

export default function AlertCard({ alert, onViewDetails }: AlertCardProps) {
  const ts = new Date(alert.created_at);
  const timeStr = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = ts.toLocaleDateString([], { month: "short", day: "numeric" });

  const cls = CLASSIFICATION_LABEL[alert.classification] ?? CLASSIFICATION_LABEL.unreviewed;
  const stripeCls = `stripe-${alert.classification}`;
  const barCls = `bar-${alert.classification}`;
  const confidencePct = Math.round(alert.ai_confidence * 100);

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow pl-0 overflow-hidden flex ${stripeCls}`}>
      <div className="flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">{alert.title}</h3>
          <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls.bgCls} ${cls.textCls}`}>
            {cls.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-400 tabular-nums">{dateStr} · {timeStr}</span>
          {(alert.neighborhood || alert.city) && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {alert.neighborhood && alert.city
                  ? `${alert.neighborhood}, ${alert.city}`
                  : alert.neighborhood || alert.city}
              </span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {alert.description}
        </p>

        {/* Action summary */}
        {alert.action_summary && (
          <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
            {alert.action_summary}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-4">
          {/* Type chip */}
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">
            {TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
          </span>

          {/* Confidence bar */}
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${barCls}`} style={{ width: `${confidencePct}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 tabular-nums w-9 text-right">
              {confidencePct}%
            </span>
          </div>

          {/* AI method */}
          <span className={`text-[11px] font-medium ${alert.ai_method === "groq_ai" ? "text-emerald-600" : "text-slate-400"}`}>
            {alert.ai_method === "groq_ai" ? "AI" : "Rules"}
          </span>
        </div>

        {/* Details button */}
        <button
          onClick={() => onViewDetails(alert.id)}
          className="mt-4 w-full py-2 text-sm font-medium text-accent bg-accent-light hover:bg-indigo-100 rounded-lg transition-colors"
        >
          View details
        </button>
      </div>
    </div>
  );
}
