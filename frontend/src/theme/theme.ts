import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
    background: {
      default: "#f5f5f5",
    },
  },

  typography: {
    fontFamily: ["Roboto", '"Noto Sans JP"', "sans-serif"].join(","),
  },

  shape: {
    borderRadius: 8,
  },
});

export default theme;
