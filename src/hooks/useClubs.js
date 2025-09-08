import { useEffect, useMemo, useState } from "react";
import { listClubs, getClub } from "../lib/api";

/**
 * useClubs
 * - Fetches a list of clubs
 * - Accepts optional params: { q, city, tag, limit, page, ... }
 * - Normalizes different API shapes (array vs { items } vs { getAllClubs })
 */
export function useClubs(params) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // serialize params to avoid effect thrashing
  const deps = useMemo(() => JSON.stringify(params ?? {}), [params]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    listClubs(params)
      .then((data) => {
        const raw = Array.isArray(data)
          ? data
          : data?.items ?? data?.getAllClubs ?? [];

        const normalized = raw.map((c) => ({
          id: c.id || c.slug || c._id,
          slug: c.slug || c.id || c._id,
          title: c.title || c.name || "Untitled Club",
          description: c.description || "",
          thumbnail:
            c.thumbnail || c.bannerUrl || c.imageUrl || c.coverUrl || "",
          city: c.city || c.location || "",
          tags: c.tags || [],
          ...c,
        }));

        if (isMounted) setClubs(normalized);
      })
      .catch((e) => isMounted && setError(e))
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [deps]);

  return { clubs, loading, error };
}

/**
 * useClub
 * - Fetches a single club by slug or id
 */
export function useClub(slugOrId) {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(!!slugOrId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slugOrId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    getClub(slugOrId)
      .then((data) => {
        const c = data?.club || data; // support { club: {...} } or {...}
        const normalized = {
          id: c.id || c.slug || c._id,
          slug: c.slug || c.id || c._id,
          title: c.title || c.name || "Untitled Club",
          description: c.description || "",
          thumbnail:
            c.thumbnail || c.bannerUrl || c.imageUrl || c.coverUrl || "",
          city: c.city || c.location || "",
          tags: c.tags || [],
          ...c,
        };
        if (isMounted) setClub(normalized);
      })
      .catch((e) => isMounted && setError(e))
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  return { club, loading, error };
}
