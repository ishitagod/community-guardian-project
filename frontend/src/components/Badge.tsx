import type { Classification, Severity } from "../types";

interface BadgeProps {
  label: string;
  type: "classification" | "severity";
  value: Classification | Severity;
}

const CLASSIFICATION_STYLES: Record<string, string> = {
  verified:   "bg-verified-light text-verified",
  noise:      "bg-noise-light text-noise",
  unreviewed: "bg-unreviewed-light text-unreviewed",
};

const SEVERITY_STYLES: Record<string, string> = {
  high:   "bg-noise-light text-noise",
  medium: "bg-unreviewed-light text-unreviewed",
  low:    "bg-slate-100 text-slate-500",
};

export default function Badge({ label, type, value }: BadgeProps) {
  const cls = type === "classification"
    ? (CLASSIFICATION_STYLES[value] ?? "bg-slate-100 text-slate-500")
    : (SEVERITY_STYLES[value] ?? "bg-slate-100 text-slate-500");

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}: {value}
    </span>
  );
}
