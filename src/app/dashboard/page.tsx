"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings,
  Award,
  Search,
  BookOpen,
  TrendingUp,
  User,
  ArrowRight,
  Brain,
  Library,
  BarChart3,
  FileText,
  Users,
  Clock,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    papersSaved: 0,
    collections: 0,
    readingTime: "0h",
    collaborators: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Get user-specific storage key
  const getUserLibraryKey = () => {
    return user ? `savedPapers_${user.uid}` : "savedPapers_guest";
  };

  useEffect(() => {
    if (user) {
      // Load user-specific library data for stats
      const userLibraryKey = getUserLibraryKey();
      const stored = localStorage.getItem(userLibraryKey);
      const savedPapers = stored ? JSON.parse(stored) : [];

      // Calculate collections from unique journals
      const uniqueJournals = new Set(savedPapers.map((p: any) => p.journal))
        .size;

      // Get reading data
      const readPapersKey = user ? `reads_${user.uid}` : "reads_guest";
      const readPapersData = localStorage.getItem(readPapersKey);
      const readPapers = readPapersData ? JSON.parse(readPapersData) : [];
      const readingHours = Math.floor(readPapers.length * 0.5); // Estimate 30min per paper

      setUserStats({
        papersSaved: savedPapers.length,
        collections: uniqueJournals,
        readingTime: `${readingHours}h`,
        collaborators: Math.floor(savedPapers.length / 10),
      });

      // Generate recent activity from saved papers and reads
      const activity = [
        ...savedPapers.slice(0, 3).map((paper: any) => ({
          type: "saved",
          title: paper.title,
          time: "Recently",
          icon: BookOpen,
          color: "text-green-500",
        })),
        ...readPapers.slice(0, 2).map((paper: any) => ({
          type: "read",
          title: paper.title,
          time: "Today",
          icon: FileText,
          color: "text-blue-500",
        })),
      ];
      setRecentActivity(activity);
    }
  }, [user]);

  const dashboardCards = [
    {
      title: "Search Papers",
      description: "Find works by keyword, author, or topic using OpenAlex",
      href: "/search",
      icon: Search,
      color: "bg-[#49BBBD]",
      stats: "25K+ Papers",
      badge: "Popular",
    },
    {
      title: "My Library",
      description: "View and manage your saved research papers",
      href: "/library",
      icon: BookOpen,
      color: "bg-[#49BBBD]",
      stats: `${userStats.papersSaved} Items`,
      badge: userStats.papersSaved > 0 ? "Updated" : "Empty",
    },
    {
      title: "Explore Trends",
      description: "See trending research topics and authors",
      href: "/explore",
      icon: TrendingUp,
      color: "bg-[#49BBBD]",
      stats: "50+ Trends",
      badge: "New",
    },
    {
      title: "Research Analytics",
      description: "Analyze your reading patterns and interests",
      href: "/analytics",
      icon: BarChart3,
      color: "bg-[#49BBBD]",
      stats: "15 Charts",
      badge: "Insights",
    },
    {
      title: "Collections",
      description: "Organize your research into smart collections",
      href: "/collections",
      icon: Library,
      color: "bg-[#49BBBD]",
      stats: `${userStats.collections} Collections`,
      badge: "Organize",
    },
    {
      title: "Recommendations",
      description: "Get personalized paper recommendations",
      href: "/recommendations",
      icon: Brain,
      color: "bg-[#49BBBD]",
      stats: "AI Powered",
      badge: "Smart",
    },
  ];

  const stats = [
    {
      label: "Papers Saved",
      value: userStats.papersSaved.toString(),
      icon: FileText,
      change: "+12%",
      description: "From last month",
    },
    {
      label: "Collections",
      value: userStats.collections.toString(),
      icon: Library,
      change: "+5%",
      description: "Organized topics",
    },
    {
      label: "Reading Time",
      value: userStats.readingTime,
      icon: Clock,
      change: "+2h",
      description: "This week",
    },
    {
      label: "Collaborators",
      value: userStats.collaborators.toString(),
      icon: Users,
      change: "+1",
      description: "Research network",
    },
  ];

  // Use displayName (Firebase) or fallback to email username
  const displayName =
    (user as any)?.displayName ||
    (user?.email ? user.email.split("@")[0] : "Researcher");

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 text-gray-900 overflow-hidden">
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
              <Avatar className="h-16 w-16 border-2 border-[#49BBBD]">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="bg-[#49BBBD] text-white text-lg font-semibold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Welcome back, {displayName}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Ready for today's research session?
                </p>
                {user && (
                  <p className="text-sm text-gray-500 mt-1">
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
              <Button className="bg-[#49BBBD] hover:bg-[#3aa8a9]" asChild>
                <Link href="/search">
                  <Plus className="h-4 w-4 mr-2" />
                  New Search
                </Link>
              </Button>
            </div>
          </motion.header>

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
                <Card className="border-gray-200/50 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-gray-600 text-sm font-medium">
                          {stat.label}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {stat.change}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {stat.description}
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
                  <Card className="border-gray-200/50 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full group cursor-pointer hover:border-[#49BBBD]/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${card.color} shadow-md`}
                          >
                            <card.icon className="text-white" size={24} />
                          </div>
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
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
                          className="text-gray-400 group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                          size={20}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[#49BBBD]">
                          {card.stats}
                        </span>
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
            <Card className="border-gray-200/50 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200/50 hover:border-[#49BBBD]/30 transition-colors"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            activity.color === "text-green-500"
                              ? "bg-green-50"
                              : "bg-blue-50"
                          }`}
                        >
                          <activity.icon
                            className={`h-4 w-4 ${activity.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
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
                      className="mx-auto text-gray-300 mb-3"
                      size={48}
                    />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Start exploring to see your research journey
                    </p>
                    <Button
                      className="mt-4 bg-[#49BBBD] hover:bg-[#3aa8a9]"
                      asChild
                    >
                      <Link href="/search">Start Exploring</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-200/50 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#49BBBD]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    asChild
                  >
                    <Link href="/search">
                      <Search className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      Quick Search
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    asChild
                  >
                    <Link href="/library">
                      <BookOpen className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      Add New Paper
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    asChild
                  >
                    <Link href="/recommendations">
                      <Brain className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      Get AI Recommendations
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    asChild
                  >
                    <Link href="/analytics">
                      <BarChart3 className="h-4 w-4 mr-3 text-[#49BBBD]" />
                      View Analytics
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
