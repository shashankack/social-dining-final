import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";

export function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login failed", err);
      setError(err?.body?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container sx={{ py: 4, maxWidth: 480 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            {error && <Typography color="error">{String(error)}</Typography>}
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
            <Typography variant="body2">
              No account? <Link to="/signup">Sign up</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
