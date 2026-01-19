import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Background animation CSS (GPU-accelerated)
import "./components/backgrounds/aurora.css";
import "./components/backgrounds/mesh.css";
import "./components/backgrounds/geometric.css";
import "./components/custom-cursor.css";

createRoot(document.getElementById("root")!).render(<App />);
