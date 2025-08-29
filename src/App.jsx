// src/App.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import RequireAuth from "./components/RequireAuth";
import Navbar from "./components/Navbar";

// Lazy-load your page(s)
const HomePage = lazy(() => import("./pages/HomePage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const ClubsPage = lazy(() =>
  import("./pages/ClubsPage").then((m) => ({ default: m.ClubsPage }))
);
const ClubDetailPage = lazy(() =>
  import("./pages/ClubsPage").then((m) => ({ default: m.ClubDetailPage }))
);
const AccountPage = lazy(() => import("./pages/AccountPage"));

export default function App() {
  return (
    <>
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        }
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/events/:slug"
            element={
              <RequireAuth>
                <EventDetailPage />
              </RequireAuth>
            }
          />
          <Route path="/clubs/:id" element={<ClubDetailPage />} />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
