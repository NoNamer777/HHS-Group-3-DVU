import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import './style.css'

// Grab the DOM element with type safety
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' not found in index.html");
}

// Create React root and render
ReactDOM.createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);