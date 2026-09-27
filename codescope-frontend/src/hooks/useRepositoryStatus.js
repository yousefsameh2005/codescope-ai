import { useCallback, useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function useRepositoryStatus(repositoryId) {
  const [status, setStatus] = useState("unknown");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    if (!repositoryId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/repositories/${encodeURIComponent(
          repositoryId
        )}/status`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Failed to fetch repository status"
        );
      }

      setStatus(data?.status || "unknown");
      setProgress(data?.progress || 0);

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [repositoryId]);

  useEffect(() => {
    if (!repositoryId) {
      return;
    }

    fetchStatus();

    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [repositoryId, fetchStatus]);

  return {
    status,
    progress,
    loading,
    error,
    refreshStatus: fetchStatus,
  };
}