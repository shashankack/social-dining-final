import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

import {
  Grid,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";

export function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  useEffect(() => {
    (async () => setClubs((await apiFetch(`/clubs`)).items || []))();
  }, []);
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Clubs
      </Typography>
      <Grid container spacing={2}>
        {clubs.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardActionArea component={Link} to={`/clubs/${c.id}`}>
                <CardContent>
                  <Typography variant="h6">{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
