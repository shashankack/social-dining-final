// src/pages/EventDetailPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { BookButton } from "../components/BookButton";
import {
  Box,
  Typography,
  Stack,
  Link as MLink,
  Divider,
  Skeleton,
  Paper,
} from "@mui/material";
import BookButtonGuest from "../components/BookButtonGuest";

// const USE_GUEST_FLOW = import.meta.env.VITE_GUEST_FLOW === "1";
const USE_GUEST_FLOW = "1";

/* ---------- Formatting helpers ---------- */
function parseTs(value) {
  if (!value) return null;
  if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(value)) return new Date(value);
  return new Date(value + "Z");
}

function formatDateRange(startsAt, endsAt) {
  const s = parseTs(startsAt);
  if (!s) return "";

  const e = parseTs(endsAt);

  const dtfDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const dtfTime = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const date = dtfDate.format(s);
  const startTime = dtfTime.format(s);
  const endTime = e ? dtfTime.format(e) : null;

  return endTime
    ? `${date} • ${startTime} – ${endTime} IST`
    : `${date} • ${startTime} IST`;
}

// Heuristic: INR minor units -> paise
function formatPriceFromMinor(minor, currency = "INR") {
  const nf = new Intl.NumberFormat("en-IN", { style: "currency", currency });
  const divisor = 100;
  const n = Number.isFinite(minor) ? minor : 0;
  return nf.format(n / divisor);
}

/* ---------- Tiny UI primitives (no Chips) ---------- */
const MetaPill = ({ children, tone = "default" }) => {
  const base = {
    default: { bg: "rgba(255,255,255,0.06)", bd: "rgba(181,87,37,0.45)" },
    accent: { bg: "rgba(181,87,37,0.18)", bd: "rgba(181,87,37,0.55)" },
    muted: { bg: "rgba(255,255,255,0.08)", bd: "rgba(255,255,255,0.18)" },
  }[tone];

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.5,
        borderRadius: 999,
        border: `1px solid ${base.bd}`,
        bgcolor: base.bg,
        color: "secondary.main",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.6,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Box>
  );
};

const MetaRow = ({ label, value, href }) => (
  <Stack
    direction="row"
    spacing={1.25}
    alignItems="center"
    sx={{ color: "secondary.main", opacity: 0.95, flexWrap: "wrap" }}
  >
    <Typography
      component="span"
      sx={{ fontSize: 13, letterSpacing: 0.6, opacity: 0.8 }}
    >
      {label}
    </Typography>
    {href ? (
      <MLink
        href={href}
        target="_blank"
        rel="noreferrer"
        underline="hover"
        sx={{ color: "primary.main", fontWeight: 700 }}
      >
        {value}
      </MLink>
    ) : (
      <Typography component="span" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    )}
  </Stack>
);

/* ---------- HTML section extractor ---------- */
function splitDescriptionHTML(html) {
  if (!html || typeof html !== "string") {
    return { descHTML: "", detailsHTML: "" };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Preferred classes
    const descNode =
      doc.querySelector(".event_desc") ||
      doc.querySelector(".event_description"); // backward compatibility
    const detailsNode = doc.querySelector(".event_details");

    const descHTML = descNode ? descNode.innerHTML.trim() : "";
    const detailsHTML = detailsNode ? detailsNode.innerHTML.trim() : "";

    // If nothing matched but the root has content, fallback to original HTML as description
    if (!descHTML && !detailsHTML) {
      // use body content, but keep it safe-ish
      const bodyHTML = (doc.body && doc.body.innerHTML) || "";
      return { descHTML: bodyHTML, detailsHTML: "" };
    }

    return { descHTML, detailsHTML };
  } catch {
    // very old browsers / server env safety
    return { descHTML: html, detailsHTML: "" };
  }
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [e, setE] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setE(await apiFetch(`/events/${slug}`));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const remaining = useMemo(() => {
    if (!e) return 0;
    const r = Math.max(0, (e.slotsTotal ?? 0) - (e.slotsTaken ?? 0));
    return typeof e.remainingSlots === "number" ? e.remainingSlots : r;
  }, [e]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Box
          sx={{
            position: "relative",
            height: { xs: 360, md: 520 },
            bgcolor: "#111",
          }}
        >
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
        <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 4 }}>
          <Skeleton width={240} height={36} />
          <Skeleton width="60%" />
          <Skeleton width="90%" />
          <Skeleton width="75%" />
        </Box>
      </Box>
    );
  }

  if (!e) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <Typography color="secondary.main">Not found</Typography>
      </Box>
    );
  }

  const { descHTML, detailsHTML } = splitDescriptionHTML(e.description);
  const dateRange = formatDateRange(e.startsAt, e.endsAt);
  const price = formatPriceFromMinor(e.registrationFeeMinor, e.currency);
  const soldOut = e.isSoldOut || remaining <= 0 || e.status !== "UPCOMING";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        bgcolor: "background.default",
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(40vw 40vw at 8% 12%, rgba(181,87,37,0.20) 0%, rgba(181,87,37,0.08) 40%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(60vw 60vw at 100% 100%, rgba(181,87,37,0.22) 0%, rgba(0,0,0,0) 60%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      {/* Hero */}
      <Box
        component="section"
        sx={{
          position: "relative",
          height: { xs: "90vh", md: 560 },
          width: "100%",
          overflow: "hidden",
        }}
      >
        {e.thumbnailUrls?.length || e.galleryUrls?.length ? (
          <picture>
            {/* Mobile first */}
            {e.thumbnailUrls?.[1] && (
              <source media="(max-width: 600px)" srcSet={e.thumbnailUrls[1]} />
            )}
            {e.thumbnailUrls?.[0] && (
              <source media="(min-width: 601px)" srcSet={e.thumbnailUrls[0]} />
            )}
            <img
              src={
                e.thumbnailUrls?.[0] ??
                e.thumbnailUrls?.[1] ??
                e.galleryUrls?.[0] ??
                undefined
              }
              alt={e.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scale(1.02)",
                filter: "brightness(0.72)",
              }}
            />
          </picture>
        ) : (
          <Box sx={{ position: "absolute", inset: 0, bgcolor: "#111" }} />
        )}

        {/* gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.60) 58%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Hero content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1300,
            mx: "auto",
            px: 2,
            height: "100%",
            display: "flex",
            alignItems: "flex-end",
            pb: { xs: 2, md: 4 },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{
              width: "100%",
              alignItems: { xs: "flex-start", md: "flex-end" },
            }}
          >
            {/* Left info */}
            <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                {e.club?.name && (
                  <MetaPill tone="default">{e.club.name}</MetaPill>
                )}
                <MetaPill tone={soldOut ? "muted" : "accent"}>
                  {e.status}
                </MetaPill>
                {typeof e.slotsTotal === "number" && (
                  <MetaPill tone={soldOut ? "muted" : "default"}>{`${Math.max(
                    0,
                    remaining
                  )} left`}</MetaPill>
                )}
              </Stack>

              <Typography
                variant="h3"
                sx={{
                  color: "secondary.main",
                  fontWeight: 800,
                  lineHeight: 1.05,
                }}
              >
                {e.title}
              </Typography>

              {/* Highlighted Date/Time */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  border: "1px solid rgba(181,87,37,0.45)",
                  bgcolor: "rgba(181,87,37,0.12)",
                  color: "secondary.main",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    fontSize: 12,
                    opacity: 0.85,
                  }}
                >
                  Date & Time
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{dateRange}</Typography>
              </Box>

              {/* Venue / Map */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  mt: 0.5,
                  color: "secondary.main",
                  opacity: 0.95,
                  flexWrap: "wrap",
                }}
              >
                {e.venueName && <MetaRow label="Venue" value={e.venueName} />}
                {e.venueMapUrl && (
                  <MetaRow
                    label="Map"
                    value="Open in Maps"
                    href={e.venueMapUrl}
                  />
                )}
              </Stack>
            </Stack>

            {/* Right: price + CTA */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid rgba(181,87,37,0.4)",
                bgcolor: "rgba(0,0,0,0.35)",
                minWidth: { xs: "100%", md: 320 },
                backdropFilter: "saturate(130%) blur(6px)",
              }}
            >
              <Stack spacing={1}>
                {/* <Typography sx={{ color: "secondary.main", opacity: 0.9 }}>
                  🎟 Remaining: <b>{remaining}</b>
                </Typography> */}
                <Typography sx={{ color: "secondary.main", opacity: 0.9 }}>
                  Entry fee: <b>{price}</b>
                </Typography>

                {!soldOut ? (
                  USE_GUEST_FLOW ? (
                    <BookButtonGuest
                      eventId={e.id}
                      eventTitle={e.title}
                      unitPriceMinor={e.registrationFeeMinor}
                      defaultQty={1}
                    />
                  ) : (
                    <BookButton
                      eventId={e.id}
                      onSuccess={() =>
                        alert("We’ll email you once payment is confirmed.")
                      }
                    />
                  )
                ) : (
                  <Typography color="secondary.main" sx={{ opacity: 0.7 }}>
                    Booking closed or sold out.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* Body section (full width container) */}
      <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 4 }}>
        {/* About (from .event_desc / .event_description) */}
        {descHTML && (
          <>
            <Typography
              variant="h6"
              sx={{ color: "secondary.main", fontWeight: 700, mb: 1 }}
            >
              About this event
            </Typography>
            <Box
              sx={{
                color: "secondary.main",
                "& .event_desc, & .event_description": {
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.7,
                  letterSpacing: "0.015em",
                },
                "& p": { margin: "0 0 12px" },
                "& a": { color: "primary.main", fontWeight: 600 },
                "& ul, & ol": { paddingLeft: "1.2rem", margin: "6px 0 12px" },
              }}
              // re-wrap the HTML inside a container with class to reuse styles
              dangerouslySetInnerHTML={{
                __html: `<div class="event_desc">${descHTML}</div>`,
              }}
            />
          </>
        )}

        {/* Details (from .event_details) */}
        {detailsHTML && (
          <>
            <Divider sx={{ my: 4, borderColor: "rgba(181,87,37,0.35)" }} />
            <Typography
              variant="h6"
              sx={{ color: "secondary.main", fontWeight: 700, mb: 1 }}
            >
              Event details
            </Typography>
            <Box
              sx={{
                color: "secondary.main",
                "& .event_details": {
                  fontSize: { xs: "0.98rem", md: "1.02rem" },
                  lineHeight: 1.75,
                  letterSpacing: "0.012em",
                },
                "& p": { margin: "0 0 10px" },
                "& a": { color: "primary.main", fontWeight: 600 },
                "& ul, & ol": {
                  paddingLeft: "1.2rem",
                  margin: "6px 0 12px",
                },
                // common pattern: if user uses definition list or table
                "& table": {
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid rgba(181,87,37,0.25)",
                  borderRadius: 8,
                  overflow: "hidden",
                  marginTop: 8,
                },
                "& th, & td": {
                  borderBottom: "1px solid rgba(181,87,37,0.18)",
                  padding: "10px 12px",
                },
                "& th": {
                  textAlign: "left",
                  background: "rgba(181,87,37,0.10)",
                  fontWeight: 700,
                },
                "& tr:last-child td": { borderBottom: "none" },
              }}
              dangerouslySetInnerHTML={{
                __html: `<div class="event_details">${detailsHTML}</div>`,
              }}
            />
          </>
        )}

        {/* --- Gallery LAST --- */}
        {e.galleryUrls?.length ? (
          <>
            <Divider sx={{ my: 4, borderColor: "rgba(181,87,37,0.35)" }} />
            <Typography
              variant="h6"
              sx={{ color: "secondary.main", mb: 2, fontWeight: 700 }}
            >
              Gallery
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ overflowX: "auto", pb: 1 }}
            >
              {(e.galleryUrls || []).filter(Boolean).map((src, i) => (
                <Box
                  key={`${src}-${i}`}
                  component="img"
                  src={src}
                  alt={`gallery-${i}`}
                  sx={{
                    width: { xs: 260, md: 320 },
                    height: { xs: 160, md: 200 },
                    objectFit: "cover",
                    borderRadius: 2,
                    border: "1px solid rgba(181,87,37,0.35)",
                    flex: "0 0 auto",
                  }}
                />
              ))}
            </Stack>
          </>
        ) : null}

        {/* Club info */}
        {e.club?.name && (
          <>
            <Divider sx={{ my: 4, borderColor: "rgba(181,87,37,0.35)" }} />
            <Typography
              variant="h6"
              sx={{ color: "secondary.main", fontWeight: 700 }}
            >
              About the Club
            </Typography>
            <Typography sx={{ color: "secondary.main", opacity: 0.85, mt: 1 }}>
              {e.club.description}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
