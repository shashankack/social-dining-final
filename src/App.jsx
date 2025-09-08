// src/App.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import ClubDetailPage from "./pages/ClubDetailPage";

import RequireAuth from "./components/RequireAuth";
import Navbar from "./components/Navbar";

// Lazy-load your page(s)
const HomePage = lazy(() => import("./pages/HomePage"));

const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));

// const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
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
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/club/:slug" element={<ClubDetailPage />} />
          {/* <Route path="/thank-you" element={<ThankYouPage />} /> */}
          {/* <Route path="/account" element={<AccountPage />} /> */}
        </Routes>
      </Suspense>
    </>
  );
}
