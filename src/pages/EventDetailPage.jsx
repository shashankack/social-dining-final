// src/pages/EventDetailPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getActivity } from "../lib/api";
import {
  Box,
  Typography,
  Stack,
  Link as MLink,
  Divider,
  Skeleton,
  Paper,
  Button,
} from "@mui/material";
import RegisterDialog from "../components/RegisterDialog";

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

/* ---------- Tiny UI primitives ---------- */
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
function splitDescriptionHTML(html, additionalNotes) {
  if (!html && !additionalNotes) return { descHTML: "", detailsHTML: "" };

  let descHTML = "";
  let detailsHTML = "";

  try {
    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const descNode =
        doc.querySelector(".event_desc") ||
        doc.querySelector(".event_description");
      const detailsNode = doc.querySelector(".event_details");

      descHTML = descNode ? descNode.innerHTML.trim() : "";
      detailsHTML = detailsNode ? detailsNode.innerHTML.trim() : "";

      if (!descHTML && !detailsHTML) {
        const bodyHTML = (doc.body && doc.body.innerHTML) || "";
        descHTML = bodyHTML;
      }
    }
  } catch {
    if (html) descHTML = html;
  }

  // Prefer API-provided notes as Details
  if (additionalNotes && typeof additionalNotes === "string") {
    detailsHTML = additionalNotes.trim();
  }

  return { descHTML, detailsHTML };
}

/* ---------- Normalize API item -> view model ---------- */
function normalizeEvent(apiItem) {
  const thumb =
    (Array.isArray(apiItem.thumbnailUrls) &&
      (apiItem.thumbnailUrls[1] || apiItem.thumbnailUrls[0])) ||
    (Array.isArray(apiItem.galleryUrls) && apiItem.galleryUrls[0]) ||
    null;

  const total = Number(apiItem.totalSlots ?? 0);
  const taken = Number(apiItem.bookedSlots ?? 0);
  const remaining = Math.max(0, total - taken);

  const status = (apiItem.status || "").toLowerCase(); // upcoming/past/live

  return {
    id: apiItem.id,
    slug: apiItem.slug,
    title: apiItem.title,
    description: apiItem.description,
    additionalNotes: apiItem.additionalNotes, // HTML
    startsAt: apiItem.startAt,
    endsAt: apiItem.endAt,
    thumbnailUrls: apiItem.thumbnailUrls || [],
    galleryUrls: apiItem.galleryUrls || [],
    venueName: apiItem.venueName,
    venueMapUrl: apiItem.mapUrl,
    currency: apiItem.currency || "INR",
    registrationFeeMinor: apiItem.registrationFee, // paise
    status,
    canBook: !!apiItem.canBook,
    isSoldOut: !apiItem.canBook || remaining <= 0 || status !== "upcoming",
    slotsTotal: total,
    slotsTaken: taken,
    remainingSlots: remaining,
    club: apiItem.clubName
      ? {
          name: apiItem.clubName,
          slug: apiItem.clubSlug,
          description: apiItem.clubDescription || "",
        }
      : undefined,
    heroImg: thumb,
  };
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [e, setE] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openReg, setOpenReg] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const raw = await getActivity(slug);
        const item =
          raw?.id || raw?.slug
            ? raw
            : Array.isArray(raw?.items)
            ? raw.items[0]
            : raw;
        const normalized = item ? normalizeEvent(item) : null;
        if (!cancelled) setE(normalized);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const remaining = useMemo(() => (e ? e.remainingSlots : 0), [e]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Box
          sx={{
            position: "relative",
            height: { xs: "90vh", md: "80vh" },
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

  const { descHTML, detailsHTML } = splitDescriptionHTML(
    e.description,
    e.additionalNotes
  );
  const dateRange = formatDateRange(e.startsAt, e.endsAt);
  const price = formatPriceFromMinor(e.registrationFeeMinor, e.currency);
  const soldOut = e.isSoldOut;

  // Adapt event -> RegisterDialog expected shape
  const activityForDialog = {
    id: e.id,
    title: e.title,
    registrationFee: e.registrationFeeMinor, // paise
    totalSlots: e.slotsTotal,
    bookedSlots: e.slotsTaken,
    currency: e.currency,
    coverImageUrl: e.thumbnailUrls?.[0] || e.galleryUrls?.[0],
  }; // matches RegisterDialog prop contract. :contentReference[oaicite:3]{index=3}

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
            "radial-gradient(40vw 40vw at 8% 12%, rgba(181,87,37,0.10) 0%, rgba(181,87,37,0.08) 40%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(60vw 60vw at 100% 100%, rgba(181,87,37,0.12) 0%, rgba(0,0,0,0) 90%)",
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
          height: { xs: "90vh", md: "80vh" },
          width: "100%",
          overflow: "hidden",
        }}
      >
        {e.thumbnailUrls?.length || e.galleryUrls?.length ? (
          <picture>
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
                  <MetaPill tone={soldOut ? "muted" : "default"}>
                    {`${Math.max(0, remaining)} left`}
                  </MetaPill>
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
                <Typography sx={{ color: "secondary.main", opacity: 0.9 }}>
                  Entry fee: <b>{price}</b>
                </Typography>

                {!soldOut ? (
                  <Button
                    variant="contained"
                    onClick={() => setOpenReg(true)}
                    sx={{ fontWeight: 800 }}
                  >
                    Register
                  </Button>
                ) : (
                  <Typography color="secondary.main" sx={{ opacity: 0.7 }}>
                    Booking closed or sold out.
                  </Typography>
                )}

                {!soldOut && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "secondary.main",
                      opacity: 0.8,
                      mt: 0.5,
                      display: "block",
                    }}
                  >
                    Secure checkout via Razorpay.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* Body section (full width container) */}
      <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 4 }}>
        {/* About */}
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
              dangerouslySetInnerHTML={{
                __html: `<div class="event_desc">${descHTML}</div>`,
              }}
            />
          </>
        )}

        {/* Details — prefers API additionalNotes if present */}
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
                "& ul, & ol": { paddingLeft: "1.2rem", margin: "6px 0 12px" },
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
            {e.club.description ? (
              <Typography
                sx={{ color: "secondary.main", opacity: 0.85, mt: 1 }}
              >
                {e.club.description}
              </Typography>
            ) : (
              <Typography
                sx={{ color: "secondary.main", opacity: 0.75, mt: 1 }}
              >
                {e.club.name}
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Register dialog (mounted once) */}
      <RegisterDialog
        open={openReg}
        onClose={() => setOpenReg(false)}
        activity={activityForDialog}
        onSuccess={() => {
          setOpenReg(false);
          // simple UX: show toast/alert; you can route to a success page here
          alert("Thanks! We’ll email your confirmation shortly.");
        }}
      />
    </Box>
  );
}
