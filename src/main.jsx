import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import theme from "./assets/theme.js";
// import { AuthProvider } from "./lib/auth.jsx";
// import { AuthDialogProvider } from "./components/AuthDialogProvider.jsx";

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    {/* <AuthProvider> */}
      <BrowserRouter>
        {/* <AuthDialogProvider> */}
          <App />
        {/* </AuthDialogProvider> */}
      </BrowserRouter>
    {/* </AuthProvider> */}
  </ThemeProvider>
);
