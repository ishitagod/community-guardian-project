import { useState, useEffect } from "react";
import { getAlert } from "../../api/alerts";
import Badge from "../../components/Badge";
import ActionBox from "../../components/ActionBox";
import type { Alert } from "../../types";

interface AlertDetailViewProps {
  id: number;
  onClose: () => void;
}

export default function AlertDetailView({ id, onClose }: AlertDetailViewProps) {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checklist, setChecklist] = useState<string[]>([]);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await getAlert(id);
        setAlert(res.data);
        if (res.data.checklist) {
          setChecklist(res.data.checklist.checklist_items);
        }
      } catch (err) {
        console.error("Failed to load alert:", err);
        setError("Failed to load alert details");
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [id]);

  const Overlay = ({ children }: { children: React.ReactNode }) => (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );

  if (loading) {
    return (
      <Overlay>
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Loading…
          </div>
        </div>
      </Overlay>
    );
  }

  if (error || !alert) {
    return (
      <Overlay>
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm">
          <p className="text-noise font-medium mb-4">{error || "Alert not found"}</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors">
            Close
          </button>
        </div>
      </Overlay>
    );
  }

  const ts = new Date(alert.created_at);
  const dateStr = ts.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
  const timeStr = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const confidencePct = Math.round(alert.ai_confidence * 100);
  const stripeCls = `stripe-${alert.classification}`;
  const barCls = `bar-${alert.classification}`;

  return (
    <Overlay>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden ${stripeCls}`}>
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-slate-800 leading-snug" style={{ textWrap: "balance" }}>
              {alert.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1 tabular-nums">{dateStr} · {timeStr}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge label="Status" type="classification" value={alert.classification} />
            <Badge label="Severity" type="severity" value={alert.severity} />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 uppercase tracking-wide">
              {alert.alert_type}
            </span>
            {(alert.neighborhood || alert.city) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {alert.neighborhood && alert.city
                  ? `${alert.neighborhood}, ${alert.city}`
                  : alert.neighborhood || alert.city}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full report</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">
              {alert.description}
            </p>
          </div>

          {/* Action */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended action</p>
            <ActionBox classification={alert.classification} actionSummary={alert.action_summary} />
          </div>

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Security checklist</p>
              <ul className="space-y-2.5">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-verified-light text-verified flex items-center justify-center text-[10px] font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Classification details */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Classification details</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-slate-600">Confidence</span>
                  <span className="text-sm font-semibold text-slate-700 tabular-nums">{confidencePct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${barCls}`} style={{ width: `${confidencePct}%` }} />
                </div>
              </div>
              <div>
                <span className="text-sm text-slate-600">Classified by </span>
                <span className={`text-sm font-semibold ${alert.ai_method === "groq_ai" ? "text-emerald-600" : "text-slate-500"}`}>
                  {alert.ai_method === "groq_ai" ? "Groq AI" : "Rule-based fallback"}
                </span>
              </div>
              {alert.ai_reasoning && (
                <p className="text-xs text-slate-500 italic leading-relaxed pt-1 border-t border-slate-200">
                  {alert.ai_reasoning}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
