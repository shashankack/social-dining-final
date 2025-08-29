// AccountPage.jsx
// Styled to match custom theme (primary: #B55725, secondary: #ffffff, background: #000000)

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
  Alert,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EventIcon from "@mui/icons-material/Event";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link as RouterLink } from "react-router-dom";

// -------------------- UI helpers --------------------

function StatusChip({ status }) {
  const colorMap = {
    CONFIRMED: "success",
    PENDING: "warning",
    FAILED: "error",
    CANCELLED: "default",
    REFUNDED: "info",
    CREATED: "info",
  };
  const color = colorMap[status] || "default";
  return (
    <Chip
      size="small"
      label={status || "UNKNOWN"}
      color={color}
      variant={color === "default" ? "outlined" : "filled"}
      sx={{ fontWeight: 700, letterSpacing: 0.3 }}
    />
  );
}

function formatWhen(when) {
  if (!when) return "—";
  const d = new Date(when);
  const weekday = d.toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "Asia/Kolkata",
  }); // e.g., Sun
  const day = String(
    d.toLocaleString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" })
  );
  const month = String(
    d.toLocaleString("en-IN", { month: "2-digit", timeZone: "Asia/Kolkata" })
  );
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }); // no seconds
  return `${weekday}, ${day}/${month} • ${time}`;
}

// -------------------- Card --------------------

function RegistrationCard({ r }) {
  const when =
    r?.event?.startsAt ||
    r?.event?.date ||
    r?.eventDate ||
    r?.startsAt ||
    r?.createdAt;

  const whenText = useMemo(() => formatWhen(when), [when]);
  const slug = r?.event?.slug;
  const to = slug ? `/events/${slug}` : undefined;

  return (
    <Card
      variant="outlined"
      component={to ? RouterLink : "div"}
      to={to}
      sx={{
        borderRadius: 3,
        background: "rgba(255,255,255,0.05)",
        borderColor: "#B55725",
        color: "#ffffff",
        backdropFilter: "blur(6px)",
        cursor: to ? "pointer" : "default",
        transition: "all 0.25s ease",
        textDecoration: "none",
        "&:hover": to
          ? {
              transform: "translateY(-4px)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
            }
          : {},
        "&:focus-visible": to
          ? { outline: "2px solid #B55725", outlineOffset: 2 }
          : {},
      }}
    >
      <CardHeader
        avatar={<ConfirmationNumberIcon sx={{ color: "#B55725" }} />}
        action={<StatusChip status={r.status} />}
        title={
          <Typography variant="h6" color="secondary" sx={{ fontWeight: 800 }}>
            {r.event?.title || "Untitled Event"}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <EventIcon fontSize="small" sx={{ color: "#B55725" }} />
            <Typography variant="body2" sx={{ color: "#ccc", fontWeight: 600 }}>
              {whenText}
            </Typography>
          </Stack>
        }
      />
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
      <CardContent sx={{ py: 1.5 }} />
    </Card>
  );
}

// -------------------- Empty State --------------------

function EmptyState() {
  return (
    <Box sx={{ textAlign: "center", py: 6, color: "#fff" }}>
      <InfoOutlinedIcon sx={{ fontSize: 48, opacity: 0.6, color: "#B55725" }} />
      <Typography variant="h6" sx={{ mt: 1 }}>
        No registrations yet
      </Typography>
      <Typography variant="body2" sx={{ color: "#aaa" }}>
        When you book a seat, it will show up here.
      </Typography>
      <Button
        href="/"
        sx={{
          mt: 2,
          bgcolor: "#B55725",
          color: "#fff",
          "&:hover": { bgcolor: "#96451E" },
        }}
      >
        Browse Events
      </Button>
    </Box>
  );
}

// -------------------- Page --------------------

export default function AccountPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  // fetch *all* events (paged) to build id → event map
  const fetchAllEvents = useCallback(async () => {
    const limit = 50;
    let offset = 0;
    const events = [];
    // includeClub=true so cards have club info if you ever want it
    // sort by startsAtAsc so upcoming are first; change if needed
    while (true) {
      const res = await apiFetch(
        `/events?includeClub=true&limit=${limit}&offset=${offset}&sort=startsAtAsc`
      );
      const batch = Array.isArray(res?.items) ? res.items : [];
      events.push(...batch);
      const hasMore = res?.pagination?.hasMore;
      if (!hasMore) break;
      offset = res?.pagination?.nextOffset ?? offset + batch.length;
      if (!batch.length) break; // safety
    }
    const byId = new Map(events.map((e) => [e.id, e]));
    return byId;
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      // 1) Get registrations
      const regs = await apiFetch(`/registrations/me`);
      const safeRegs = Array.isArray(regs) ? regs : [];

      // 2) Build event map from list API (since /events/:slug is the only single-get)
      const eventById = await fetchAllEvents();

      // 3) Attach event onto each registration by eventId
      const withEvents = safeRegs.map((r) => {
        const event = r.eventId ? eventById.get(r.eventId) : undefined;
        return event ? { ...r, event } : r;
      });

      setItems(withEvents);
    } catch (e) {
      setError("Failed to load registrations");
      setItems([]);
    }
  }, [fetchAllEvents]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        bgcolor: "background.default",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(45vw 45vw at 15% 20%, rgba(181,87,37,0.25) 0%, rgba(181,87,37,0.08) 40%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "glow1 18s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(55vw 55vw at 95% 95%, rgba(181,87,37,0.25) 0%, rgba(0,0,0,0) 60%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "glow2 24s ease-in-out infinite",
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
    >
      <Container sx={{ py: 4, position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3, mt: { xs: 5, md: 10 } }}
        >
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800 }}>
            My Registrations
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={load} size="small" sx={{ color: "#B55725" }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {items === null && (
          <Stack spacing={2}>
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Stack>
        )}

        {Array.isArray(items) && items.length === 0 && !error && <EmptyState />}

        {Array.isArray(items) && items.length > 0 && (
          <Stack spacing={2}>
            {items.map((r) => (
              <RegistrationCard key={r.id} r={r} />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
