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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading alert details...</p>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-red-600 font-medium">
            {error || "Alert not found"}
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{alert.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(alert.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location */}
          {(alert.neighborhood || alert.city) && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-900 font-medium">
                📍 {alert.neighborhood && alert.city
                  ? `${alert.neighborhood}, ${alert.city}`
                  : alert.neighborhood || alert.city}
              </p>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
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

          {/* Full Description */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Full Description
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {alert.description}
            </p>
          </div>

          {/* Action Summary */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              What You Should Do
            </h3>
            <ActionBox
              classification={alert.classification}
              actionSummary={alert.action_summary}
            />
          </div>

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Security Checklist
              </h3>
              <ul className="space-y-2">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence & AI Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">
              Classification Details
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Confidence Score
                  </span>
                  <span className="font-semibold text-gray-800">
                    {Math.round(alert.ai_confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{
                      width: `${Math.round(alert.ai_confidence * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Reasoning
                </p>
                <p className="text-sm text-gray-600 italic">
                  {alert.ai_reasoning || "No reasoning provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
