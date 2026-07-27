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
      <div className="flex flex-col items-center justify-center p-16 text-slate-400">
        <svg className="animate-spin mb-3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-sm">{CONSTANTS.LOADING}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-7 px-5 py-4 bg-noise-light border border-noise/20 rounded-xl">
        <p className="text-noise font-medium text-sm">{CONSTANTS.ERROR}</p>
        <p className="text-noise/70 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400">
        <p className="text-sm font-medium">{CONSTANTS.NO_DATA}</p>
        <p className="text-xs mt-1">Stay safe and stay informed</p>
      </div>
    );
  }

  return (
    <>
      {/* Area filter toggle */}
      {userProfile && (
        <div className="px-7 pt-4 flex justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnlyRelevant}
              onChange={(e) => setShowOnlyRelevant(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <span className="text-sm text-slate-500">
              My area only
            </span>
          </label>
        </div>
      )}

      {/* Feed */}
      <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedAlerts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm font-medium">
              {showOnlyRelevant ? `No alerts from ${userLocation}` : CONSTANTS.NO_DATA}
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
