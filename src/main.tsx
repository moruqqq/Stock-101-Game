import "@fontsource/fredoka/latin-ext-500.css";
import "@fontsource/dm-sans/latin-ext-700.css";
import "@fontsource/dm-sans/latin-ext-500.css";
import "@fontsource/dm-sans/latin-ext-400.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./GameApp";
import { ThemeProvider } from "./Theme";
import { LocaleProvider } from "./Locale";
import "./styles.css";
import "./screens.css";
import "./polish.css";
import "@fontsource/fredoka/latin-500.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-700.css";
import "./playful.css";
import "./expansion.css";
import "./themes.css";
import "./city-live.css";
import "./locale.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocaleProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LocaleProvider>
  </React.StrictMode>,
);
