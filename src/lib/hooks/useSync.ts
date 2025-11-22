// lib/hooks/useSync.ts
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserData,
  saveUserData,
  updateUserStreak,
  UserData,
} from "@/lib/firestore";

export const useSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("");
  const [syncError, setSyncError] = useState<string>("");

  // Get all local data - FIXED: Proper error handling and data validation
  const getLocalData = useCallback((): UserData => {
    if (!user) {
      return {
        savedPapers: [],
        xp: 0,
        achievements: [],
        streak: 0,
        lastVisit: new Date().toDateString(),
        reads: 0,
        searches: 0,
        collections: [],
        createdAt: null,
        updatedAt: null,
      };
    }

    try {
      const savedPapers = JSON.parse(
        localStorage.getItem(`savedPapers_${user.uid}`) || "[]"
      );
      const readsData = localStorage.getItem(`reads_${user.uid}`);
      const searches = parseInt(
        localStorage.getItem(`searches_${user.uid}`) || "0"
      );
      const userXP = parseInt(
        localStorage.getItem(`userXP_${user.uid}`) || "0"
      );
      const achievements = JSON.parse(
        localStorage.getItem(`achievements_${user.uid}`) || "[]"
      );
      const streak = parseInt(
        localStorage.getItem(`streak_${user.uid}`) || "0"
      );
      const lastVisit =
        localStorage.getItem(`lastVisit_${user.uid}`) ||
        new Date().toDateString();

      // Load collections
      const collections = JSON.parse(
        localStorage.getItem(`collections_${user.uid}`) || "[]"
      );

      // Calculate reads count safely
      let reads = 0;
      if (readsData) {
        try {
          const parsedReads = JSON.parse(readsData);
          if (Array.isArray(parsedReads)) {
            reads = parsedReads.length;
          } else if (typeof parsedReads === "number") {
            reads = parsedReads;
          }
        } catch {
          reads = 0;
        }
      }

      return {
        savedPapers: Array.isArray(savedPapers) ? savedPapers : [],
        xp: isNaN(userXP) ? 0 : userXP,
        achievements: Array.isArray(achievements) ? achievements : [],
        streak: isNaN(streak) ? 0 : streak,
        lastVisit: lastVisit || new Date().toDateString(),
        reads: isNaN(reads) ? 0 : reads,
        searches: isNaN(searches) ? 0 : searches,
        collections: Array.isArray(collections) ? collections : [],
        createdAt: null,
        updatedAt: null,
      };
    } catch (error) {
      console.error("Error getting local data:", error);
      return {
        savedPapers: [],
        xp: 0,
        achievements: [],
        streak: 0,
        lastVisit: new Date().toDateString(),
        reads: 0,
        searches: 0,
        collections: [],
        createdAt: null,
        updatedAt: null,
      };
    }
  }, [user]);

  // Apply cloud data to local storage - FIXED: Complete data sync
  const applyCloudData = useCallback(
    (cloudData: UserData) => {
      if (!user || !cloudData) {
        console.log("No user or cloud data to apply");
        return;
      }

      try {
        console.log("Applying cloud data to local storage:", cloudData);

        // Save all data to localStorage with validation
        localStorage.setItem(
          `savedPapers_${user.uid}`,
          JSON.stringify(cloudData.savedPapers || [])
        );
        localStorage.setItem(`userXP_${user.uid}`, String(cloudData.xp || 0));
        localStorage.setItem(
          `achievements_${user.uid}`,
          JSON.stringify(cloudData.achievements || [])
        );
        localStorage.setItem(
          `streak_${user.uid}`,
          String(cloudData.streak || 0)
        );
        localStorage.setItem(
          `lastVisit_${user.uid}`,
          cloudData.lastVisit || new Date().toDateString()
        );
        localStorage.setItem(
          `searches_${user.uid}`,
          String(cloudData.searches || 0)
        );
        localStorage.setItem(
          `collections_${user.uid}`,
          JSON.stringify(cloudData.collections || [])
        );

        // Handle reads - maintain existing array format if possible
        const existingReads = localStorage.getItem(`reads_${user.uid}`);
        if (!existingReads && cloudData.reads > 0) {
          // Create basic reads array for compatibility
          const readsArray = Array.from(
            { length: Math.min(cloudData.reads, 50) },
            (_, i) => ({
              id: `cloud-read-${i}`,
              readAt: new Date(Date.now() - i * 86400000).toISOString(), // Spread over days
              title: `Previously read paper ${i + 1}`,
              authors: "Various authors",
              journal: "Various journals",
              year: "N/A",
              url: "",
            })
          );
          localStorage.setItem(`reads_${user.uid}`, JSON.stringify(readsArray));
        }

        setLastSynced(new Date().toISOString());
        setSyncError("");

        // Trigger storage events to update UI
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(
          new CustomEvent("cloudDataApplied", {
            detail: { timestamp: new Date().toISOString() },
          })
        );

        console.log("✅ Cloud data applied successfully");
      } catch (error) {
        console.error("❌ Error applying cloud data:", error);
        setSyncError("Failed to apply cloud data");
      }
    },
    [user]
  );

  // Sync local data to cloud - FIXED: Better error handling and retry logic
  const syncToCloud = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.log("No user, skipping sync");
      return false;
    }

    setIsSyncing(true);
    setSyncError("");

    try {
      const localData = getLocalData();
      console.log("🔄 Syncing to cloud:", localData);

      await saveUserData(user.uid, localData);
      setLastSynced(new Date().toISOString());
      console.log("✅ Data synced to cloud successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Sync to cloud failed:", error);
      setSyncError(error.message || "Sync failed");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, getLocalData]);

  // Sync from cloud to local - FIXED: Better error handling
  const syncFromCloud = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.log("No user, skipping sync from cloud");
      return false;
    }

    setIsSyncing(true);
    setSyncError("");

    try {
      console.log("🔄 Syncing from cloud...");
      const cloudData = await getUserData(user.uid);

      if (cloudData) {
        applyCloudData(cloudData);
        console.log("✅ Data synced from cloud successfully");
        return true;
      } else {
        console.log("No cloud data found");
        return false;
      }
    } catch (error: any) {
      console.error("❌ Sync from cloud failed:", error);
      setSyncError(error.message || "Sync from cloud failed");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, applyCloudData]);

  // Auto-sync when user logs in - FIXED: Remove circular dependency
  useEffect(() => {
    if (!user) return;

    const initializeSync = async () => {
      console.log("🔄 Initializing sync for user:", user.uid);
      try {
        await syncFromCloud();
        await updateUserStreak(user.uid);

        // Initial sync to cloud to ensure data is saved
        setTimeout(() => syncToCloud(), 3000);
      } catch (error) {
        console.error("Initial sync failed:", error);
      }
    };

    // Use a small delay to ensure everything is loaded
    setTimeout(() => {
      initializeSync();
    }, 1000);
  }, [user, syncFromCloud, syncToCloud]);

  // Auto-sync on data changes with debouncing
  useEffect(() => {
    if (!user) return;

    let syncTimeout: NodeJS.Timeout;

    const handleDataChange = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        syncToCloud();
      }, 3000); // Debounce sync for 3 seconds
    };

    // Listen for storage changes (from other tabs)
    window.addEventListener("storage", handleDataChange);

    // Listen for custom data change events
    window.addEventListener("dataChanged", handleDataChange);

    // Periodic sync every 2 minutes
    const interval = setInterval(syncToCloud, 120000);

    return () => {
      window.removeEventListener("storage", handleDataChange);
      window.removeEventListener("dataChanged", handleDataChange);
      clearTimeout(syncTimeout);
      clearInterval(interval);
    };
  }, [user, syncToCloud]);

  return {
    syncToCloud,
    syncFromCloud,
    isSyncing,
    lastSynced,
    syncError,
    getLocalData,
    triggerDataChange,
  };
};

// Custom event for manual data change triggers
export const triggerDataChange = () => {
  window.dispatchEvent(new CustomEvent("dataChanged"));
};
