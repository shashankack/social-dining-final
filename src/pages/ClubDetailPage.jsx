// src/pages/ClubDetails.jsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Alert,
  Button,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

import { useClub } from "../hooks/useClubs"; // fetch single club

export default function ClubDetails() {
  const { slug } = useParams();
  const { club, loading, error } = useClub(slug);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "secondary.main",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background gradients & vectors */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(181,87,37,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          right: -150,
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 80%)",
          borderRadius: "50%",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />

      <Container sx={{ py: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Button
            component={Link}
            to="/clubs"
            size="small"
            startIcon={<NavigateBeforeIcon />}
            sx={{
              textTransform: "none",
              color: "secondary.main",
              "&:hover": { color: "primary.main" },
            }}
          >
            Back to Clubs
          </Button>
        </Breadcrumbs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || "Failed to load club"}
          </Alert>
        )}

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "secondary.main",
          }}
        >
          {loading ? (
            <>
              <Skeleton variant="rectangular" height={260} />
              <CardContent>
                <Skeleton width="60%" />
                <Skeleton width="30%" />
                <Skeleton sx={{ mt: 1 }} height={120} />
              </CardContent>
            </>
          ) : (
            <>
              {(club?.coverImageUrl || club?.thumbnail) && (
                <CardMedia
                  component="img"
                  height="320"
                  image={club.coverImageUrl || club.thumbnail}
                  alt={club.title || club.name}
                  sx={{ objectFit: "cover" }}
                />
              )}
              <CardContent>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  gutterBottom
                  sx={{ color: "secondary.main" }}
                >
                  {club?.title || club?.name}
                </Typography>

                <Box
                  sx={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    "& .club-description-start": { marginBottom: "12px" },
                    "& .club-description-end": { marginTop: "12px" },
                    "& ul": { paddingLeft: "20px", margin: "12px 0" },
                    "& li": { margin: "6px 0" },
                    "& strong": { fontWeight: 700, color: "primary.main" },
                  }}
                  dangerouslySetInnerHTML={{ __html: club?.description || "" }}
                />
              </CardContent>
            </>
          )}
        </Card>
      </Container>
    </Box>
  );
}
