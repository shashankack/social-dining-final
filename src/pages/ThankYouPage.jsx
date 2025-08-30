import React from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  CircularProgress,
  Stack,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import { guestStatus } from "../lib/guestApi";

export default function ThankYouPage() {
  const [sp] = useSearchParams();
  const rid = sp.get("rid") || "";
  const email = sp.get("email") || "";

  const [state, setState] = React.useState("loading"); // loading|ok|pending|error
  const [details, setDetails] = React.useState(null);
  const [err, setErr] = React.useState();

  React.useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const s = await guestStatus(rid, email);
        if (!alive) return;
        if (s.status === "CONFIRMED") {
          setState("ok");
          setDetails(s);
          return;
        }
        if (s.status === "PENDING") {
          setState("pending");
          return;
        }
        setState("error");
      } catch (e) {
        setErr(e?.message);
        setState("error");
      }
    }
    poll();
    const t = setInterval(poll, 2500);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [rid, email]);

  if (state === "loading") {
    return (
      <Stack alignItems="center" mt={6}>
        <CircularProgress />
      </Stack>
    );
  }
  if (state === "ok") {
    const rupees = Math.round((details?.totalPriceMinor || 0) / 100);
    return (
      <Stack spacing={2} mt={6} alignItems="center">
        <Typography variant="h5">Payment successful 🎉</Typography>
        <Typography>Your booking is confirmed.</Typography>
        <Typography>
          Seats: {details?.quantity} • Paid: ₹{rupees.toLocaleString("en-IN")}
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
          Back to events
        </Button>
      </Stack>
    );
  }
  if (state === "pending") {
    return (
      <Stack spacing={2} mt={6} alignItems="center">
        <Typography variant="h5">Waiting for confirmation…</Typography>
        <Typography>
          We’re processing your payment. This usually takes a few seconds.
        </Typography>
        <CircularProgress />
      </Stack>
    );
  }
  return (
    <Stack spacing={2} mt={6} alignItems="center">
      <Alert severity="error">
        We couldn’t confirm your payment{err ? `: ${err}` : ""}.
      </Alert>
      <Button variant="outlined" component={RouterLink} to="/">
        Back to events
      </Button>
    </Stack>
  );
}
