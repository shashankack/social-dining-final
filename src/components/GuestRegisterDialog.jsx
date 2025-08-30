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

      const storageKey = `guest-idemp:${eventId}:${email}`;
      let idKey =
        sessionStorage.getItem(storageKey) ||
        crypto?.randomUUID?.() ||
        String(Date.now());
      sessionStorage.setItem(storageKey, idKey);

      const start = await guestStart(
        { eventId, quantity: 1, buyer: { name, email, phone } },
        idKey
      );

      const options = {
        key: start.keyId,
        order_id: start.orderId,
        amount: start.amountMinor,
        currency: start.currency,
        name: "Social Dining",
        description: eventTitle,
        prefill: { name, email, contact: phone },
        notes: { registrationId: start.registrationId },
        handler: () => {
          setTimeout(() => {
            window.location.assign(
              `/thank-you?rid=${
                start.registrationId
              }&email=${encodeURIComponent(email)}`
            );
          }, 250);
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
