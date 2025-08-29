import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { EventCard } from "../components/EventCard";
import { Grid, Container, Typography } from "@mui/material";

export function ClubDetailPage() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [evts, setEvts] = useState([]);
  useEffect(() => {
    (async () => {
      setClub(await apiFetch(`/clubs/${id}`));
      const res = await apiFetch(
        `/clubs/${id}/events?onlyAvailable=true&sort=startsAtAsc`
      );
      setEvts(res.items || []);
    })();
  }, [id]);

  if (!club)
    return (
      <Container sx={{ py: 3 }}>
        <Typography>Loading…</Typography>
      </Container>
    );
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {club.name}
      </Typography>
      <Typography sx={{ mb: 3 }}>{club.description}</Typography>
      <Grid container spacing={2}>
        {evts.map((e) => (
          <Grid item xs={12} sm={6} md={4} key={e.id}>
            <EventCard e={e} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
