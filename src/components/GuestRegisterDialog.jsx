// src/components/GuestRegisterDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { loadRazorpay } from "../lib/razorpay";
import { guestStart } from "../lib/guestApi";

function isEmail(v) {
  return /.+@.+\..+/.test(v);
}
function isPhone(v) {
  return /[0-9+\-()\s]{6,}/.test(v);
}

export default function GuestRegisterDialog({
  open,
  onClose,
  eventId,
  eventTitle,
  unitPriceMinor, // paise
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPhone("");
      setErr(null);
    }
  }, [open]);

  const valid = name.trim().length >= 2 && isEmail(email) && isPhone(phone);

  async function proceed() {
    setBusy(true);
    setErr(null);
    try {
      await loadRazorpay();

      // Fresh idempotency key per attempt (prevents reusing a paid order)
      const idKey = crypto?.randomUUID?.() || String(Date.now());

      const start = await guestStart(
        { eventId, quantity: 1, buyer: { name, email, phone } },
        idKey
      );

      // Support both shapes from backend
      const orderId = start.razorpayOrderId || start.orderId;
      const amountMinor = start.amountMinor ?? start.amount;
      if (!orderId)
        throw new Error("Unable to create order. Please try again.");

      const options = {
        key: start.keyId,
        order_id: orderId,
        amount: amountMinor, // ignored by Checkout when order_id provided
        currency: start.currency || "INR",
        name: "Social Dining",
        description: eventTitle,
        prefill: { name, email, contact: phone },
        notes: { registrationId: start.registrationId },
        handler: () => {
          // Success → thank-you (webhook will confirm)
          setTimeout(() => {
            window.location.assign(
              `/thank-you?rid=${
                start.registrationId
              }&email=${encodeURIComponent(email)}`
            );
          }, 250);
        },
        modal: {
          ondismiss: () => {
            // No persistence — next click will create a fresh order
          },
        },
      };

      new window.Razorpay(options).open();
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const totalPaise = unitPriceMinor || 0;
  const rupees = Math.floor(totalPaise / 100);
  const paise = String(totalPaise % 100).padStart(2, "0");

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Register for {eventTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {err && <Alert severity="error">{err}</Alert>}
          <TextField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            required
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            required
            helperText="We’ll send your booking confirmation to this address."
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={busy}
            required
          />
          <div style={{ opacity: 0.85 }}>
            Total: ₹{rupees.toLocaleString("en-IN")}
            {paise ? `.${paise}` : ""}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={proceed} disabled={!valid || busy}>
          Proceed to Pay
        </Button>
      </DialogActions>
    </Dialog>
  );
}
