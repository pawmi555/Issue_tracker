import { Button, Container, Typography } from "@mui/material";

export default function App() {
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Issue Tracker
      </Typography>

      <Button variant="contained">MUI Ready</Button>
    </Container>
  );
}
