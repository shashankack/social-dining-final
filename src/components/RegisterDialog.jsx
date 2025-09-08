// src/components/RegisterDialog.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, Button, IconButton, InputAdornment,
  MenuItem, Alert, CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { createBooking, createOrder } from "../lib/api";

const PUBLIC_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(s);
  });
}

/**
 * activity: {
 *   id, title, registrationFee (paise),
 *   totalSlots, bookedSlots (booked count), currency?, coverImageUrl?
 * }
 */
export default function RegisterDialog({ open, onClose, activity, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    instagramHandle: "",
    quantity: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // price (₹)
  const inrPrice = useMemo(() => {
    const fee = typeof activity?.registrationFee === "number" ? activity.registrationFee : 0;
    return (fee / 100).toFixed(2);
  }, [activity]);

  // capacity math
  const total = Number(activity?.totalSlots ?? 0);
  const booked = Number(activity?.bookedSlots ?? 0); // misnamed: booked count
  const remaining = Math.max(0, total - booked);
  const perUserCap = 4; // <= 4 tickets per user
  const maxSelectable = Math.min(perUserCap, Math.max(1, remaining));

  const qtyOptions = Array.from({ length: maxSelectable }, (_, i) => i + 1);
  const disabled = !activity || remaining <= 0;

  // validators (email+phone required)
  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(form.email.trim()), [form.email]);
  const phoneDigits = useMemo(() => form.phone.replace(/\D/g, ""), [form.phone]);
  const phoneValid = useMemo(() => phoneDigits.length >= 10 && phoneDigits.length <= 13, [phoneDigits]);

  // reset error on open
  useEffect(() => {
    if (open) setErr("");
  }, [open]);

  // clamp quantity if remaining/per-user cap changes
  useEffect(() => {
    setForm((prev) => {
      const nextQty = Math.min(prev.quantity || 1, maxSelectable);
      return nextQty === prev.quantity ? prev : { ...prev, quantity: nextQty };
    });
  }, [maxSelectable]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "quantity" ? Number(value) : value }));
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setErr("");

    if (!emailValid) return setErr("Please enter a valid email address.");
    if (!phoneValid) return setErr("Please enter a valid phone number (10–13 digits).");
    if (remaining <= 0) return setErr("This event is sold out.");
    if (form.quantity < 1) return setErr("Please select at least 1 ticket.");
    if (form.quantity > maxSelectable) {
      return setErr(`You can book up to ${maxSelectable} ticket(s) right now.`);
    }

    setSubmitting(true);
    try {
      const bookingPayload = {
        activityId: activity.id,
        quantity: form.quantity,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: phoneDigits, // normalized digits
        instagramHandle: form.instagramHandle.trim() || undefined,
        notes: { source: "web_register_dialog" },
      };

      const bookingRes = await createBooking(bookingPayload);
      const bookingId = bookingRes?.bookingId;
      if (!bookingId) throw new Error("Booking creation failed: missing bookingId.");

      let orderId = bookingRes?.order?.id;
      let amount = bookingRes?.amount;
      let currency = bookingRes?.currency || "INR";
      let key = bookingRes?.key_id || PUBLIC_KEY;

      if (!orderId) {
        const orderRes = await createOrder({ bookingId });
        orderId = orderRes?.orderId || orderRes?.order?.id;
        amount = orderRes?.amount ?? amount;
        currency = orderRes?.currency || currency;
        key = orderRes?.key || key;
      }

      if (!orderId) throw new Error("No Razorpay order id returned.");
      if (!key) throw new Error("Missing Razorpay key id (server or VITE_RAZORPAY_KEY_ID).");

      await loadRazorpay();

      const rzOptions = {
        key,
        order_id: orderId,
        amount,
        currency,
        name: "Safa Social",
        description: activity?.title || "Event Registration",
        image: activity?.coverImageUrl || undefined,
        prefill: {
          name: form.name,
          email: form.email,
          contact: phoneDigits,
        },
        notes: {
          booking_id: bookingId,
          activity_id: activity.id,
          quantity: String(form.quantity),
        },
        theme: { color: "#111827" },
        handler: () => {
          onClose?.();
          onSuccess?.(bookingId);
        },
        modal: {
          ondismiss: () => setErr("Payment not completed. You can try again."),
        },
      };

      const rzp = new window.Razorpay(rzOptions);
      rzp.on("payment.failed", (resp) => {
        setErr(resp?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
        Register for {activity?.title ?? "Event"}
        <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="register-form">
          <Stack spacing={2}>
            {disabled && <Alert severity="warning">This event is sold out or unavailable.</Alert>}

            <TextField
              name="name"
              label="Full name"
              value={form.name}
              onChange={onChange}
              required
              fullWidth
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              fullWidth
              error={!!form.email && !emailValid}
              helperText={
                form.email && !emailValid
                  ? "Enter a valid email address"
                  : "We'll email your receipt & updates"
              }
            />

            <TextField
              name="phone"
              label="Phone"
              value={form.phone}
              onChange={onChange}
              required
              fullWidth
              error={!!form.phone && !phoneValid}
              helperText={
                form.phone && !phoneValid
                  ? "Enter a valid number (10–13 digits)"
                  : "WhatsApp number works too"
              }
              InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
            />

            <TextField
              name="instagramHandle"
              label="Instagram (optional)"
              value={form.instagramHandle}
              onChange={onChange}
              fullWidth
              placeholder="@yourhandle"
            />

            {/* Qty dropdown — capped by remaining and 4 per user */}
            <TextField
              select
              name="quantity"
              label="Tickets"
              value={form.quantity}
              onChange={onChange}
              fullWidth
              disabled={disabled}
              helperText={
                typeof activity?.registrationFee === "number"
                  ? `₹${inrPrice} per ticket • ${remaining} left • limit ${perUserCap}/user`
                  : `${remaining} left • limit ${perUserCap}/user`
              }
            >
              {qtyOptions.map((q) => (
                <MenuItem key={q} value={q}>
                  {q}
                </MenuItem>
              ))}
            </TextField>

            {err ? <Alert severity="error">{err}</Alert> : null}
          </Stack>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            submitting ||
            disabled ||
            !form.name.trim() ||
            !emailValid ||
            !phoneValid
          }
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting ? "Processing..." : "Proceed to Pay"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
