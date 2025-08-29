import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

export function EventCard({ e }) {
  const remaining = Math.max(0, (e.slotsTotal ?? 0) - (e.slotsTaken ?? 0));
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardActionArea component={Link} to={`/events/${e.slug}`}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">{e.title}</Typography>
            <Chip
              size="small"
              label={e.status}
              color={e.status === "UPCOMING" ? "primary" : "default"}
            />
          </Stack>
          {e.venueName && (
            <Typography variant="body2" color="text.secondary">
              📍 {e.venueName}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            🗓 {new Date(e.startsAt).toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            🎟 Remaining: {remaining}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
