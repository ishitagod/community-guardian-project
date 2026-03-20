import { useState } from "react";
import type {
  AlertFilters,
  Classification,
  Severity,
  AlertType,
} from "../../types";

interface FilterBarProps {
  filters: AlertFilters;
  onChange: (filters: AlertFilters) => void;
  onReport: () => void;
}

export default function FilterBar({
  filters,
  onChange,
  onReport,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (field: keyof AlertFilters, value: any) => {
    onChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  return (
    <div className="p-5 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Filters & Search
        </h3>
        <button
          onClick={onReport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Report Alert
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={filters.keyword || ""}
          onChange={(e) => handleChange("keyword", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Toggles */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {expanded ? "▼ Hide Filters" : "▶ Show Filters"}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Classification Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classification
            </label>
            <select
              value={filters.classification || ""}
              onChange={(e) =>
                handleChange("classification", e.target.value as Classification)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="verified">Verified</option>
              <option value="noise">Noise</option>
              <option value="unreviewed">Unreviewed</option>
            </select>
          </div>

          {/* Alert Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Type
            </label>
            <select
              value={filters.alert_type || ""}
              onChange={(e) =>
                handleChange("alert_type", e.target.value as AlertType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="phishing">Phishing</option>
              <option value="breach">Breach</option>
              <option value="scam">Scam</option>
              <option value="crime">Crime</option>
              <option value="accident">Accident</option>
              <option value="disaster">Disaster</option>
              <option value="outage">Outage</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={filters.severity || ""}
              onChange={(e) =>
                handleChange("severity", e.target.value as Severity)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
