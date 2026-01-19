import { useCallback, useRef, useState, useEffect } from "react";

interface UseCalendarKeyboardProps {
  calendarDays: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onOpenAssignment?: () => void;
}

export function useCalendarKeyboard({
  calendarDays,
  selectedDate,
  onSelectDate,
  onOpenAssignment,
}: UseCalendarKeyboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Sync focused index with selected date
  useEffect(() => {
    if (selectedDate) {
      const index = calendarDays.findIndex(
        (day) => day.toDateString() === selectedDate.toDateString()
      );
      if (index !== -1) {
        setFocusedIndex(index);
      }
    }
  }, [selectedDate, calendarDays]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!calendarDays.length) return;

      const currentIndex = focusedIndex ?? 0;
      let newIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, calendarDays.length - 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          newIndex = Math.min(currentIndex + 7, calendarDays.length - 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          newIndex = Math.max(currentIndex - 7, 0);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex !== null) {
            onSelectDate(calendarDays[focusedIndex]);
            onOpenAssignment?.();
          }
          break;
        case "Home":
          e.preventDefault();
          // Go to first day of current week (row)
          newIndex = Math.floor(currentIndex / 7) * 7;
          break;
        case "End":
          e.preventDefault();
          // Go to last day of current week (row)
          newIndex = Math.min(Math.floor(currentIndex / 7) * 7 + 6, calendarDays.length - 1);
          break;
        case "PageUp":
          e.preventDefault();
          // Go up one month (roughly 4 weeks)
          newIndex = Math.max(currentIndex - 28, 0);
          break;
        case "PageDown":
          e.preventDefault();
          // Go down one month (roughly 4 weeks)
          newIndex = Math.min(currentIndex + 28, calendarDays.length - 1);
          break;
        default:
          return;
      }

      if (newIndex !== null && newIndex !== focusedIndex) {
        setFocusedIndex(newIndex);
        onSelectDate(calendarDays[newIndex]);
      }
    },
    [calendarDays, focusedIndex, onSelectDate, onOpenAssignment]
  );

  const focusContainer = useCallback(() => {
    containerRef.current?.focus();
  }, []);

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    focusContainer,
    containerProps: {
      ref: containerRef,
      tabIndex: 0,
      onKeyDown: handleKeyDown,
      role: "grid",
      "aria-label": "Calendar",
    },
  };
}
