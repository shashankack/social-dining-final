import React from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  CircularProgress,
  Stack,
  Typography,
  Alert,
  Button,
  Divider,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { guestStatus } from "../lib/guestApi";

export default function ThankYouPage() {
  const [sp] = useSearchParams();
  const rid = sp.get("rid") || "";
  const email = sp.get("email") || "";

  const [state, setState] = React.useState("loading"); // loading | ok | pending | error
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

  const Wrapper = ({ children }) => (
    <Box
      sx={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: { xs: 6, md: 10 },
        background:
          "radial-gradient(70vw 70vw at 100% -10%, rgba(181,87,37,0.16) 0%, rgba(0,0,0,0) 55%), radial-gradient(60vw 60vw at -20% 120%, rgba(181,87,37,0.10) 0%, rgba(0,0,0,0) 60%)",
      }}
    >
      {children}
    </Box>
  );

  const Card = ({ children, tone = "default" }) => (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 560,
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        border: "1px solid",
        borderColor:
          tone === "success"
            ? "rgba(76, 175, 80, 0.35)"
            : tone === "warning"
            ? "rgba(255, 193, 7, 0.35)"
            : tone === "error"
            ? "rgba(244, 67, 54, 0.35)"
            : "rgba(181,87,37,0.35)",
        bgcolor: "rgba(0,0,0,0.35)",
        backdropFilter: "saturate(130%) blur(6px)",
      }}
    >
      {children}
    </Paper>
  );

  if (state === "loading") {
    return (
      <Wrapper>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="secondary.main" sx={{ opacity: 0.9 }}>
            Checking your payment status…
          </Typography>
        </Stack>
      </Wrapper>
    );
  }

  if (state === "ok") {
    const rupees = Math.round((details?.totalPriceMinor || 0) / 100);
    return (
      <Wrapper>
        <Card tone="success">
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CheckCircleRoundedIcon
                sx={{ color: "success.main", fontSize: 28 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Payment successful 🎉
              </Typography>
            </Stack>

            <Alert
              icon={<EmailRoundedIcon fontSize="small" />}
              severity="info"
              sx={{ borderRadius: 2 }}
            >
              A confirmation email will be sent to <b>{email}</b> with your
              booking details.
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                p: 2,
                bgcolor: "rgba(0,0,0,0.25)",
                borderColor: "rgba(181,87,37,0.35)",
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ReceiptLongRoundedIcon sx={{ opacity: 0.9 }} />
                  <Typography sx={{ fontWeight: 700 }}>
                    Receipt summary
                  </Typography>
                </Stack>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ color: "secondary.main" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventSeatRoundedIcon sx={{ opacity: 0.9 }} />
                    <Typography>Seats</Typography>
                  </Stack>
                  <Typography sx={{ fontWeight: 700 }}>
                    {details?.quantity}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ color: "secondary.main" }}
                >
                  <Typography>Total paid</Typography>
                  <Typography sx={{ fontWeight: 800 }}>
                    ₹{rupees.toLocaleString("en-IN")}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ color: "secondary.main", opacity: 0.9 }}
                >
                  <Typography>Registration ID</Typography>
                  <Typography sx={{ fontFamily: "monospace" }}>
                    {rid}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{ borderRadius: 2 }}
              >
                Explore more events
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/"
                sx={{ borderRadius: 2, color: "#000" }}
              >
                Done
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Wrapper>
    );
  }

  if (state === "pending") {
    return (
      <Wrapper>
        <Card tone="warning">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <HourglassBottomRoundedIcon
              sx={{ color: "warning.main", fontSize: 32 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Waiting for confirmation…
            </Typography>
            <Typography color="secondary.main" sx={{ opacity: 0.9 }}>
              We’re processing your payment. This usually takes a few seconds.
            </Typography>

            <Alert
              icon={<EmailRoundedIcon fontSize="small" />}
              severity="info"
              sx={{ width: "100%", borderRadius: 2 }}
            >
              You’ll receive a confirmation email at <b>{email}</b> as soon as
              your booking is confirmed.
            </Alert>

            <Box sx={{ mt: 1 }}>
              <CircularProgress />
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{ mt: 1 }}
            >
              <Button variant="text" component={RouterLink} to="/">
                Back to events
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Refresh now
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Wrapper>
    );
  }

  // error
  return (
    <Wrapper>
      <Card tone="error">
        <Stack spacing={2} alignItems="center" textAlign="center">
          <ErrorOutlineRoundedIcon sx={{ color: "error.main", fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            We couldn’t confirm your payment
          </Typography>
          {err && (
            <Typography
              sx={{ color: "secondary.main", opacity: 0.9, maxWidth: 420 }}
            >
              {String(err)}
            </Typography>
          )}

          <Alert
            severity="info"
            icon={<EmailRoundedIcon fontSize="small" />}
            sx={{ width: "100%", borderRadius: 2 }}
          >
            If the payment eventually clears, a confirmation email will be sent
            to <b>{email}</b>. Otherwise, please retry from the event page.
          </Alert>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ mt: 1 }}
          >
            <Button variant="outlined" component={RouterLink} to="/">
              Back to events
            </Button>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ color: "#000" }}
            >
              Try again
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Wrapper>
  );
}
