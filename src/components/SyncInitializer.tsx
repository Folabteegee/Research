"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { motion } from "framer-motion";
import { Cloud, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SyncInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { syncFromCloud, syncToCloud, isSyncing, syncError } = useSync();
  const [showSyncAlert, setShowSyncAlert] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncType, setSyncType] = useState<"success" | "error" | "">("");

  // Initialize sync when user logs in
  useEffect(() => {
    if (user) {
      console.log("🔄 SyncInitializer: User detected, initializing sync...");
      const initializeSync = async () => {
        try {
          setSyncMessage("Syncing your data from cloud...");
          setShowSyncAlert(true);
          setSyncType("");

          const success = await syncFromCloud();
          if (success) {
            setSyncMessage("✅ Your data has been synced from cloud!");
            setSyncType("success");
            console.log("✅ SyncInitializer: Initial sync completed");

            // Auto-sync to cloud after successful pull
            setTimeout(async () => {
              try {
                await syncToCloud();
                console.log("✅ SyncInitializer: Auto-sync to cloud completed");
              } catch (error) {
                console.error("❌ SyncInitializer: Auto-sync failed:", error);
              }
            }, 2000);
          } else {
            throw new Error("Failed to sync from cloud");
          }
        } catch (error) {
          setSyncMessage("❌ Failed to sync your data. Please try again.");
          setSyncType("error");
          console.error("❌ SyncInitializer: Initial sync failed:", error);
        } finally {
          // Hide alert after 5 seconds
          setTimeout(() => {
            setShowSyncAlert(false);
          }, 5000);
        }
      };

      // Small delay to ensure everything is loaded
      setTimeout(() => {
        initializeSync();
      }, 1000);
    }
  }, [user, syncFromCloud, syncToCloud]);

  // Handle manual sync retry
  const handleRetrySync = async () => {
    if (!user) return;

    setShowSyncAlert(true);
    setSyncMessage("Retrying sync...");
    setSyncType("");

    try {
      const success = await syncFromCloud();
      if (success) {
        setSyncMessage("✅ Sync successful!");
        setSyncType("success");
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      setSyncMessage("❌ Sync failed. Please check your connection.");
      setSyncType("error");
    } finally {
      setTimeout(() => {
        setShowSyncAlert(false);
      }, 5000);
    }
  };

  // Show sync status in development
  if (process.env.NODE_ENV === "development" && user) {
    console.log("🔄 SyncInitializer Status:", {
      user: user?.email,
      isSyncing,
      syncError,
      showSyncAlert,
    });
  }

  return (
    <>
      {/* Sync Status Alert */}
      {showSyncAlert && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <Alert
            className={`
              backdrop-blur-sm border-2 shadow-lg
              ${
                syncType === "success"
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : syncType === "error"
                  ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isSyncing ? (
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                ) : syncType === "success" ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : syncType === "error" ? (
                  <X className="h-5 w-5 text-red-600" />
                ) : (
                  <Cloud className="h-5 w-5 text-blue-600" />
                )}
                <AlertDescription
                  className={`
                    font-medium
                    ${
                      syncType === "success"
                        ? "text-green-800 dark:text-green-300"
                        : syncType === "error"
                        ? "text-red-800 dark:text-red-300"
                        : "text-blue-800 dark:text-blue-300"
                    }
                  `}
                >
                  {syncMessage}
                </AlertDescription>
              </div>

              {syncType === "error" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetrySync}
                  disabled={isSyncing}
                  className={`
                    ${
                      syncType === "error"
                        ? "border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                        : ""
                    }
                  `}
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry
                </Button>
              )}

              {!isSyncing && syncType !== "error" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSyncAlert(false)}
                  className="h-8 w-8 p-0 hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Alert>
        </motion.div>
      )}

      {/* Render children */}
      {children}

      {/* Global Sync Status Indicator (only in development) */}
      {process.env.NODE_ENV === "development" && user && (
        <div className="fixed bottom-4 left-4 z-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-sm border
              ${
                isSyncing
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                  : syncError
                  ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                  : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
              }
            `}
          >
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : syncError ? (
                <>
                  <X className="h-3 w-3" />
                  <span>Sync Error</span>
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" />
                  <span>In Sync</span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
