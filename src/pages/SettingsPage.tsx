import { motion } from "framer-motion";
import { useSettings, DensityMode } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { checkHealth, triggerRefresh } from "@/lib/api";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  Eye, 
  Megaphone, 
  Rows3, 
  LayoutGrid,
  Palette,
  MousePointer2
} from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { VisualSettingsPanel } from "@/components/VisualSettingsPanel";
import { useCursor } from "@/hooks/use-cursor";

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
    setShowAnnouncements,
    density,
    setDensity,
  } = useSettings();

  const { isCustomCursorEnabled, setCustomCursorEnabled } = useCursor();
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
    <div className="max-w-2xl mx-auto space-y-6 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your Canvas++ experience.</p>
      </motion.div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Rows3 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="visual" className="gap-2">
            <Palette className="w-4 h-4" />
            Visual
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          {/* Connection Status */}
          <motion.section 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.28 }}
            className="card-matte p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Connection</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {healthLoading ? (
                  <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
                ) : health?.ok ? (
                  <div className="w-9 h-9 rounded-lg bg-status-submitted-bg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-status-submitted" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-status-overdue-bg flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-status-overdue" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground text-sm">Backend API</p>
                  <p className="text-xs text-muted-foreground">
                    {healthLoading ? "Checking..." : health?.ok ? "Connected" : "Using mock data"}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Refresh */}
          <motion.section 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.28 }}
            className="card-matte p-5 space-y-5"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Refresh</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="refresh-interval" className="font-medium text-foreground text-sm">
                    Auto-refresh interval
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    How often to sync data
                  </p>
                </div>
              </div>
              <Select 
                value={String(refreshInterval)} 
                onValueChange={(v) => setRefreshInterval(Number(v))}
              >
                <SelectTrigger className="w-28 h-8 text-xs bg-muted/50 border-border-subtle">
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

            <div className="section-divider" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Force Refresh</p>
                  <p className="text-xs text-muted-foreground">
                    Manually sync all data now
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceRefresh}
                disabled={isForceRefreshing}
                className="btn-press h-8 text-xs"
              >
                {isForceRefreshing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </motion.section>

          {/* Display Settings */}
          <motion.section 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
            className="card-matte p-5 space-y-5"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Display</h2>
            
            {/* Density */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  {density === "compact" ? (
                    <Rows3 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Label className="font-medium text-foreground text-sm">
                    List density
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Comfort for spacious, Compact for power users
                  </p>
                </div>
              </div>
              <div className="segmented-control">
                <button
                  onClick={() => setDensity("comfort")}
                  data-active={density === "comfort"}
                  className="segmented-control-item text-xs"
                >
                  Comfort
                </button>
                <button
                  onClick={() => setDensity("compact")}
                  data-active={density === "compact"}
                  className="segmented-control-item text-xs"
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="section-divider" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="show-grades" className="font-medium text-foreground text-sm">
                    Show grades/points
                  </Label>
                  <p className="text-xs text-muted-foreground">
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

            <div className="section-divider" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="show-announcements" className="font-medium text-foreground text-sm">
                    Show announcements
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display announcements on Home
                  </p>
                </div>
              </div>
              <Switch
                id="show-announcements"
                checked={showAnnouncements}
                onCheckedChange={setShowAnnouncements}
              />
            </div>

            <div className="section-divider" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                  <MousePointer2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="custom-cursor" className="font-medium text-foreground text-sm">
                    Custom cursor
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable custom cursor with glow effect
                  </p>
                </div>
              </div>
              <Switch
                id="custom-cursor"
                checked={isCustomCursorEnabled}
                onCheckedChange={setCustomCursorEnabled}
              />
            </div>
          </motion.section>
        </TabsContent>
        
        <TabsContent value="visual">
          <VisualSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
