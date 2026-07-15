import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import AuthProvider from "./providers/AuthProvider";
import QueryProvider from "./providers/QueryProvider";
import ThemeProvider from "./providers/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>,
);
