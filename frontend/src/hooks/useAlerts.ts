import { useState, useEffect } from "react";
import { getAlerts } from "../api/alerts";
import type { Alert, AlertFilters } from "../types";

export function useAlerts(filters: AlertFilters, refresh: number) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getAlerts(filters)
      .then((res) => setAlerts(res.data))
      .catch((err) => {
        console.error("Failed to load alerts:", err);
        setError("Failed to load alerts");
      })
      .finally(() => setLoading(false));
  }, [
    filters.keyword,
    filters.classification,
    filters.alert_type,
    filters.severity,
    refresh,
  ]);

  // Poll for new alerts every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getAlerts(filters)
        .then((res) => setAlerts(res.data))
        .catch((err) => console.error("Failed to refresh alerts:", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [filters]);

  return { alerts, loading, error };
}
