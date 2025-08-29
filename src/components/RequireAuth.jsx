/* @refresh reload */
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../lib/auth";
import { useAuthDialog } from "./AuthDialogProvider";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth() || {};
  const { openAuth } = useAuthDialog() || {};
  const location = useLocation();
  const navigate = useNavigate();
  const openedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user && !openedRef.current) {
      openedRef.current = true;
      const redirectTo = location.pathname + location.search;

      if (openAuth) {
        openAuth({ mode: "signin", redirectTo });
        navigate("/", { replace: true });
      } else {
        navigate(`/signin?redirect=${encodeURIComponent(redirectTo)}`, {
          replace: true,
        });
      }
    }
  }, [user, loading, openAuth, location.pathname, location.search, navigate]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  return children;
}
