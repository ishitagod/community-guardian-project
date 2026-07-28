import { useState } from "react";
import type { AlertFilters } from "../../types";

interface FilterBarProps {
  filters: AlertFilters;
  onChange: (filters: AlertFilters) => void;
  onReport: () => void;
}

export default function FilterBar({ filters, onChange, onReport }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (field: keyof AlertFilters, value: any) => {
    onChange({ ...filters, [field]: value || undefined });
  };

  return (
    <div className="bg-white border-b border-slate-200 px-7 py-4">
      {/* Search + actions row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search alerts…"
            value={filters.keyword || ""}
            onChange={(e) => handleChange("keyword", e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            expanded
              ? "border-accent text-accent bg-accent-light"
              : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
        </button>

        <button
          onClick={onReport}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Report
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          {[
            {
              label: "Classification",
              field: "classification" as keyof AlertFilters,
              options: [
                { value: "", label: "All" },
                { value: "verified", label: "Verified" },
                { value: "noise", label: "Noise" },
                { value: "unreviewed", label: "Unreviewed" },
              ],
            },
            {
              label: "Type",
              field: "alert_type" as keyof AlertFilters,
              options: [
                { value: "", label: "All types" },
                { value: "phishing", label: "Phishing" },
                { value: "breach", label: "Breach" },
                { value: "scam", label: "Scam" },
                { value: "crime", label: "Crime" },
                { value: "accident", label: "Accident" },
                { value: "disaster", label: "Disaster" },
                { value: "outage", label: "Outage" },
                { value: "general", label: "General" },
              ],
            },
            {
              label: "Severity",
              field: "severity" as keyof AlertFilters,
              options: [
                { value: "", label: "All levels" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ],
            },
          ].map(({ label, field, options }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {label}
              </label>
              <select
                value={(filters[field] as string) || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-slate-700"
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
