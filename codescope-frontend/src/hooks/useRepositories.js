import { useCallback, useEffect, useState } from "react";

import {
  cloneRepository,
  getRepositories,
  uploadRepository,
  uploadDocumentation,
} from "../api/codescopeApi";

export function useRepositories() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRepositories();

      const items = Array.isArray(data)
        ? data
        : data?.repositories || [];

      setRepositories(
        items.map(normalizeRepository)
      );

      return data;
    } catch (err) {
      setError(err.message);
      setRepositories([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const addRepository = async ({
    type,
    url,
    file,
  }) => {
    if (type === "git") {
      return cloneRepository(url);
    }

    if (type === "documentation") {
      return uploadDocumentation(file);
    }

    return uploadRepository(file);
  };

  return {
    repositories,
    loading,
    error,
    refresh,
    addRepository,
  };
}

function normalizeRepository(item) {
  if (typeof item === "string") {
    return {
      id: item,
      name: item,
      status: "ready",
    };
  }

  return {
    ...item,
    id:
      item.id ||
      item.repository_id ||
      item.name,
    name:
      item.name ||
      item.repository_id ||
      item.id ||
      "Repository",
    status:
      item.status ||
      "ready",
  };
}