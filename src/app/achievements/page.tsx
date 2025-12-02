"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import {
  getUserXP,
  getLevel,
  getAchievements,
  updateStreak,
} from "@/lib/gamification";
import XPBar from "@/components/XPBar";
import { motion } from "framer-motion";
import {
  Trophy,
  Award,
  Star,
  Zap,
  Target,
  BookOpen,
  Search,
  Flame,
  Calendar,
  User,
  Sparkles,
  Crown,
  Medal,
  Gem,
  RefreshCw,
  Cloud,
  CloudOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AchievementsPage() {
  const { user } = useAuth();
  const { syncToCloud, syncFromCloud, isSyncing, lastSynced, syncError } =
    useSync();
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [userStats, setUserStats] = useState({
    papersRead: 0,
    papersSaved: 0,
    searches: 0,
  });
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [lastLoad, setLastLoad] = useState<number>(0);

  // Get user ID for gamification functions
  const userId = user?.uid;

  // Enhanced sync functions - FIXED: Better error handling
  const enhancedSyncToCloud = async () => {
    setSyncStatus("syncing");
    try {
      const success = await syncToCloud();
      if (success) {
        setSyncStatus("success");
        // Reload data after successful sync
        setTimeout(() => {
          loadData();
        }, 1000);
      } else {
        setSyncStatus("error");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const enhancedSyncFromCloud = async () => {
    setSyncStatus("syncing");
    try {
      const success = await syncFromCloud();
      if (success) {
        setSyncStatus("success");
        loadData(); // Reload data after sync
      } else {
        setSyncStatus("error");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  // Load user data + listen for updates - FIXED: Complete sync integration
  const loadData = () => {
    if (!userId) return;

    // Load XP and level with user-specific data
    const userXP = getUserXP(userId);
    const userLevel = getLevel(userXP);

    // Load streak with user-specific data
    const userStreak = updateStreak(userId);

    // Load user stats from saved papers
    const savedPapersKey = `savedPapers_${userId}`;
    const storedPapers = localStorage.getItem(savedPapersKey);
    const papers = storedPapers ? JSON.parse(storedPapers) : [];

    // Load searches count
    const searchesKey = `searches_${userId}`;
    const searchesCount = parseInt(localStorage.getItem(searchesKey) || "0");

    // Load reads count properly - FIXED: Better reading data handling
    const readPapersKey = `reads_${userId}`;
    const readPapersData = localStorage.getItem(readPapersKey);
    let papersRead = 0;

    if (readPapersData) {
      try {
        const parsedReads = JSON.parse(readPapersData);
        if (Array.isArray(parsedReads)) {
          papersRead = parsedReads.length;
        } else if (typeof parsedReads === "number") {
          papersRead = parsedReads;
        }
      } catch (error) {
        console.error("Error parsing read papers:", error);
        papersRead = 0;
      }
    }

    setXP(userXP);
    setLevel(userLevel);
    setStreak(userStreak);
    setUserStats({
      papersRead,
      papersSaved: papers.length,
      searches: searchesCount,
    });
    setAchievements(getAchievements(userId));

    setLastLoad(Date.now());
  };

  useEffect(() => {
    loadData();

    // Listen for localStorage updates (from other tabs/pages)
    const handleStorageChange = () => {
      console.log("🔄 Storage changed, reloading achievements data");
      loadData();
    };

    // Listen for cloud data updates
    const handleCloudDataApplied = () => {
      console.log("🔄 Cloud data applied, reloading achievements");
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cloudDataApplied", handleCloudDataApplied);

    // Poll for updates every 5 seconds (for real-time updates)
    const interval = setInterval(loadData, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cloudDataApplied", handleCloudDataApplied);
      clearInterval(interval);
    };
  }, [user, userId]);

  // Sync data when achievements or stats change - FIXED: Better auto-sync logic
  useEffect(() => {
    if (!userId) return;

    const syncTimer = setTimeout(async () => {
      try {
        await syncToCloud();
        console.log("✅ Achievements data auto-synced to cloud");
      } catch (error) {
        console.error("❌ Failed to auto-sync achievements:", error);
      }
    }, 3000);

    return () => clearTimeout(syncTimer);
  }, [xp, streak, userStats, achievements, userId, syncToCloud]);

  // Update sync status based on isSyncing - FIXED: Better status tracking
  useEffect(() => {
    if (isSyncing) {
      setSyncStatus("syncing");
    } else if (syncStatus === "syncing") {
      if (syncError) {
        setSyncStatus("error");
      } else {
        setSyncStatus("success");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  }, [isSyncing, syncStatus, syncError]);

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case "syncing":
        return "Syncing...";
      case "success":
        return "Synced!";
      case "error":
        return syncError || "Sync failed";
      default:
        return lastSynced
          ? `Synced ${new Date(lastSynced).toLocaleTimeString()}`
          : "Ready to sync";
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "success":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "error":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
    }
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-3 h-3 mr-1 animate-spin" />;
      case "success":
        return <Cloud className="w-3 h-3 mr-1" />;
      case "error":
        return <CloudOff className="w-3 h-3 mr-1" />;
      default:
        return <Cloud className="w-3 h-3 mr-1" />;
    }
  };

  const achievementIcons = [
    <Trophy className="w-8 h-8" />,
    <Award className="w-8 h-8" />,
    <Star className="w-8 h-8" />,
    <Zap className="w-8 h-8" />,
    <Target className="w-8 h-8" />,
    <BookOpen className="w-8 h-8" />,
    <Search className="w-8 h-8" />,
    <Flame className="w-8 h-8" />,
    <Crown className="w-8 h-8" />,
    <Medal className="w-8 h-8" />,
    <Gem className="w-8 h-8" />,
    <Sparkles className="w-8 h-8" />,
  ];

  const statsCards = [
    {
      label: "Papers Read",
      value: userStats.papersRead,
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-[#49BBBD]",
    },
    {
      label: "Papers Saved",
      value: userStats.papersSaved,
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-[#49BBBD]",
    },
    {
      label: "Searches",
      value: userStats.searches,
      icon: <Search className="w-6 h-6" />,
      color: "bg-[#49BBBD]",
    },
    {
      label: "Current Streak",
      value: `${streak} days`,
      icon: <Flame className="w-6 h-6" />,
      color: "bg-[#49BBBD]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-[#49BBBD] p-4 rounded-2xl shadow-lg">
                <Trophy className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Achievements
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your research journey and unlock rewards as you explore
            </p>
            {user && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-sm text-[#49BBBD]">
                  Personal achievements for {user.email}
                </p>
              </div>
            )}
          </motion.header>

          {/* User Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {stat.label}
                    </p>
                  </div>
                  <div className="bg-[#49BBBD]/10 p-3 rounded-xl">
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Level and XP Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-sm mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Level Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9] p-6 rounded-2xl text-white text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Crown className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Level {level}</h3>
                </div>
                <p className="text-white/80 mb-2">Research Explorer</p>
                <div className="text-3xl font-bold">{xp} XP</div>
              </motion.div>

              {/* XP Progress */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Progress to Level {level + 1}
                  </h3>
                  <span className="text-[#49BBBD] font-medium">
                    {xp % 100}/100 XP
                  </span>
                </div>
                <XPBar xp={xp} />
                <p className="text-muted-foreground text-sm mt-3">
                  {100 - (xp % 100)} XP needed for next level
                </p>
                <div className="flex gap-2 mt-4">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    📚 Read papers: +10 XP
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    💾 Save papers: +10 XP
                  </Badge>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Achievements Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                🏆 Your Badges
              </h2>
              <p className="text-muted-foreground">
                Unlock achievements by reading, saving, and exploring research
                papers
              </p>
              {user && (
                <p className="text-sm text-muted-foreground mt-2">
                  Achievements sync across all your devices automatically
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 shadow-lg"
                      : "bg-muted/50 border-border/50 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        achievement.unlocked
                          ? "bg-[#49BBBD] text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {achievementIcons[index % achievementIcons.length]}
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-semibold text-lg ${
                          achievement.unlocked
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {achievement.name}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          achievement.unlocked
                            ? "text-muted-foreground"
                            : "text-muted-foreground/70"
                        }`}
                      >
                        {achievement.description}
                      </p>
                      {achievement.unlocked && (
                        <div className="flex items-center gap-1 mt-2">
                          <Sparkles className="w-4 h-4 text-[#49BBBD]" />
                          <span className="text-xs text-[#49BBBD] font-medium">
                            Unlocked!
                          </span>
                        </div>
                      )}
                      {!achievement.unlocked && achievement.progress && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-[#49BBBD] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.progress}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Encouragement Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Zap className="text-[#49BBBD]" size={24} />
              <h3 className="text-xl font-semibold text-foreground">
                Keep Going!
              </h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Continue exploring research papers, saving your favorites, and
              reading to unlock more achievements and level up your research
              skills!
            </p>
            <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
              <span>🎯 Save papers to earn XP</span>
              <span>📚 Read daily to maintain streak</span>
              <span>🔍 Explore new topics</span>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
