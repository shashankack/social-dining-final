// src/sections/EventsSection.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useAuthDialog } from "../../components/AuthDialogProvider";
import dot from "/images/dot.svg";

// Swiper for mobile
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";

// const USE_GUEST_FLOW = import.meta.env.VITE_GUEST_FLOW === "1";
const USE_GUEST_FLOW = "1";

export default function EventsSection({ limit = 9 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const prefersReduced = useReducedMotion();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = useAuth();
  const user = auth?.user;

  const { openAuth } = useAuthDialog() || {};
  const navigate = useNavigate();

  const ctrlRef = useRef(null);
  const mountedRef = useRef(false);

  // Fetch fresh every mount
  const fetchEvents = async ({ signal } = {}) => {
    const url = `/events?onlyAvailable=true&includeClub=true&sort=startsAtAsc&limit=${limit}`;
    try {
      const res = await apiFetch(url, {
        signal,
        headers: {
          // keep the API fresh while you build; you can remove later if you add server-side ETags
          "Cache-Control": "no-store",
        },
      });
      const items = Array.isArray(res?.items) ? res.items : [];
      if (mountedRef.current) setEvents(items);
    } catch (e) {
      if (mountedRef.current) setEvents([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    ctrlRef.current = new AbortController();
    setLoading(true);
    fetchEvents({ signal: ctrlRef.current.signal });

    return () => {
      mountedRef.current = false;
      try {
        ctrlRef.current?.abort();
      } catch {}
    };
  }, [limit]);

  // Normalize for rendering (use thumbnailUrls[1] first, then [0], then galleryUrls[0])
  const normalized = useMemo(
    () =>
      (events || []).map((e) => {
        const thumb =
          (Array.isArray(e.thumbnailUrls) &&
            (e.thumbnailUrls[1] || e.thumbnailUrls[0])) ||
          (Array.isArray(e.galleryUrls) && e.galleryUrls[0]) ||
          e.thumbnailUrl || // legacy fallback
          null;

        return {
          id: e.id,
          slug: e.slug,
          title: e.title,
          status: e.status,
          startsAt: e.startsAt,
          img: thumb,
        };
      }),
    [events]
  );

  const handleEventClick = (ev) => {
    const target = `/events/${ev.slug || ev.id}`;
    if (USE_GUEST_FLOW) {
      navigate(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (user) {
      navigate(target);
    } else if (openAuth) {
      openAuth({ mode: "signin", redirectTo: target });
    } else {
      navigate(`/signin?redirect=${encodeURIComponent(target)}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Section reveal
  const sectionVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Grid container stagger
  const gridContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  // Grid item fly-in
  const gridItemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReduced ? 0 : 24,
      scale: prefersReduced ? 1 : 0.98,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReduced
        ? { duration: 0.2 }
        : { type: "spring", stiffness: 260, damping: 22, duration: 0.5 },
    },
  };

  // Simple empty state UI
  const EmptyState = () => (
    <Box
      sx={{
        color: "secondary.main",
        textAlign: "center",
        border: "1px dashed rgba(181,87,37,0.45)",
        borderRadius: 2,
        p: 4,
        width: isMobile ? "85%" : 520,
        mx: "auto",
      }}
    >
      <Typography sx={{ fontWeight: 800, mb: 1 }}>
        No upcoming events
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.85 }}>
        All caught up for now. Check back later.
      </Typography>
    </Box>
  );

  // Skeleton cards for loading (desktop)
  const SkeletonCard = () => (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "3 / 4",
        borderRadius: 2,
        border: "3px solid #B55725",
        background:
          "linear-gradient(90deg, #1a1a1a 25%, #232323 37%, #1a1a1a 63%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        "@keyframes shimmer": {
          "0%": { backgroundPosition: "0% 0" },
          "100%": { backgroundPosition: "-135% 0" },
        },
      }}
    />
  );

  return (
    <Box
      id="events"
      overflow="hidden"
      minHeight="100vh"
      sx={{
        position: "relative",
        bgcolor: "background.default",
        "& > *": { position: "relative", zIndex: 1 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(40vw 40vw at 10% 18%, rgba(181,87,37,0.20) 0%, rgba(181,87,37,0.08) 40%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: prefersReduced ? "none" : "glow1 18s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60vw 60vw at 98% 96%, rgba(181,87,37,0.22) 0%, rgba(0,0,0,0) 60%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: prefersReduced ? "none" : "glow2 24s ease-in-out infinite",
        },
        "@keyframes glow1": {
          "0%": { opacity: 0.9, transform: "translate3d(0,0,0)" },
          "50%": { opacity: 0.6, transform: "translate3d(1%, -1%, 0)" },
          "100%": { opacity: 0.9, transform: "translate3d(0,0,0)" },
        },
        "@keyframes glow2": {
          "0%": { opacity: 0.85, transform: "translate3d(0,0,0)" },
          "50%": { opacity: 0.55, transform: "translate3d(-1%, 1%, 0)" },
          "100%": { opacity: 0.85, transform: "translate3d(0,0,0)" },
        },
      }}
      display="flex"
      alignItems={isMobile ? "start" : "center"}
      justifyContent="start"
      flexDirection="column"
      py={10}
      px={2}
      component={motion.section}
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Typography
        textAlign="center"
        width="100%"
        fontSize={isMobile ? "9vw" : 48}
        fontWeight={800}
        mb={6}
        color="#fff"
      >
        Upcoming Events
        <Box
          component="img"
          src={dot}
          alt="dot"
          sx={{
            ml: 1,
            width: 6,
            height: 6,
            display: "inline-block",
            verticalAlign: "super",
          }}
        />
      </Typography>

      {isMobile ? (
        <Box
          width="100%"
          component={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          {/* If no events after load, show empty state instead of an empty swiper */}
          {!loading && normalized.length === 0 ? (
            <EmptyState />
          ) : (
            <Swiper
              effect="cards"
              grabCursor
              modules={[EffectCards]}
              style={{ maxWidth: "85%", padding: "2vw 0" }}
            >
              {(loading ? Array.from({ length: 3 }) : normalized).map(
                (ev, idx) => (
                  <SwiperSlide key={ev?.id || idx}>
                    <Box
                      onClick={() => ev && handleEventClick(ev)}
                      sx={{
                        width: "100%",
                        height: "60vh",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "3px solid #B55725",
                        boxShadow: 4,
                        cursor: ev ? "pointer" : "default",
                        backgroundColor: "#111",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {ev?.img ? (
                        <Box
                          component="img"
                          src={ev.img}
                          alt={ev.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box sx={{ color: "#666" }}>
                          {loading ? "Loading…" : "No image"}
                        </Box>
                      )}
                    </Box>
                  </SwiperSlide>
                )
              )}
            </Swiper>
          )}
        </Box>
      ) : (
        // Desktop GRID view with fly-in animation
        <Box width="100%" mt={2}>
          {!loading && normalized.length === 0 ? (
            <EmptyState />
          ) : (
            <Box
              component={motion.div}
              variants={gridContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              sx={{
                mx: "auto",
                width: "92%",
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
              }}
            >
              {(loading ? Array.from({ length: 8 }) : normalized).map((ev, i) =>
                loading ? (
                  <SkeletonCard key={`skeleton-${i}`} />
                ) : (
                  <Box
                    key={ev.id}
                    component={motion.div}
                    variants={gridItemVariants}
                    onClick={() => handleEventClick(ev)}
                    whileHover={
                      prefersReduced
                        ? undefined
                        : {
                            y: -4,
                            boxShadow:
                              "0 10px 24px rgba(0,0,0,0.35), 0 0 0 3px #B55725 inset",
                            transition: {
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            },
                          }
                    }
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "3px solid #B55725",
                      cursor: "pointer",
                      backgroundColor: "#111",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={ev.img}
                      alt={ev.title}
                      sx={{
                        width: "100%",
                        aspectRatio: "3 / 4",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <Box sx={{ p: 1.5 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: "#fff", mb: 0.5 }}
                        noWrap
                        title={ev.title}
                      >
                        {ev.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.75)" }}
                        noWrap
                        title={ev.startsAt}
                      >
                        {ev.startsAt}
                      </Typography>
                    </Box>
                  </Box>
                )
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
