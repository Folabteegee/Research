"use client";

import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { useUserDisplayName } from "@/lib/hooks/useUserDisplayName";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings,
  Award,
  Search,
  BookOpen,
  ArrowRight,
  Brain,
  Library,
  BarChart3,
  FileText,
  Clock,
  Plus,
  Sparkles,
  Target,
  Trophy,
  Crown,
  Zap,
  User,
  Camera,
  Trash2,
  RefreshCw,
  Cloud,
  CloudOff,
  Users,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getUserXP,
  getLevel,
  getLevelProgress,
  updateStreak,
} from "@/lib/gamification";

// Profile Picture Upload Component
function ProfilePictureUpload({
  onProfilePictureChange,
}: {
  onProfilePictureChange: () => void;
}) {
  const { user } = useAuth();
  const { syncToCloud } = useSync();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentProfilePic, setCurrentProfilePic] = useState<string | null>(
    null
  );

  const getUserProfilePicKey = () => {
    return user ? `profilePic_${user.uid}` : "profilePic_guest";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfilePic = localStorage.getItem(getUserProfilePicKey());
      setCurrentProfilePic(savedProfilePic);
    }
  }, [user]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setCurrentProfilePic(tempUrl);
      setIsMenuOpen(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        localStorage.setItem(getUserProfilePicKey(), imageDataUrl);
        setCurrentProfilePic(imageDataUrl);
        onProfilePictureChange();

        setTimeout(async () => {
          try {
            await syncToCloud();
          } catch (error) {
            console.error("Failed to sync profile picture:", error);
          }
        }, 500);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePicture = async () => {
    localStorage.removeItem(getUserProfilePicKey());
    setCurrentProfilePic(null);
    setIsMenuOpen(false);
    onProfilePictureChange();

    setTimeout(async () => {
      try {
        await syncToCloud();
      } catch (error) {
        console.error("Failed to sync profile picture removal:", error);
      }
    }, 500);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userInitial = user?.email?.[0]?.toUpperCase() || "U";
  const hasValidProfilePic = currentProfilePic || user?.photoURL;

  return (
    <div className="relative" ref={menuRef}>
      <div className="relative group cursor-pointer" onClick={toggleMenu}>
        <Avatar className="h-14 w-14 border-2 border-[#49BBBD]/20 group-hover:border-[#49BBBD] transition-all duration-300">
          {hasValidProfilePic ? (
            <AvatarImage
              src={currentProfilePic || user?.photoURL || undefined}
              alt="Profile"
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9] text-white font-semibold">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#49BBBD] rounded-full border-2 border-background flex items-center justify-center">
          <Camera className="w-3 h-3 text-white" />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-16 left-0 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl z-50 p-2"
        >
          <div className="space-y-1">
            <button
              onClick={handleUploadClick}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#49BBBD]/10 rounded-lg transition-all duration-200"
            >
              <Camera className="h-4 w-4" />
              {currentProfilePic ? "Change Photo" : "Upload Photo"}
            </button>
            {currentProfilePic && (
              <button
                onClick={handleDeletePicture}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Remove Photo
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Helper function to safely parse JSON
const safeJsonParse = (value: string | null, defaultValue: any = null) => {
  if (
    !value ||
    value === "null" ||
    value === "undefined" ||
    value === "NaN" ||
    value === '""'
  ) {
    return defaultValue;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("JSON parse error:", error);
    return defaultValue;
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { syncToCloud, syncFromCloud, isSyncing, lastSynced, syncError } =
    useSync();
  const [userStats, setUserStats] = useState({
    papersSaved: 0,
    collections: 0,
    readingTime: "0h",
    collaborators: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [levelProgress, setLevelProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [profilePictureVersion, setProfilePictureVersion] = useState(0);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  const getUserLibraryKey = () => {
    return user ? `savedPapers_${user.uid}` : "savedPapers_guest";
  };

  const cleanupCorruptedData = () => {
    if (!user) return;

    const keysToCheck = [
      getUserLibraryKey(),
      `collections_${user.uid}`,
      `reads_${user.uid}`,
      "userStats",
      "savedPapers_guest",
    ];

    keysToCheck.forEach((key) => {
      try {
        const value = localStorage.getItem(key);
        if (
          value &&
          (value === "NaN" ||
            value === "null" ||
            value === "undefined" ||
            value === '""')
        ) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error(`Error cleaning up key ${key}:`, error);
      }
    });
  };

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

  const enhancedSyncToCloud = async () => {
    setSyncStatus("syncing");
    try {
      const success = await syncToCloud();
      if (success) {
        setSyncStatus("success");
        setTimeout(() => {
          loadUserStats();
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
        loadUserStats();
      } else {
        setSyncStatus("error");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const loadUserStats = () => {
    if (user) {
      const userId = user.uid;

      const xp = getUserXP(userId);
      const level = getLevel(xp);
      const progress = getLevelProgress(xp);
      const currentStreak = updateStreak(userId);

      setUserXP(xp);
      setUserLevel(level);
      setLevelProgress(progress);
      setStreak(currentStreak);

      const userLibraryKey = getUserLibraryKey();
      let savedPapers = [];
      try {
        const stored = localStorage.getItem(userLibraryKey);
        savedPapers = safeJsonParse(stored, []);
        if (!Array.isArray(savedPapers)) {
          savedPapers = [];
          localStorage.setItem(userLibraryKey, JSON.stringify([]));
        }
      } catch (error) {
        savedPapers = [];
        localStorage.setItem(userLibraryKey, JSON.stringify([]));
      }

      const collectionsKey = `collections_${userId}`;
      let collections = [];
      try {
        const storedCollections = localStorage.getItem(collectionsKey);
        collections = safeJsonParse(storedCollections, []);
        if (!Array.isArray(collections)) {
          collections = [];
          localStorage.setItem(collectionsKey, JSON.stringify([]));
        }
      } catch (error) {
        collections = [];
        localStorage.setItem(collectionsKey, JSON.stringify([]));
      }

      const collectionsCount = collections.length;

      const readPapersKey = `reads_${userId}`;
      let readPapers = [];
      let readingHours = 0;

      try {
        const readPapersData = localStorage.getItem(readPapersKey);
        readPapers = safeJsonParse(readPapersData, []);
        if (Array.isArray(readPapers)) {
          readingHours = Math.floor(readPapers.length * 0.5);
        } else if (typeof readPapers === "number") {
          readingHours = Math.floor(readPapers * 0.5);
        } else {
          readPapers = [];
          localStorage.setItem(readPapersKey, JSON.stringify([]));
        }
      } catch (error) {
        readingHours = 0;
        localStorage.setItem(readPapersKey, JSON.stringify([]));
      }

      const collaboratorScore = Math.floor(
        (savedPapers.length + collectionsCount) / 5
      );

      setUserStats({
        papersSaved: savedPapers.length,
        collections: collectionsCount,
        readingTime: `${readingHours}h`,
        collaborators: collaboratorScore,
      });

      const activity = [
        ...savedPapers.slice(0, 3).map((paper: any) => ({
          type: "saved",
          title: paper.title || "Untitled Paper",
          time: "Recently",
          icon: BookOpen,
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950/30",
        })),
        ...(Array.isArray(readPapers)
          ? readPapers.slice(0, 2).map((paper: any) => ({
              type: "read",
              title: paper?.title || "Read Paper",
              time: "Today",
              icon: FileText,
              color: "text-blue-500",
              bgColor: "bg-blue-50 dark:bg-blue-950/30",
            }))
          : []),
      ];
      setRecentActivity(activity);
    }
  };

  const handleProfilePictureChange = () => {
    setProfilePictureVersion((prev) => prev + 1);
  };

  useEffect(() => {
    cleanupCorruptedData();
    loadUserStats();

    const handleStorageChange = () => {
      loadUserStats();
    };

    const handleCloudDataApplied = () => {
      loadUserStats();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cloudDataApplied", handleCloudDataApplied);

    const interval = setInterval(loadUserStats, 30000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cloudDataApplied", handleCloudDataApplied);
      clearInterval(interval);
    };
  }, [user, profilePictureVersion]);

  useEffect(() => {
    if (!user) return;

    const handleDataChange = () => {
      setTimeout(() => {
        syncToCloud();
      }, 2000);
    };

    window.addEventListener("dataChanged", handleDataChange);

    return () => {
      window.removeEventListener("dataChanged", handleDataChange);
    };
  }, [user, syncToCloud]);

  const getLevelTitle = (level: number) => {
    const titles = [
      "Research Novice",
      "Curious Scholar",
      "Knowledge Seeker",
      "Research Explorer",
      "Academic Adventurer",
      "Literature Master",
      "Research Guru",
      "Paper Pioneer",
      "Citation Champion",
      "Research Legend",
    ];
    return titles[level - 1] || titles[titles.length - 1];
  };

  const getLevelBadge = (level: number) => {
    if (level >= 10)
      return {
        label: "Legend",
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
      };
    if (level >= 7)
      return {
        label: "Expert",
        color: "bg-gradient-to-r from-red-500 to-red-600",
      };
    if (level >= 5)
      return {
        label: "Pro",
        color: "bg-gradient-to-r from-orange-500 to-orange-600",
      };
    if (level >= 3)
      return {
        label: "Intermediate",
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
      };
    return {
      label: "Beginner",
      color: "bg-gradient-to-r from-green-500 to-green-600",
    };
  };

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
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "success":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "error":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-200";
    }
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      case "success":
        return <Cloud className="w-3 h-3" />;
      case "error":
        return <CloudOff className="w-3 h-3" />;
      default:
        return <Cloud className="w-3 h-3" />;
    }
  };

  const dashboardCards = [
    {
      title: "Search Papers",
      description: "Find works by keyword, author, or topic using OpenAlex",
      href: "/search",
      icon: Search,
      color: "bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9]",
      stats: "25K+ Papers",
      badge: "Popular",
      xpReward: "+5 XP per search",
    },
    {
      title: "My Library",
      description: "View and manage your saved research papers",
      href: "/library",
      icon: BookOpen,
      color: "bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9]",
      stats: `${userStats.papersSaved} Items`,
      badge: userStats.papersSaved > 0 ? "Updated" : "Empty",
      xpReward: "+10 XP per save",
    },
    {
      title: "AI Recommendations",
      description: "Get personalized paper recommendations",
      href: "/recommendations",
      icon: Brain,
      color: "bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9]",
      stats: "AI Powered",
      badge: "Smart",
      xpReward: "+15 XP per generation",
    },
    {
      title: "Collections",
      description: "Organize your research into smart collections",
      href: "/collections",
      icon: Library,
      color: "bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9]",
      stats: `${userStats.collections} Collections`,
      badge: "Organize",
      xpReward: "+20 XP per collection",
    },
    {
      title: "Research Analytics",
      description: "Analyze your reading patterns and interests",
      href: "/analytics",
      icon: BarChart3,
      color: "bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9]",
      stats: "4+ Charts",
      badge: "Insights",
      xpReward: "+25 XP weekly",
    },
    {
      title: "Explore",
      description: "Explore diverse range of papers",
      href: "/explore",
      icon: Brain,
      color: "bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9]",
      stats: "Popular and emerging research areas",
      badge: "Diverse",
      xpReward: "Keep exploring",
    },
  ];

  const stats = [
    {
      label: "Papers Saved",
      value: userStats.papersSaved.toString(),
      icon: FileText,
      change: `+${Math.floor(userStats.papersSaved * 0.3)}`,
      description: "From last month",
      xp: userStats.papersSaved * 10,
    },
    {
      label: "Collections",
      value: userStats.collections.toString(),
      icon: Library,
      change: `+${Math.floor(userStats.collections * 0.2)}`,
      description: "Organized topics",
      xp: userStats.collections * 20,
    },
    {
      label: "Reading Time",
      value: userStats.readingTime,
      icon: Clock,
      change: "+2h",
      description: "This week",
      xp: parseInt(userStats.readingTime) * 5,
    },
    {
      label: "Current Streak",
      value: `${streak} days`,
      icon: Zap,
      change: streak > 0 ? "Active" : "Start",
      description: "Daily research",
      xp: streak * 15,
    },
  ];

  const displayName = useUserDisplayName();

  const levelBadge = getLevelBadge(userLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Enhanced Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <ProfilePictureUpload
                  onProfilePictureChange={handleProfilePictureChange}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Welcome, {displayName}
                    </h1>
                    <Badge
                      className={`${levelBadge.color} text-white border-0 shadow-lg px-3 py-1`}
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Level {userLevel}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4" />
                      {getLevelTitle(userLevel)} • {userXP} Total XP
                    </p>
                    {user && (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getSyncStatusColor()} border backdrop-blur-sm text-xs`}
                        >
                          {getSyncIcon()}
                          {getSyncStatusText()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={enhancedSyncFromCloud}
                  disabled={isSyncing}
                  className="rounded-xl shrink-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                  title="Pull latest data from cloud"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl shrink-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl shrink-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                  asChild
                >
                  <Link href="/achievements">
                    <Award className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl shrink-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                  asChild
                >
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] hover:from-[#3aa8a9] hover:to-[#2b9597] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl shrink-0"
                  asChild
                >
                  <Link href="/search">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">New Search</span>
                    <Search className="h-4 w-4 sm:hidden" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Level Progress Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 lg:mb-8"
          >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] p-2 lg:p-3 rounded-xl shadow-lg">
                      <Trophy className="text-white w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        Level Progress
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {levelProgress}% to Level {userLevel + 1}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] text-white border-0 px-3 py-1 text-sm">
                    {userXP} XP
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] h-3 rounded-full shadow-lg"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Level {userLevel}</span>
                    <span>{100 - (userXP % 100)} XP to go</span>
                    <span>Level {userLevel + 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 lg:mb-8"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] h-full">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {stat.value}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                            {stat.label}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                            >
                              {stat.change}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {stat.xp} XP
                            </span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#49BBBD]/10 to-[#3aa8a9]/10 p-3 rounded-xl">
                          <stat.icon className="text-[#49BBBD] w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Main Dashboard Cards */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 lg:mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {dashboardCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link href={card.href}>
                    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] group cursor-pointer h-full">
                      <CardContent className="p-5 lg:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl ${card.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                              <card.icon className="text-white w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg lg:text-xl flex items-center gap-2 text-gray-900 dark:text-white mb-1">
                                {card.title}
                                <Badge variant="secondary" className="text-xs">
                                  {card.badge}
                                </Badge>
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {card.description}
                              </CardDescription>
                            </div>
                          </div>
                          <ArrowRight
                            className="text-gray-400 group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300 shrink-0"
                            size={20}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium text-[#49BBBD]">
                              {card.stats}
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {card.xpReward}
                            </p>
                          </div>
                          <div className="w-8 h-1 bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] rounded-full group-hover:w-12 transition-all duration-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Recent Activity & Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6"
          >
            {/* Recent Activity */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock className="h-5 w-5 text-[#49BBBD]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-[#49BBBD]/30 transition-all duration-300 group"
                      >
                        <div
                          className={`p-2 rounded-lg ${activity.bgColor} group-hover:scale-110 transition-transform`}
                        >
                          <activity.icon
                            className={`h-4 w-4 ${activity.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize bg-gray-50 dark:bg-gray-800"
                        >
                          {activity.type}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#49BBBD]/10 to-[#3aa8a9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="text-[#49BBBD] w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      No recent activity
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Start exploring to see your research journey
                    </p>
                    <Button
                      className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] hover:from-[#3aa8a9] hover:to-[#2b9597] text-white rounded-xl"
                      asChild
                    >
                      <Link href="/search">Start Exploring</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Sparkles className="h-5 w-5 text-[#49BBBD]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      icon: Search,
                      title: "Quick Search",
                      description: "+5 XP per search",
                      href: "/search",
                    },
                    {
                      icon: BookOpen,
                      title: "Add New Paper",
                      description: "+10 XP per save",
                      href: "/library",
                    },
                    {
                      icon: Brain,
                      title: "AI Recommendations",
                      description: "+15 XP per generation",
                      href: "/recommendations",
                    },
                    {
                      icon: Award,
                      title: "View Achievements",
                      description: `Level ${userLevel} • ${userXP} XP`,
                      href: "/achievements",
                    },
                  ].map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start h-14 lg:h-16 border-gray-200/50 dark:border-gray-700/50 hover:border-[#49BBBD]/30 hover:bg-[#49BBBD]/5 transition-all duration-300 rounded-xl"
                        asChild
                      >
                        <Link href={action.href}>
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br from-[#49BBBD]/10 to-[#3aa8a9]/10`}
                          >
                            <action.icon className="h-4 w-4 text-[#49BBBD]" />
                          </div>
                          <div className="text-left ml-3 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {action.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight
                            className="text-gray-400 group-hover:text-[#49BBBD] ml-2"
                            size={16}
                          />
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
