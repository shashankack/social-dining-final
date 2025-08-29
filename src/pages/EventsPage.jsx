import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { EventCard } from "../components/EventCard";
import { Grid, Container, Typography } from "@mui/material";

export default function EventsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(
          `/events?onlyAvailable=true&includeClub=true&sort=startsAtAsc`
        );
        setItems(res.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Events
      </Typography>
      <Grid container spacing={2}>
        {loading ? (
          <Typography>Loading events…</Typography>
        ) : (
          items.map((e) => (
            <Grid item xs={12} sm={6} md={4} key={e.id}>
              <EventCard e={e} />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}
