import Badge from "../../components/Badge";
import ActionBox from "../../components/ActionBox";
import type { Alert } from "../../types";

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: number) => void;
  onViewDetails: (id: number) => void;
}

export default function AlertCard({ alert, onViewDetails }: AlertCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{alert.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(alert.created_at)}
          </p>
        </div>
        {alert.dismissed && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
            Dismissed
          </span>
        )}
      </div>

      {/* Description Preview */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {alert.description}
      </p>

      {/* Location */}
      {(alert.neighborhood || alert.city) && (
        <div className="mb-2 px-2 py-1 bg-amber-50 rounded border border-amber-200 inline-block">
          <p className="text-xs text-amber-800 font-medium">
            📍{" "}
            {alert.neighborhood && alert.city
              ? `${alert.neighborhood}, ${alert.city}`
              : alert.neighborhood || alert.city}
          </p>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          label="Status"
          type="classification"
          value={alert.classification}
        />
        <Badge label="Severity" type="severity" value={alert.severity} />
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <span className="font-semibold">Type:</span> {alert.alert_type}
        </span>
      </div>

      {/* Action Summary */}
      <div className="mb-4">
        <ActionBox
          classification={alert.classification}
          actionSummary={alert.action_summary}
        />
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Confidence:</span>
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${Math.round(alert.ai_confidence * 100)}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 w-12 text-right">
          {Math.round(alert.ai_confidence * 100)}%
        </span>
      </div>

      {/* AI Method */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Classification by:</span>{" "}
          <span
            className={`font-semibold ${alert.ai_method === "groq_ai" ? "text-green-700" : "text-orange-700"}`}
          >
            {alert.ai_method === "groq_ai" ? "Groq AI" : "Fallback"}
          </span>
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={() => onViewDetails(alert.id)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
      >
        View Details
      </button>
    </div>
  );
}
