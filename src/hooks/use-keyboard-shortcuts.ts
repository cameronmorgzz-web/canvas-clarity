import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Focus search with /
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        searchInput?.focus();
        return;
      }

      // Navigation shortcuts with g prefix
      if (e.key === "g" && !isInput) {
        gPressed = true;
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 500);
        return;
      }

      if (gPressed && !isInput) {
        gPressed = false;
        clearTimeout(gTimeout);
        
        switch (e.key) {
          case "h":
            e.preventDefault();
            navigate("/");
            break;
          case "a":
            e.preventDefault();
            navigate("/assignments");
            break;
          case "c":
            e.preventDefault();
            navigate("/calendar");
            break;
          case "s":
            e.preventDefault();
            navigate("/settings");
            break;
          case "o":
            e.preventDefault();
            navigate("/courses");
            break;
        }
      }

      // Escape to close drawers/modals
      if (e.key === "Escape") {
        const closeButton = document.querySelector<HTMLButtonElement>('[data-drawer-close]');
        closeButton?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
