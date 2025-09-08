import { useEffect, useState } from "react";
import { getActivity } from "../lib/api";

export function useActivity(idOrSlug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!idOrSlug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const d = await getActivity(idOrSlug);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load event");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);
  return { data, loading, error };
}
