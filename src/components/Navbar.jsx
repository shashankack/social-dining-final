// src/components/Navbar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useScrollTrigger,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
// import { useAuth } from "../lib/auth";
// import { useAuthDialog } from "./AuthDialogProvider";

// const USE_GUEST_FLOW = import.meta.env.VITE_GUEST_FLOW === "1";
const USE_GUEST_FLOW = "1";

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // const auth = useAuth();
  // const user = auth?.user;
  // const signout = auth?.signout;

  // const authDialog = useAuthDialog?.();
  // const openAuth = authDialog?.openAuth;

  const [open, setOpen] = useState(false);
  const toggle = (val) => () => setOpen(val);
  const onHome = location.pathname === "/";

  // Adds shadow/solid bg after slight scroll
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });

  const goSection = (id) => {
    if (onHome) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate(`/?scrollTo=${id}`);
      }
    } else {
      navigate(`/?scrollTo=${id}`);
    }
  };

  const leftItems = [
    {
      label: "Home",
      onClick: () => (onHome ? goSection("home") : navigate("/")),
      active:
        onHome &&
        (location.search.includes("home") || location.hash === "#home"),
    },
    {
      label: "About",
      onClick: () => {
        if (onHome) goSection("about");
        else navigate("/");
        setTimeout(() => {
          goSection("about");
        }, 100);
      },
      active:
        onHome &&
        (location.search.includes("about") || location.hash === "#about"),
    },
    {
      label: "Events",
      onClick: () => {
        if (onHome) goSection("events");
        else navigate("/");
        setTimeout(() => {
          goSection("events");
        }, 100);
      },
      active:
        onHome &&
        (location.search.includes("events") || location.hash === "#events"),
    },
  ];

  const RightButtons = () => {
    if (USE_GUEST_FLOW) {
      // Guest mode: one primary CTA to jump to Events
      return (
        <Button
          variant="contained"
          sx={{
            ml: 1,
            textTransform: "none",
            bgcolor: "primary.main",
            color: "#000",
            fontWeight: 700,
            "&:hover": { bgcolor: "primary.main", filter: "brightness(1.1)" },
          }}
          onClick={() => {
            if (onHome) {
              const el = document.getElementById("events");
              el ? el.scrollIntoView({ behavior: "smooth" }) : navigate("/");
            } else {
              navigate("/?scrollTo=events");
            }
          }}
        >
          Book an event
        </Button>
      );
    }

    // Original auth UI
    return (
      <>
        {user ? (
          <>
            <Button
              color="inherit"
              component={RouterLink}
              to="/account"
              sx={{ textTransform: "none", fontWeight: 500, opacity: 0.9 }}
            >
              My Account
            </Button>
            <Button
              onClick={() => {
                signout?.();
                navigate("/");
              }}
              variant="outlined"
              sx={{
                ml: 1,
                textTransform: "none",
                borderColor: "primary.main",
                color: "secondary.main",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "primary.main",
                  color: "#000",
                },
              }}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              onClick={() => openAuth?.({ mode: "signin" })}
              sx={{ textTransform: "none", fontWeight: 500, opacity: 0.9 }}
            >
              Sign in
            </Button>
            <Button
              variant="contained"
              sx={{
                ml: 1,
                textTransform: "none",
                bgcolor: "primary.main",
                color: "#000",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "primary.main",
                  filter: "brightness(1.1)",
                },
              }}
              onClick={() => openAuth?.({ mode: "signup" })}
            >
              Sign up
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          zIndex: 5,
          backdropFilter: "blur(14px) saturate(150%)",
          background: scrolled
            ? "linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.78) 100%)"
            : "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%)",
          borderBottom: "1px solid rgba(181,87,37,0.25)",
          transition: "all 0.25s ease",
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 76 }}>
          {/* Brand */}
          <Box
            onClick={() => navigate("/")}
            component="img"
            src="/images/sd_logo.svg"
            sx={{
              width: 80,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          />

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {leftItems.map((it) => (
                <Button
                  key={it.label}
                  onClick={it.onClick}
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    fontWeight: it.active ? 700 : 500,
                    letterSpacing: 0.2,
                    position: "relative",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      bgcolor: "rgba(255,255,255,0.05)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 6,
                      left: "20%",
                      right: "20%",
                      height: 2,
                      borderRadius: 1,
                      bgcolor: "primary.main",
                      opacity: it.active ? 1 : 0,
                      transform: it.active ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "center",
                      transition: "all 0.3s ease",
                      boxShadow: it.active
                        ? "0 0 6px rgba(181,87,37,0.8)"
                        : "none",
                    },
                    "&:hover::after": { transform: "scaleX(1)", opacity: 1 },
                  }}
                >
                  {it.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flex: 1 }} />

          {/* Right side */}
          {!isMobile ? (
            <RightButtons />
          ) : (
            <IconButton
              edge="end"
              color="inherit"
              onClick={toggle(true)}
              sx={{
                color: "secondary.main",
                border: "1px solid rgba(255,255,255,0.18)",
                bgcolor: "rgba(255,255,255,0.04)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.12)",
                  transform: "rotate(5deg)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggle(false)}
        PaperProps={{
          sx: {
            width: 350,
            bgcolor: "#0d0d0d",
            borderLeft: "1px solid rgba(181, 87, 37, 0)",
            backgroundImage:
              "linear-gradient(160deg, rgba(181,87,37,0.08) 0%, transparent 100%)",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.6)",
            color: "secondary.main",
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              px: 1,
              pb: 1,
              opacity: 0.85,
              letterSpacing: 0.6,
              color: "secondary.main",
            }}
          >
            Menu
          </Typography>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1 }} />
          <List>
            {leftItems.map((it) => (
              <ListItemButton
                key={it.label}
                onClick={() => {
                  it.onClick();
                  setOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: "secondary.main",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                <ListItemText
                  primary={it.label}
                  primaryTypographyProps={{
                    fontWeight: it.active ? 700 : 500,
                    letterSpacing: 0.2,
                    color: "secondary.main",
                  }}
                />
              </ListItemButton>
            ))}

            <Box sx={{ mt: 1.5, px: 1 }}>
              {USE_GUEST_FLOW ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: "none", borderRadius: 2, color: "#000" }}
                  onClick={() => {
                    setOpen(false);
                    if (onHome) {
                      const el = document.getElementById("events");
                      el
                        ? el.scrollIntoView({ behavior: "smooth" })
                        : navigate("/");
                    } else {
                      navigate("/?scrollTo=events");
                    }
                  }}
                >
                  Book an event
                </Button>
              ) : user ? (
                <>
                  <Button
                    fullWidth
                    sx={{
                      mb: 1,
                      textTransform: "none",
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.06)",
                      color: "secondary.main",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    onClick={() => {
                      navigate("/account");
                      setOpen(false);
                    }}
                  >
                    My Account
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      color: "#000",
                    }}
                    onClick={() => {
                      signout?.();
                      setOpen(false);
                      navigate("/");
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    fullWidth
                    sx={{
                      mb: 1,
                      textTransform: "none",
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.06)",
                      color: "secondary.main",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    onClick={() => {
                      openAuth?.({ mode: "signin" });
                      setOpen(false);
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      color: "#000",
                    }}
                    onClick={() => {
                      openAuth?.({ mode: "signup" });
                      setOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Box>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
