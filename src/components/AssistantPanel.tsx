import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, Sparkles, RefreshCw, ExternalLink, BookOpen, Bell, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAssistant, sendAssistantMessage, Citation } from "@/hooks/use-assistant";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { label: "What's due today?", message: "What's due today?" },
  { label: "What's overdue?", message: "What assignments are overdue?" },
  { label: "Due this week", message: "What's due this week?" },
  { label: "Summarize announcements", message: "Summarize announcements from the last 3 days" },
  { label: "Study plan", message: "Make a study plan for tonight based on my upcoming assignments" },
];

function CitationChip({ citation }: { citation: Citation }) {
  const icons = {
    assignment: BookOpen,
    announcement: Bell,
    course: GraduationCap,
  };
  const Icon = icons[citation.type];
  
  return (
    <a
      href={citation.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
    >
      <Icon className="w-3 h-3 text-muted-foreground" />
      <span className="truncate max-w-[150px]">{citation.title}</span>
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

function MessageBubble({ 
  role, 
  content, 
  citations,
  isError 
}: { 
  role: "user" | "assistant"; 
  content: string;
  citations?: Citation[];
  isError?: boolean;
}) {
  const isUser = role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : isError
              ? "bg-destructive/20 border border-destructive/30"
              : "bg-card/80 border border-white/10"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        
        {citations && citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-muted-foreground mb-2">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {citations.map((citation) => (
                <CitationChip key={`${citation.type}-${citation.id}`} citation={citation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bg-card/80 border border-white/10 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1">
          <motion.div
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function AssistantPanel() {
  const isMobile = useIsMobile();
  const { isOpen, setOpen, messages, isLoading, error, addMessage, setLoading, setError, clearMessages, retryLastMessage } = useAssistant();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput("");
    addMessage({ role: "user", content: text });
    setLoading(true);
    setError(null);

    try {
      const response = await sendAssistantMessage(text);
      addMessage({ 
        role: "assistant", 
        content: response.answer,
        citations: response.citations,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get response";
      setError(errorMessage);
      addMessage({ 
        role: "assistant", 
        content: errorMessage,
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMessage = retryLastMessage();
    if (lastUserMessage) {
      handleSend(lastUserMessage.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Panel variants for animation
  const panelVariants = isMobile
    ? {
        hidden: { y: "100%" },
        visible: { y: 0 },
      }
    : {
        hidden: { x: "100%", opacity: 0 },
        visible: { x: 0, opacity: 1 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-background/95 backdrop-blur-xl border-white/10 flex flex-col",
              isMobile
                ? "inset-x-0 bottom-0 h-[85vh] rounded-t-3xl border-t"
                : "right-0 top-0 bottom-0 w-[420px] border-l"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Ask Canvas++</h2>
                  <p className="text-xs text-muted-foreground">Uses your Canvas data</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearMessages}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">How can I help?</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                      Ask me about your assignments, announcements, or get help planning your study time.
                    </p>
                  </motion.div>
                )}

                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    citations={message.citations}
                    isError={message.isError}
                  />
                ))}

                {isLoading && <TypingIndicator />}

                {error && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </Button>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Quick prompts */}
            {messages.length === 0 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => handleSend(prompt.message)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your assignments..."
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none bg-card/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 placeholder:text-muted-foreground"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-11 w-11 rounded-xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
