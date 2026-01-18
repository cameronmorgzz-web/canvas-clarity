import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { checkHealth, triggerRefresh } from "@/lib/api";
import { CheckCircle2, XCircle, RefreshCw, Clock, Eye, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

const REFRESH_INTERVALS = [
  { value: "30000", label: "30 seconds" },
  { value: "60000", label: "1 minute" },
  { value: "120000", label: "2 minutes" },
  { value: "300000", label: "5 minutes" },
];

export default function SettingsPage() {
  const { 
    refreshInterval, 
    setRefreshInterval, 
    showGrades, 
    setShowGrades,
    showAnnouncements,
    setShowAnnouncements
  } = useSettings();

  const [isForceRefreshing, setIsForceRefreshing] = useState(false);

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["health"],
    queryFn: checkHealth,
    refetchInterval: 30000,
  });

  const handleForceRefresh = async () => {
    setIsForceRefreshing(true);
    try {
      await triggerRefresh();
    } finally {
      setIsForceRefreshing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-content mb-2">Settings</h1>
        <p className="text-secondary-content">Customize your Canvas++ experience.</p>
      </div>

      {/* Connection Status */}
      <section className="card-matte p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary-content">Connection Status</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {healthLoading ? (
              <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
            ) : health?.ok ? (
              <CheckCircle2 className="w-5 h-5 text-status-submitted" />
            ) : (
              <XCircle className="w-5 h-5 text-status-overdue" />
            )}
            <div>
              <p className="font-medium text-primary-content">Backend API</p>
              <p className="text-sm text-muted-foreground">
                {healthLoading ? "Checking..." : health?.ok ? "Connected" : "Disconnected (using mock data)"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Refresh Settings */}
      <section className="card-matte p-6 space-y-6">
        <h2 className="text-lg font-semibold text-primary-content">Data Refresh</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label htmlFor="refresh-interval" className="font-medium text-primary-content">
                Auto-refresh interval
              </Label>
              <p className="text-sm text-muted-foreground">
                How often to check for new data
              </p>
            </div>
          </div>
          <Select 
            value={String(refreshInterval)} 
            onValueChange={(v) => setRefreshInterval(Number(v))}
          >
            <SelectTrigger className="w-32 bg-muted/50 border-border-subtle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFRESH_INTERVALS.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-primary-content">Force Refresh</p>
              <p className="text-sm text-muted-foreground">
                Manually sync all data now
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleForceRefresh}
            disabled={isForceRefreshing}
            className="btn-press"
          >
            {isForceRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Now
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Display Settings */}
      <section className="card-matte p-6 space-y-6">
        <h2 className="text-lg font-semibold text-primary-content">Display</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label htmlFor="show-grades" className="font-medium text-primary-content">
                Show grades/points
              </Label>
              <p className="text-sm text-muted-foreground">
                Display point values on assignments
              </p>
            </div>
          </div>
          <Switch
            id="show-grades"
            checked={showGrades}
            onCheckedChange={setShowGrades}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-muted-foreground" />
            <div>
              <Label htmlFor="show-announcements" className="font-medium text-primary-content">
                Show announcements
              </Label>
              <p className="text-sm text-muted-foreground">
                Display announcements section on Home
              </p>
            </div>
          </div>
          <Switch
            id="show-announcements"
            checked={showAnnouncements}
            onCheckedChange={setShowAnnouncements}
          />
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="card-matte p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary-content">Keyboard Shortcuts</h2>
        
        <div className="grid gap-3 text-sm">
          {[
            { keys: "/", description: "Focus search" },
            { keys: "G H", description: "Go to Home" },
            { keys: "G A", description: "Go to Assignments" },
            { keys: "G C", description: "Go to Calendar" },
            { keys: "G O", description: "Go to Courses" },
            { keys: "G S", description: "Go to Settings" },
            { keys: "Esc", description: "Close drawer/modal" },
          ].map(({ keys, description }) => (
            <div key={keys} className="flex items-center justify-between">
              <span className="text-secondary-content">{description}</span>
              <kbd className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted font-mono text-xs text-muted-foreground">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
