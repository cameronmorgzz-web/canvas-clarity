import { toast } from "sonner";

export function useToastActions() {
  const showPinned = (isPinned: boolean) => {
    toast.success(isPinned ? "Assignment pinned" : "Assignment unpinned", {
      description: isPinned 
        ? "It will appear on your Home page" 
        : "Removed from pinned items",
      duration: 2000,
    });
  };

  const showRefreshed = () => {
    toast.success("Data refreshed", {
      description: "All data is up to date",
      duration: 2000,
    });
  };

  const showFocusMode = (enabled: boolean) => {
    toast.success(enabled ? "Focus mode enabled" : "Focus mode disabled", {
      description: enabled 
        ? "Showing only urgent items" 
        : "Showing all items",
      duration: 2000,
    });
  };

  const showError = (message: string) => {
    toast.error("Something went wrong", {
      description: message,
      duration: 4000,
    });
  };

  return {
    showPinned,
    showRefreshed,
    showFocusMode,
    showError,
  };
}
