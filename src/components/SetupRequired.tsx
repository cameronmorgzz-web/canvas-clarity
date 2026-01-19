import { motion } from "framer-motion";
import { AlertTriangle, Settings, ExternalLink, Key, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SetupRequiredProps {
  errorType?: "not_configured" | "auth" | "unknown";
  message?: string;
}

export function SetupRequired({ errorType = "not_configured", message }: SetupRequiredProps) {
  const isAuthError = errorType === "auth";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto py-12 px-4"
    >
      <div className="card-elevated p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-status-overdue-bg flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-status-overdue" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isAuthError ? "Authentication Required" : "Canvas Not Connected"}
        </h1>

        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {message || (isAuthError
            ? "Your Canvas access token may be invalid or expired. Please update your credentials."
            : "Canvas++ needs to be connected to your Canvas instance to display your courses and assignments.")}
        </p>

        <div className="card-matte p-5 text-left mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Setup Steps</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Server className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">1. Configure Canvas URL</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set <code className="px-1 py-0.5 rounded bg-muted text-xs">CANVAS_API_URL</code> to your Canvas instance
                  (e.g., https://canvas.university.edu)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">2. Generate Access Token</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  In Canvas, go to <strong>Account → Settings → New Access Token</strong> and set it as{" "}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">CANVAS_API_TOKEN</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">3. Deploy & Verify</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add secrets to your backend function environment and redeploy.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/settings">
              <Settings className="w-4 h-4 mr-2" />
              Open Settings
            </Link>
          </Button>
          <Button asChild>
            <a 
              href="https://github.com/your-repo/canvas-pp#backend-setup" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Setup Guide
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
