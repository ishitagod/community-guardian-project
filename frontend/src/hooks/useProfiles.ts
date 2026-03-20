import { useState, useEffect } from "react";
import { getProfiles } from "../api/profiles";
import type { UserProfilePublic } from "../types";

export function useProfiles(keyword?: string, refresh: number = 0) {
  const [profiles, setProfiles] = useState<UserProfilePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getProfiles(keyword)
      .then((res) => setProfiles(res.data))
      .catch((err) => {
        console.error("Failed to load profiles:", err);
        setError("Failed to load profiles");
      })
      .finally(() => setLoading(false));
  }, [keyword, refresh]);

  return { profiles, loading, error };
}
