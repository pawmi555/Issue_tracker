import { Outlet } from "react-router";
import { Container } from "@mui/material";

export default function MainLayout() {
  return (
    <Container sx={{ mt: 4 }}>
      <Outlet />
    </Container>
  );
}
