import { Alert, Button, Container, Stack, Typography } from "@mui/material";

import { useNavigate, useRouteError } from "react-router";

export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error("Route rendering error:", error);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Typography component="h1" variant="h4">
          エラーが発生しました
        </Typography>

        <Alert severity="error">
          画面の表示中に予期しないエラーが発生しました。
        </Alert>

        <Button
          variant="contained"
          onClick={() => {
            navigate("/", { replace: true });
          }}
        >
          ホームへ戻る
        </Button>
      </Stack>
    </Container>
  );
}
