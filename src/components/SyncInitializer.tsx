"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export function SyncInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { syncFromCloud, syncToCloud, isSyncing } = useSync();
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);

  // Initialize sync when user logs in
  useEffect(() => {
    if (user) {
      console.log("🔄 SyncInitializer: User detected, initializing sync...");

      const initializeSync = async () => {
        try {
          setShowSyncIndicator(true);

          const success = await syncFromCloud();
          if (success) {
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
          console.error("❌ SyncInitializer: Initial sync failed:", error);
        } finally {
          // Hide indicator after a short delay when sync completes
          setTimeout(() => {
            setShowSyncIndicator(false);
          }, 1000);
        }
      };

      // Small delay to ensure everything is loaded
      setTimeout(() => {
        initializeSync();
      }, 1000);
    }
  }, [user, syncFromCloud, syncToCloud]);

  // Show sync indicator only when actively syncing
  return (
    <>
      {/* Subtle Sync Indicator */}
      {showSyncIndicator && isSyncing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700">
            <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        </motion.div>
      )}

      {/* Render children */}
      {children}
    </>
  );
}
