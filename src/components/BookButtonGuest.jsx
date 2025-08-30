import React from "react";
import { Button, Alert, Stack, Tooltip } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import GuestRegisterDialog from "./GuestRegisterDialog";

export default function BookButtonGuest({
  eventId,
  eventTitle,
  unitPriceMinor,
  defaultQty = 1,
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false); // kept for UI parity
  const [msg, setMsg] = React.useState(null);

  const buttonEl = (
    <Button
      variant="contained"
      onClick={() => setOpen(true)}
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
      }}
    >
      BOOK NOW
    </Button>
  );

  return (
    <Stack spacing={1}>
      <Tooltip title={undefined}>
        <span style={{ width: "100%" }}>{buttonEl}</span>
      </Tooltip>
      {msg && <Alert severity={msg.type}>{msg.text}</Alert>}
      <GuestRegisterDialog
        open={open}
        onClose={() => setOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        unitPriceMinor={unitPriceMinor}
        defaultQty={defaultQty}
      />
    </Stack>
  );
}
