import React from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Skeleton,
  Alert,
} from "@mui/material";

import { useClubs } from "../hooks/useClubs"; // uses listClubs() -> http() -> API

function toSnippet(html, maxLen = 160) {
  if (!html) return "";
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
}

function ClubsPage() {
  const { clubs, loading, error } = useClubs();

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Clubs
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || "Failed to load clubs"}
        </Alert>
      )}

      <Grid container spacing={2}>
        {(loading ? Array.from({ length: 6 }) : clubs).map((c, idx) => {
          const idOrSlug = c?.slug || c?.id;
          const title = c?.title || c?.name || "Untitled Club";
          const img =
            c?.thumbnail ||
            c?.coverImageUrl || // from your API
            c?.bannerUrl ||
            c?.imageUrl ||
            c?.coverUrl ||
            "";

          return (
            <Grid item xs={12} sm={6} md={4} key={c?.id || idx}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                {loading ? (
                  <>
                    <Skeleton variant="rectangular" height={160} />
                    <CardContent>
                      <Skeleton width="70%" />
                      <Skeleton width="90%" />
                      <Skeleton width="60%" />
                    </CardContent>
                  </>
                ) : (
                  <CardActionArea component={Link} to={`/clubs/${idOrSlug}`}>
                    {img && (
                      <CardMedia
                        component="img"
                        height="160"
                        image={img}
                        alt={title}
                        sx={{ objectFit: "cover" }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {toSnippet(c?.description)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {!loading && !error && clubs.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No clubs yet — check back soon.
        </Typography>
      )}
    </Container>
  );
}

export default ClubsPage; // <-- add this
export { ClubsPage }; // (optional) keep named export too
