// src/components/AuthDialogProvider.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  Dialog,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../lib/auth";
import { useNavigate, useLocation } from "react-router-dom";

const Ctx = createContext(null);
export function useAuthDialog() {
  return useContext(Ctx);
}

const REDIRECT_KEY = "auth_redirect_to";

export function AuthDialogProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [redirectTo, setRedirectTo] = useState("/");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
    setLoading(false);
  }

  function openAuth({ mode = "signin", redirectTo = "/" } = {}) {
    setMode(mode);
    setRedirectTo(redirectTo || "/");
    sessionStorage.setItem(REDIRECT_KEY, redirectTo || "/");
    resetForm();
    setOpen(true);
  }
  function closeAuth() {
    setOpen(false);
  }

  // Auto-open when user hits /signin or /signup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qRedirect = params.get("redirect");
    if (location.pathname === "/signin" || location.pathname === "/signup") {
      openAuth({
        mode: location.pathname === "/signup" ? "signup" : "signin",
        redirectTo: qRedirect || "/",
      });
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  async function onSubmit(e) {
    e?.preventDefault?.();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      const target = sessionStorage.getItem(REDIRECT_KEY) || redirectTo || "/";
      sessionStorage.removeItem(REDIRECT_KEY);
      setOpen(false);
      navigate(target, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err?.body?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  const ctxValue = useMemo(() => ({ openAuth, closeAuth }), []);

  return (
    <Ctx.Provider value={ctxValue}>
      {children}

      <Dialog
        open={open}
        onClose={closeAuth}
        fullScreen
        // Make the dialog paper transparent so we can render our own full-screen background
        PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" } }}
      >
        {/* Full-screen background */}
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "background.default", // #000000 from your theme
            // Subtle primary glow & vignette
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(40vw 40vw at 15% 20%, rgba(181,87,37,0.18) 0%, rgba(181,87,37,0.06) 40%, rgba(0,0,0,0.0) 70%)",
              pointerEvents: "none",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(60vw 60vw at 100% 100%, rgba(181,87,37,0.22) 0%, rgba(0,0,0,0.0) 55%)",
              pointerEvents: "none",
            },
          }}
        />

        <IconButton
          aria-label="close"
          onClick={closeAuth}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            color: "secondary.main",
            zIndex: 2,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Content grid */}
        <Grid
          container
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
          }}
        >
          {/* Brand / pitch panel (hidden on small) */}
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              p: 6,
            }}
          >
            <Box sx={{ maxWidth: 520 }}>
              <Typography
                variant="h2"
                sx={{
                  color: "secondary.main",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  mb: 2,
                }}
              >
                Social Dining
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "secondary.main", opacity: 0.8, mb: 3 }}
              >
                A close-knit social club where small circles spark big moments.
              </Typography>
              <Divider
                sx={{
                  borderColor: "primary.main",
                  borderWidth: 1.5,
                  width: 80,
                  mb: 3,
                }}
              />
              <Stack spacing={1.2}>
                {[
                  "Curated members & intimate events",
                  "Seamless booking with instant confirmations",
                  "Clubs for foodies, fitness buffs, founders & more",
                ].map((t, i) => (
                  <Typography
                    key={i}
                    sx={{ color: "secondary.main", opacity: 0.7 }}
                  >
                    • {t}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Form panel */}
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
            sx={{
              display: "grid",
              placeItems: "center",
              p: { xs: 2.5, md: 6 },
            }}
          >
            {/* Card-like container */}
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: 440,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.02)",
                border: "1px solid",
                borderColor: "rgba(181,87,37,0.35)",
                p: 3,
                backdropFilter: "blur(2px)",
              }}
              component="form"
              onSubmit={onSubmit}
            >
              <Tabs
                value={mode}
                onChange={(_, v) => {
                  setMode(v);
                  setError(null);
                }}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  mb: 2,
                  "& .MuiTab-root": {
                    color: "secondary.main",
                    opacity: 0.7,
                    textTransform: "none",
                    fontWeight: 600,
                  },
                  "& .Mui-selected": { opacity: 1 },
                }}
              >
                <Tab label="Sign In" value="signin" />
                <Tab label="Sign Up" value="signup" />
              </Tabs>

              <Stack spacing={2.2} sx={{ mt: 1 }}>
                {mode === "signup" && (
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    autoFocus
                    variant="outlined"
                    InputLabelProps={{ sx: { color: "secondary.main" } }}
                    InputProps={{
                      sx: {
                        color: "secondary.main",
                        fieldset: { borderColor: "rgba(255,255,255,0.18)" },
                        "&:hover fieldset": {
                          borderColor: "rgba(255,255,255,0.35)",
                        },
                      },
                    }}
                  />
                )}

                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  autoFocus={mode === "signin"}
                  variant="outlined"
                  InputLabelProps={{ sx: { color: "secondary.main" } }}
                  InputProps={{
                    sx: {
                      color: "secondary.main",
                      fieldset: { borderColor: "rgba(255,255,255,0.18)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.35)",
                      },
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  InputLabelProps={{ sx: { color: "secondary.main" } }}
                  InputProps={{
                    sx: {
                      color: "secondary.main",
                      fieldset: { borderColor: "rgba(255,255,255,0.18)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.35)",
                      },
                    },
                  }}
                />

                {error && (
                  <Typography color="primary.main">{String(error)}</Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                  sx={{ mt: 1 }}
                >
                  {loading
                    ? mode === "signin"
                      ? "Signing in…"
                      : "Creating…"
                    : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
                </Button>

                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", color: "secondary.main", mt: 0.5 }}
                >
                  {mode === "signin" ? "No account?" : "Have an account?"}{" "}
                  <Button
                    size="small"
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      setError(null);
                    }}
                    sx={{
                      textTransform: "none",
                      p: 0,
                      color: "primary.main",
                      fontWeight: 700,
                    }}
                  >
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </Button>
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Dialog>
    </Ctx.Provider>
  );
}
