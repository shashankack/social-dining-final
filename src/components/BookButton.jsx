// src/components/BookButton.jsx
import React, { useEffect, useState } from "react";
import { Button, Alert, Stack, Tooltip } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useAuthDialog } from "./AuthDialogProvider";

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

// Helper to render a friendly reason
function registeredMessage(status) {
  switch ((status || "").toUpperCase()) {
    case "CONFIRMED":
      return "You’ve already booked this event.";
    case "PENDING":
      return "You’ve already started a booking (payment pending).";
    case "REFUNDED":
      return "You had a booking that was refunded.";
    case "CANCELLED":
      return "You had a booking that was cancelled.";
    default:
      return "You’re already registered for this event.";
  }
}

export function BookButton({ eventId, quantity = 1, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [myReg, setMyReg] = useState(null); // existing registration for this event, if any

  const { user } = useAuth() || {};
  const { openAuth } = useAuthDialog() || {};

  // Pre-check: do I already have a registration for this event?
  useEffect(() => {
    let active = true;
    setMyReg(null);
    if (!user || !eventId) return;
    (async () => {
      try {
        const reg = await apiFetch(`/registrations/me?eventId=${eventId}`);
        if (active) setMyReg(reg || null);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id, eventId]);

  const alreadyRegistered = !!myReg; // any status means block a second booking

  async function handleClick() {
    setMsg(null);

    if (!user) {
      openAuth ? openAuth({ mode: "signin" }) : alert("Please sign in");
      return;
    }

    // Client-side guard (server also enforces)
    if (alreadyRegistered) {
      setMsg({ type: "info", text: registeredMessage(myReg.status) });
      return;
    }

    setLoading(true);
    try {
      // 1) Create/lookup registration (PENDING)
      const idempotencyKey = crypto?.randomUUID?.() || String(Date.now());
      let reg;

      try {
        reg = await apiFetch("/registrations", {
          method: "POST",
          body: JSON.stringify({ eventId, quantity, idempotencyKey }),
        });
      } catch (e) {
        const err = e?.body || {};
        if (err.error === "already_registered") {
          setMyReg(err.registration || { status: "UNKNOWN" });
          setMsg({
            type: "info",
            text: registeredMessage(err.registration?.status),
          });
          return;
        }
        throw e;
      }

      if (!reg?.id) throw new Error("No registration");

      // 2) Start payment
      const pay = await apiFetch("/payments/start", {
        method: "POST",
        body: JSON.stringify({ registrationId: reg.id }),
      });

      // 3) Open Razorpay
      await loadRazorpay();
      const amountPaise = Math.max(1, Math.trunc(Number(pay.amountMinor)));
      const rzp = new window.Razorpay({
        key: pay.keyId,
        order_id: pay.orderId,
        amount: amountPaise,
        currency: (pay.currency || "INR").toUpperCase(),
        name: "Social Dining",
        description: "Event booking",
        prefill: pay.buyer || {},
        theme: { color: "#B55725" },
        modal: {
          ondismiss: () => setMsg({ type: "info", text: "Checkout closed." }),
        },
        handler: () => {
          setMsg({
            type: "success",
            text: "Payment processing… you’ll get a confirmation email shortly.",
          });
          onSuccess?.();
        },
      });
      rzp.open();
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.body?.error || e.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  const buttonDisabled = loading || alreadyRegistered;
  const buttonLabel = alreadyRegistered
    ? "ALREADY REGISTERED"
    : loading
    ? "PROCESSING…"
    : "BOOK NOW";
  const tooltip = alreadyRegistered
    ? registeredMessage(myReg?.status)
    : undefined;

  const buttonEl = (
    <Button
      variant="contained"
      onClick={handleClick}
      disabled={buttonDisabled}
      fullWidth
      disableElevation
      startIcon={
        loading ? (
          <CircularProgress size={18} thickness={5} color="inherit" />
        ) : null
      }
      sx={{
        fontWeight: 700,
        border: "1px solid",
        borderColor: "primary.main",
        bgcolor: "primary.main",
        color: "#fff",
        "&:hover": { bgcolor: "primary.main" },

        // Disabled override — keep visible
        "&.Mui-disabled": {
          color: "#fff", // white label
          bgcolor: "rgba(255,255,255,0.08)", // subtle dark bg
          border: "1px solid",
          borderColor: "primary.main", // primary border
          opacity: 1, // cancel default fade
        },
      }}
    >
      {buttonLabel}
    </Button>
  );

  // Tooltips don’t fire on disabled buttons; wrap in a span.
  const content = tooltip ? (
    <Tooltip title={tooltip}>
      <span style={{ width: "100%" }}>{buttonEl}</span>
    </Tooltip>
  ) : (
    buttonEl
  );

  return (
    <Stack spacing={1}>
      {content}
      {msg && <Alert severity={msg.type}>{msg.text}</Alert>}
    </Stack>
  );
}
