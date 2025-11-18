"use client";

import { useAuth } from "@/context/AuthContext";
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
  Camera,
  Trash2,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentProfilePic, setCurrentProfilePic] = useState<string | null>(
    null
  );

  const getUserProfilePicKey = () => {
    return user ? `profilePic_${user.uid}` : "profilePic_guest";
  };

  // Load profile picture on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfilePic = localStorage.getItem(getUserProfilePicKey());
      setCurrentProfilePic(savedProfilePic);
    }
  }, [user]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create temporary URL for immediate preview
      const tempUrl = URL.createObjectURL(file);
      setCurrentProfilePic(tempUrl);
      setIsMenuOpen(false);

      // Save to localStorage for persistence
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        localStorage.setItem(getUserProfilePicKey(), imageDataUrl);
        // Replace temp URL with permanent data URL
        setCurrentProfilePic(imageDataUrl);
        onProfilePictureChange();
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePicture = () => {
    localStorage.removeItem(getUserProfilePicKey());
    setCurrentProfilePic(null);
    setIsMenuOpen(false);
    onProfilePictureChange();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
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
      {/* Profile Picture with Click Handler */}
      <div className="relative group cursor-pointer" onClick={toggleMenu}>
        <Avatar className="h-16 w-16 border-2 border-[#49BBBD] group-hover:border-[#3aa8a9] transition-colors">
          {hasValidProfilePic ? (
            <AvatarImage
              src={currentProfilePic || user?.photoURL || undefined}
              alt="Profile"
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-[#49BBBD] text-white text-lg font-semibold group-hover:bg-[#3aa8a9] transition-colors">
            {userInitial}
          </AvatarFallback>
        </Avatar>

        {/* Edit Icon Overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center transition-opacity ${
            isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-18 left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-2"
        >
          <div className="space-y-1">
            <button
              onClick={handleUploadClick}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Camera className="h-4 w-4" />
              {currentProfilePic ? "Change Photo" : "Upload Photo"}
            </button>

            {currentProfilePic && (
              <button
                onClick={handleDeletePicture}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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

export default function DashboardPage() {
  const { user } = useAuth();
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

  const getUserLibraryKey = () => {
    return user ? `savedPapers_${user.uid}` : "savedPapers_guest";
  };

  const loadUserStats = () => {
    if (user) {
      const userId = user.uid;

      // Load gamification data
      const xp = getUserXP(userId);
      const level = getLevel(xp);
      const progress = getLevelProgress(xp);
      const currentStreak = updateStreak(userId);

      setUserXP(xp);
      setUserLevel(level);
      setLevelProgress(progress);
      setStreak(currentStreak);

      // Load user-specific library data
      const userLibraryKey = getUserLibraryKey();
      const stored = localStorage.getItem(userLibraryKey);
      const savedPapers = stored ? JSON.parse(stored) : [];

      // Load collections count
      const collectionsKey = `collections_${userId}`;
      const storedCollections = localStorage.getItem(collectionsKey);
      const collections = storedCollections
        ? JSON.parse(storedCollections)
        : [];
      const collectionsCount = collections.length;

      // Get reading data
      const readPapersKey = `reads_${userId}`;
      const readPapersData = localStorage.getItem(readPapersKey);
      const readPapers = readPapersData ? JSON.parse(readPapersData) : [];
      const readingHours = Math.floor(readPapers.length * 0.5);

      // Calculate collaborators
      const collaboratorScore = Math.floor(
        (savedPapers.length + collectionsCount) / 5
      );

      setUserStats({
        papersSaved: savedPapers.length,
        collections: collectionsCount,
        readingTime: `${readingHours}h`,
        collaborators: collaboratorScore,
      });

      // Generate recent activity
      const activity = [
        ...savedPapers.slice(0, 3).map((paper: any) => ({
          type: "saved",
          title: paper.title,
          time: "Recently",
          icon: BookOpen,
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950/30",
        })),
        ...readPapers.slice(0, 2).map((paper: any) => ({
          type: "read",
          title: paper.title,
          time: "Today",
          icon: FileText,
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
        })),
      ];
      setRecentActivity(activity);
    }
  };

  const handleProfilePictureChange = () => {
    setProfilePictureVersion((prev) => prev + 1);
  };

  useEffect(() => {
    loadUserStats();

    const handleStorageChange = () => {
      loadUserStats();
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadUserStats, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user, profilePictureVersion]);

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
      return { label: "Legend", color: "bg-purple-500 text-white" };
    if (level >= 7) return { label: "Expert", color: "bg-red-500 text-white" };
    if (level >= 5) return { label: "Pro", color: "bg-orange-500 text-white" };
    if (level >= 3)
      return { label: "Intermediate", color: "bg-blue-500 text-white" };
    return { label: "Beginner", color: "bg-green-500 text-white" };
  };

  const dashboardCards = [
    {
      title: "Search Papers",
      description: "Find works by keyword, author, or topic using OpenAlex",
      href: "/search",
      icon: Search,
      color: "bg-[#49BBBD]",
      stats: "25K+ Papers",
      badge: "Popular",
      xpReward: "+5 XP per search",
    },
    {
      title: "My Library",
      description: "View and manage your saved research papers",
      href: "/library",
      icon: BookOpen,
      color: "bg-[#49BBBD]",
      stats: `${userStats.papersSaved} Items`,
      badge: userStats.papersSaved > 0 ? "Updated" : "Empty",
      xpReward: "+10 XP per save",
    },
    {
      title: "AI Recommendations",
      description: "Get personalized paper recommendations",
      href: "/recommendations",
      icon: Brain,
      color: "bg-[#49BBBD]",
      stats: "AI Powered",
      badge: "Smart",
      xpReward: "+15 XP per generation",
    },
    {
      title: "Collections",
      description: "Organize your research into smart collections",
      href: "/collections",
      icon: Library,
      color: "bg-[#49BBBD]",
      stats: `${userStats.collections} Collections`,
      badge: "Organize",
      xpReward: "+20 XP per collection",
    },
    {
      title: "Research Analytics",
      description: "Analyze your reading patterns and interests",
      href: "/analytics",
      icon: BarChart3,
      color: "bg-[#49BBBD]",
      stats: "4+ Charts",
      badge: "Insights",
      xpReward: "+25 XP weekly",
    },
    {
      title: "Achievements",
      description: "Track your progress and unlock rewards",
      href: "/achievements",
      icon: Trophy,
      color: "bg-[#49BBBD]",
      stats: `${userLevel} Level`,
      badge: getLevelBadge(userLevel).label,
      xpReward: "Level up rewards",
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

  const displayName =
    (user as any)?.displayName ||
    (user?.email ? user.email.split("@")[0] : "Researcher");

  const levelBadge = getLevelBadge(userLevel);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(#49BBBD_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-5 dark:opacity-10"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pt-8 gap-6"
          >
            <div className="flex items-center gap-4">
              <ProfilePictureUpload
                onProfilePictureChange={handleProfilePictureChange}
              />
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Welcome back, {displayName}
                  </h1>
                  <Badge className={levelBadge.color}>
                    <Crown className="w-3 h-3 mr-1" />
                    Level {userLevel}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {getLevelTitle(userLevel)} • {userXP} Total XP
                </p>
                {user && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Personal Research Dashboard • Last active: Today
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="icon" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="/achievements">
                  <Award className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                asChild
              >
                <Link href="/search">
                  <Plus className="h-4 w-4 mr-2" />
                  New Search
                </Link>
              </Button>
            </div>
          </motion.header>

          {/* Level Progress Bar */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] p-2 rounded-lg">
                      <Trophy className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Level Progress
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {levelProgress}% to Level {userLevel + 1}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                  >
                    {userXP} XP
                  </Badge>
                </div>

                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    Level {userLevel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {100 - (userXP % 100)} XP to next level
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Level {userLevel + 1}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          {stat.label}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
                          >
                            {stat.change}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {stat.xp} XP earned
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#49BBBD]/10 p-3 rounded-xl">
                        <stat.icon className="text-[#49BBBD]" size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.section>

          {/* Main Dashboard Cards */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {dashboardCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link href={card.href}>
                  <Card className="border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full group cursor-pointer hover:border-[#49BBBD]/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${card.color} shadow-md`}
                          >
                            <card.icon className="text-white" size={24} />
                          </div>
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                              {card.title}
                              <Badge variant="secondary" className="text-xs">
                                {card.badge}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {card.description}
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowRight
                          className="text-muted-foreground group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                          size={20}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-[#49BBBD]">
                            {card.stats}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {card.xpReward}
                          </p>
                        </div>
                        <div className="w-8 h-1 bg-[#49BBBD] rounded-full group-hover:w-12 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.section>

          {/* Recent Activity & Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Recent Activity */}
            <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5 text-[#49BBBD]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-[#49BBBD]/30 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                          <activity.icon
                            className={`h-4 w-4 ${activity.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen
                      className="mx-auto text-muted-foreground/30 mb-3"
                      size={48}
                    />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Start exploring to see your research journey
                    </p>
                    <Button
                      className="mt-4 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                      asChild
                    >
                      <Link href="/search">Start Exploring</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-5 w-5 text-[#49BBBD]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 border-border"
                    asChild
                  >
                    <Link href="/search">
                      <Search className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          Quick Search
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +5 XP per search
                        </p>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 border-border"
                    asChild
                  >
                    <Link href="/library">
                      <BookOpen className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          Add New Paper
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +10 XP per save
                        </p>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 border-border"
                    asChild
                  >
                    <Link href="/recommendations">
                      <Brain className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          AI Recommendations
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +15 XP per generation
                        </p>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 border-border"
                    asChild
                  >
                    <Link href="/achievements">
                      <Award className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          View Achievements
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {userLevel} • {userXP} XP
                        </p>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
