import { useEffect, useState } from "react";
import type { Alert } from "../types";

interface LocationAlertProps {
  alert: Alert;
  userLocation: string; // neighborhood or city
  onDismiss: () => void;
  index?: number; // For stacking multiple notifications
}

export default function LocationAlert({
  alert,
  userLocation,
  onDismiss,
  index = 0,
}: LocationAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  // Stack notifications vertically
  const topPosition = 16 + index * 280;

  return (
    <div
      className="fixed right-4 z-50 max-w-sm w-full transition-all duration-300"
      style={{ top: `${topPosition}px` }}
    >
      <div className="bg-red-600 text-white rounded-lg shadow-2xl p-4 border border-red-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{alert.title}</p>
              <p className="text-red-100 text-xs mt-1 line-clamp-2">
                {alert.description}
              </p>
              <p className="text-red-200 text-xs mt-2 font-medium">
                📍 {userLocation}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="text-red-200 hover:text-white text-xl font-bold flex-shrink-0"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
