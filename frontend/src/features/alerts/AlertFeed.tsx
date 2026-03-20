import { useState } from "react";
import AlertCard from "./AlertCard";
import type { AlertFilters, Alert } from "../../types";
import { useAlerts } from "../../hooks/useAlerts";
import { useProfileStore } from "../../store/profileStore";
import { dismissAlert } from "../../api/alerts";
import CONSTANTS from "../../constants";

interface AlertFeedProps {
  filters: AlertFilters;
  refresh: number;
  onViewDetails: (id: number) => void;
}

export default function AlertFeed({
  filters,
  refresh,
  onViewDetails,
}: AlertFeedProps) {
  const { alerts, loading, error } = useAlerts(filters, refresh);
  const { userProfile } = useProfileStore();
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(true);

  const userLocation =
    userProfile?.neighborhood || userProfile?.city || "Your area";

  const isAlertRelevant = (alert: Alert): boolean => {
    if (!userProfile) return true;

    const cityMatch =
      alert.city &&
      userProfile.city &&
      typeof alert.city === "string" &&
      typeof userProfile.city === "string" &&
      alert.city.toLowerCase() === userProfile.city.toLowerCase();

    const neighborhoodMatch =
      alert.neighborhood &&
      userProfile.neighborhood &&
      typeof alert.neighborhood === "string" &&
      typeof userProfile.neighborhood === "string" &&
      alert.neighborhood.toLowerCase() ===
        userProfile.neighborhood.toLowerCase();

    return !!(cityMatch || neighborhoodMatch);
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    // Verified alerts first
    if (a.classification === "verified" && b.classification !== "verified") {
      return -1;
    }
    if (a.classification !== "verified" && b.classification === "verified") {
      return 1;
    }

    // If both verified or both not verified, sort by confidence (highest first)
    return b.ai_confidence - a.ai_confidence;
  });

  const displayedAlerts = showOnlyRelevant
    ? sortedAlerts.filter(isAlertRelevant)
    : sortedAlerts;

  const handleDismiss = async (id: number) => {
    try {
      await dismissAlert(id);
      // Dismiss successful - just notify parent to refresh
      onViewDetails(-1);
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
      window.alert("Failed to dismiss alert");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-600 mt-2">{CONSTANTS.LOADING}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg m-5">
        <p className="text-red-800 font-medium">{CONSTANTS.ERROR}</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 font-medium">{CONSTANTS.NO_DATA}</p>
        <p className="text-gray-500 text-sm mt-1">
          Stay safe and stay informed
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toggle filter */}
      {userProfile && (
        <div className="px-5 pt-4 flex justify-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyRelevant}
              onChange={(e) => setShowOnlyRelevant(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">
              Show only alerts from your area
            </span>
          </label>
        </div>
      )}

      {/* Alert feed */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedAlerts.length === 0 ? (
          <div className="col-span-full p-8 text-center">
            <p className="text-gray-600 font-medium">
              {showOnlyRelevant
                ? `No alerts from ${userLocation}`
                : CONSTANTS.NO_DATA}
            </p>
          </div>
        ) : (
          displayedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={handleDismiss}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </>
  );
}
