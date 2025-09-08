import { useEffect, useMemo, useState } from "react";
import { listActivities } from "../lib/api";

export function useActivities({ status, q } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listActivities({
          status, // backend filters upcoming/past/live :contentReference[oaicite:5]{index=5}
          q,
          publishedOnly: true,
          limit: 50,
        });
        if (!cancelled) setItems(data?.items ?? data ?? []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, q]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    [items]
  );

  return { items: sorted, loading, error };
}
