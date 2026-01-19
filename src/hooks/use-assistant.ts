import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Citation {
  type: "assignment" | "announcement" | "course";
  id: string;
  title: string;
  html_url: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: number;
  isError?: boolean;
}

interface AssistantStore {
  isOpen: boolean;
  messages: AssistantMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setOpen: (open: boolean) => void;
  toggle: () => void;
  addMessage: (message: Omit<AssistantMessage, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  retryLastMessage: () => AssistantMessage | null;
}

export const useAssistant = create<AssistantStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      messages: [],
      isLoading: false,
      error: null,

      setOpen: (isOpen) => set({ isOpen }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
        ],
        error: null,
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      clearMessages: () => set({ messages: [], error: null }),
      
      retryLastMessage: () => {
        const state = get();
        // Find the last user message
        const userMessages = state.messages.filter(m => m.role === "user");
        return userMessages[userMessages.length - 1] || null;
      },
    }),
    {
      name: "canvas-pp-assistant",
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);

// API call to send message
export async function sendAssistantMessage(
  message: string,
  context?: { range?: "today" | "week" | "month"; courseId?: string | null }
): Promise<{ answer: string; citations: Citation[] }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/assistant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      message,
      context: context || { range: null, courseId: null },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
