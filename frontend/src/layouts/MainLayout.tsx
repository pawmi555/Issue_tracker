import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";

import { Outlet, useNavigate } from "react-router";

import { useLogout } from "../features/auth/hooks/useLogout";

export default function MainLayout() {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Issue Tracker
          </Typography>

          <Button
            color="inherit"
            onClick={() => {
              navigate("/projects");
            }}
          >
            Projects
          </Button>

          <Button
            color="inherit"
            disabled={logoutMutation.isPending}
            onClick={() => {
              void handleLogout();
            }}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} disableGutters>
        <Outlet />
      </Container>
    </Box>
  );
}
