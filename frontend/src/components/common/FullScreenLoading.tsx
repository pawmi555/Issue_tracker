import { Box, CircularProgress } from "@mui/material";

export default function FullScreenLoading() {
  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
