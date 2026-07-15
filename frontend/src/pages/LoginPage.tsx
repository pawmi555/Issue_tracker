import { Box, Container, Paper, Typography } from "@mui/material";

import { Navigate, useLocation, useNavigate } from "react-router";

import LoginForm from "../features/auth/components/LoginForm";
import { useAuthStore } from "../stores/auth.store";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const state = location.state as LoginLocationState | null;

  const redirectPath = state?.from?.pathname ?? "/";

  if (isInitialized && user) {
    return <Navigate to="/" replace />;
  }

  const handleLoginSuccess = () => {
    navigate(redirectPath, {
      replace: true,
    });
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Issue Tracker
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 4 }}>
            アカウントへログインしてください
          </Typography>

          <LoginForm onSuccess={handleLoginSuccess} />
        </Paper>
      </Container>
    </Box>
  );
}
