import React from "react";
import { createRoot } from "react-dom/client";
import Engine from "./franchise-engine.tsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Engine fullNav />
  </React.StrictMode>,
);
