// src/App.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import ClubDetailPage from "./pages/ClubDetailPage";

import Navbar from "./components/Navbar";

const HomePage = lazy(() => import("./pages/HomePage"));

const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));

export default function App() {
  return (
    <>
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
            }}
          >
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
