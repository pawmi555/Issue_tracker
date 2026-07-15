import { Button, Container, Stack, Typography } from "@mui/material";

import { useNavigate } from "react-router";

import { useLogout } from "../features/auth/hooks/useLogout";
import { useAuthStore } from "../stores/auth.store";

export default function HomePage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Issue Tracker</Typography>

        <Typography>{user?.name}さん、ログインしています。</Typography>

        <Button
          variant="outlined"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "ログアウト中..." : "ログアウト"}
        </Button>
      </Stack>
    </Container>
  );
}
