import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleCopyError = async () => {
    if (this.state.error) {
      const errorText = `Error: ${this.state.error.message}\n\nStack: ${this.state.error.stack}`;
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card-matte p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-status-overdue/10 flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-8 h-8 text-status-overdue" />
            </motion.div>

            <h1 className="text-xl font-semibold text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Please reload the page or try again later.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border-subtle text-left">
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleCopyError}
                className="gap-2"
              >
                {this.state.copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy error
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={this.handleReload}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload page
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
