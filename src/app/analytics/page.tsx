"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Brain,
  TrendingUp,
  BookOpen,
  Calendar,
  User,
  Building,
  Clock,
  Target,
  Award,
  Download,
  Filter,
  Sparkles,
  BarChart3,
  Eye,
  FileText,
  Library,
  Users,
  RefreshCw,
  Cloud,
  CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Paper {
  id: string;
  title: string;
  author: string;
  year: string | number;
  journal: string;
  link: string;
  savedAt?: string;
}

interface ReadingRecord {
  paperId: string;
  title: string;
  readAt: string;
  authors: string;
  journal: string;
  year: string | number;
  url: string;
}

interface AnalyticsData {
  totalPapers: number;
  readingTrend: { month: string; count: number }[];
  topJournals: { name: string; count: number }[];
  publicationYears: { year: string; count: number }[];
  readingTimePattern: { hour: string; count: number }[];
  authorStats: { author: string; count: number }[];
  categoryStats: { category: string; count: number }[];
  weeklyActivity: { day: string; count: number }[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<"all" | "month" | "year">("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const { user } = useAuth();
  const { syncToCloud, syncFromCloud, isSyncing, lastSynced, syncError } =
    useSync();

  const userId = user?.uid;

  // Colors for charts
  const COLORS = [
    "#49BBBD",
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#6A0572",
    "#118AB2",
    "#EF476F",
  ];

  // Enhanced sync functions - FIXED: Better error handling
  const enhancedSyncToCloud = async () => {
    setSyncStatus("syncing");
    try {
      const success = await syncToCloud();
      if (success) {
        setSyncStatus("success");
        // Reload data after successful sync
        setTimeout(() => {
          loadAnalyticsData();
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
        loadAnalyticsData(); // Reload data after sync
      } else {
        setSyncStatus("error");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

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

  // Memoized data loading function to prevent infinite loops - FIXED: Better sync integration
  const loadAnalyticsData = useCallback(() => {
    setLoading(true);

    try {
      const userLibraryKey = user
        ? `savedPapers_${user.uid}`
        : "savedPapers_guest";
      const stored = localStorage.getItem(userLibraryKey);
      const savedPapers: Paper[] = stored ? JSON.parse(stored) : [];

      // Get reading history - handle both old format (number) and new format (array)
      const readPapersKey = user ? `reads_${user.uid}` : "reads_guest";
      const readPapersData = localStorage.getItem(readPapersKey);

      let readPapers: ReadingRecord[] = [];

      if (readPapersData) {
        try {
          const parsed = JSON.parse(readPapersData);
          if (Array.isArray(parsed)) {
            readPapers = parsed;
          } else if (typeof parsed === "number") {
            readPapers = generateMockReadingData(parsed);
            localStorage.setItem(readPapersKey, JSON.stringify(readPapers));
          }
        } catch (error) {
          console.log("Read papers data is not valid JSON, using empty array");
          readPapers = [];
        }
      }

      const data = generateAnalyticsData(savedPapers, readPapers);
      setAnalyticsData(data);
      console.log("✅ Analytics data loaded successfully");
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalyticsData({
        totalPapers: 0,
        readingTrend: [],
        topJournals: [],
        publicationYears: [],
        readingTimePattern: [],
        authorStats: [],
        categoryStats: [],
        weeklyActivity: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user, timeRange]);

  // Fixed useEffect - no infinite loop with proper sync integration
  useEffect(() => {
    loadAnalyticsData();

    // Listen for data changes and cloud sync events
    const handleDataChange = () => {
      console.log("🔄 Data changed, reloading analytics");
      loadAnalyticsData();
    };

    const handleCloudDataApplied = () => {
      console.log("🔄 Cloud data applied, reloading analytics");
      loadAnalyticsData();
    };

    window.addEventListener("storage", handleDataChange);
    window.addEventListener("cloudDataApplied", handleCloudDataApplied);
    window.addEventListener("dataChanged", handleDataChange);

    return () => {
      window.removeEventListener("storage", handleDataChange);
      window.removeEventListener("cloudDataApplied", handleCloudDataApplied);
      window.removeEventListener("dataChanged", handleDataChange);
    };
  }, [user, timeRange, loadAnalyticsData]);

  // Auto-sync when analytics data changes - FIXED: Better auto-sync logic
  useEffect(() => {
    if (analyticsData && !loading && user) {
      const syncTimer = setTimeout(async () => {
        try {
          await syncToCloud();
          console.log("✅ Analytics data auto-synced to cloud");
        } catch (error) {
          console.error("❌ Failed to auto-sync analytics:", error);
        }
      }, 5000); // Delay sync to avoid excessive API calls

      return () => clearTimeout(syncTimer);
    }
  }, [analyticsData, loading, user, syncToCloud]);

  const generateMockReadingData = (readCount: number): ReadingRecord[] => {
    const mockRecords: ReadingRecord[] = [];
    const now = new Date();

    for (let i = 0; i < readCount; i++) {
      const readDate = new Date(now);
      readDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
      readDate.setHours(Math.floor(Math.random() * 24));

      mockRecords.push({
        paperId: `mock-${i}`,
        title: `Previously Read Paper ${i + 1}`,
        readAt: readDate.toISOString(),
        authors: "Unknown Author",
        journal: "Unknown Journal",
        year: "N/A",
        url: "",
      });
    }

    return mockRecords;
  };

  const generateAnalyticsData = (
    savedPapers: Paper[],
    readPapers: ReadingRecord[]
  ): AnalyticsData => {
    const monthlyTrend = generateMonthlyTrend(savedPapers);
    const journalStats = generateJournalStats(savedPapers);
    const yearStats = generateYearStats(savedPapers);
    const timePatterns = generateTimePatterns(readPapers);
    const authorStats = generateAuthorStats(savedPapers);
    const categoryStats = generateCategoryStats(savedPapers);
    const weeklyActivity = generateWeeklyActivity(readPapers);

    return {
      totalPapers: savedPapers.length,
      readingTrend: monthlyTrend,
      topJournals: journalStats.slice(0, 8),
      publicationYears: yearStats.slice(0, 10),
      readingTimePattern: timePatterns,
      authorStats: authorStats.slice(0, 10),
      categoryStats: categoryStats.slice(0, 6),
      weeklyActivity,
    };
  };

  const generateMonthlyTrend = (papers: Paper[]) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();

    return months.map((month) => ({
      month,
      count: papers.filter((paper) => {
        const savedDate = paper.savedAt ? new Date(paper.savedAt) : new Date();
        return (
          savedDate.getMonth() === months.indexOf(month) &&
          savedDate.getFullYear() === currentYear
        );
      }).length,
    }));
  };

  const generateJournalStats = (papers: Paper[]) => {
    const journalCount: Record<string, number> = {};

    papers.forEach((paper) => {
      const journal =
        paper.journal !== "N/A" ? paper.journal : "Unknown Journal";
      journalCount[journal] = (journalCount[journal] || 0) + 1;
    });

    return Object.entries(journalCount)
      .map(([name, count]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const generateYearStats = (papers: Paper[]) => {
    const yearCount: Record<string, number> = {};

    papers.forEach((paper) => {
      const year = paper.year !== "N/A" ? String(paper.year) : "Unknown";
      yearCount[year] = (yearCount[year] || 0) + 1;
    });

    return Object.entries(yearCount)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year));
  };

  const generateTimePatterns = (readPapers: ReadingRecord[]) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourCounts = hours.map((hour) => ({ hour: `${hour}:00`, count: 0 }));

    if (!Array.isArray(readPapers)) return hourCounts;

    readPapers.forEach((paper) => {
      if (paper && paper.readAt) {
        try {
          const readTime = new Date(paper.readAt);
          const hour = readTime.getHours();
          const hourEntry = hourCounts.find((h) => parseInt(h.hour) === hour);
          if (hourEntry) hourEntry.count += 1;
        } catch (error) {
          console.error("Error parsing read time:", error);
        }
      }
    });

    return hourCounts;
  };

  const generateAuthorStats = (papers: Paper[]) => {
    const authorCount: Record<string, number> = {};

    papers.forEach((paper) => {
      const authors = paper.author.split(", ").slice(0, 3);
      authors.forEach((author) => {
        if (author !== "Unknown author") {
          authorCount[author] = (authorCount[author] || 0) + 1;
        }
      });
    });

    return Object.entries(authorCount)
      .map(([author, count]) => ({
        author: author.length > 25 ? author.substring(0, 25) + "..." : author,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const generateCategoryStats = (papers: Paper[]) => {
    const categories = [
      "Machine Learning",
      "AI",
      "Neuroscience",
      "Biology",
      "Computer Science",
      "Medicine",
      "Physics",
      "Chemistry",
      "Engineering",
      "Mathematics",
    ];

    const categoryCount: Record<string, number> = {};

    categories.forEach((category) => {
      categoryCount[category] = papers.filter((paper) =>
        paper.title.toLowerCase().includes(category.toLowerCase())
      ).length;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  };

  const generateWeeklyActivity = (readPapers: ReadingRecord[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayCounts = days.map((day) => ({ day, count: 0 }));

    if (!Array.isArray(readPapers)) return dayCounts;

    readPapers.forEach((paper) => {
      if (paper && paper.readAt) {
        try {
          const readDate = new Date(paper.readAt);
          const dayIndex = (readDate.getDay() + 6) % 7;
          const dayEntry = dayCounts[dayIndex];
          if (dayEntry) dayEntry.count += 1;
        } catch (error) {
          console.error("Error parsing read date:", error);
        }
      }
    });

    return dayCounts;
  };

  const exportData = () => {
    if (!analyticsData) return;

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `research-analytics-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const stats = [
    {
      label: "Papers Saved",
      value: analyticsData?.totalPapers.toString() || "0",
      icon: FileText,
      change: "+12%",
      description: "In your library",
    },
    {
      label: "Collections",
      value: analyticsData?.topJournals.length.toString() || "0",
      icon: Library,
      change: "+5%",
      description: "Unique journals",
    },
    {
      label: "Reading Time",
      value:
        analyticsData?.readingTimePattern
          .reduce((sum, item) => sum + item.count, 0)
          .toString() + "h" || "0h",
      icon: Clock,
      change: "+2h",
      description: "Total tracked",
    },
    {
      label: "Authors",
      value: analyticsData?.authorStats.length.toString() || "0",
      icon: Users,
      change: "+3",
      description: "Unique authors",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#49BBBD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading your research analytics...
          </p>
          <Badge className="mt-2 bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20">
            <Cloud className="w-3 h-3 mr-1" />
            Syncing data from cloud
          </Badge>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto text-muted-foreground mb-4" size={48} />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Data Available
          </h2>
          <p className="text-muted-foreground mb-4">
            Save and read some papers to see your research analytics.
          </p>
          <Button
            onClick={enhancedSyncFromCloud}
            className="bg-[#49BBBD] hover:bg-[#3aa8a9]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync from Cloud
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
                <BarChart3 className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Research Analytics
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gain insights into your reading patterns and research habits
            </p>
          </motion.header>

          {/* Time Range Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-between items-center mb-6"
          >
            <Select
              value={timeRange}
              onValueChange={(value: any) => setTimeRange(value)}
            >
              <SelectTrigger className="w-32 bg-card/50 backdrop-blur-sm border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 h-full">
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
                            className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                          >
                            {stat.change}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
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

          {/* Analytics Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Reading Patterns
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Content Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reading Trend */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#49BBBD]" />
                      Monthly Reading Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.readingTrend}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            className="opacity-30"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="currentColor"
                            className="text-sm"
                          />
                          <YAxis stroke="currentColor" className="text-sm" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#49BBBD"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Journals */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-[#49BBBD]" />
                      Top Journals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.topJournals}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, percent }: any) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {analyticsData.topJournals.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reading" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reading Time Patterns */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#49BBBD]" />
                      Reading Time Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.readingTimePattern}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            className="opacity-30"
                          />
                          <XAxis
                            dataKey="hour"
                            stroke="currentColor"
                            className="text-sm"
                          />
                          <YAxis stroke="currentColor" className="text-sm" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#4ECDC4"
                            strokeWidth={3}
                            dot={{ fill: "#4ECDC4" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {analyticsData.readingTimePattern.every(
                      (item) => item.count === 0
                    ) && (
                      <div className="text-center mt-4 text-sm text-muted-foreground">
                        Read some papers to see your reading time patterns
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Weekly Activity */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#49BBBD]" />
                      Weekly Reading Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.weeklyActivity}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            className="opacity-30"
                          />
                          <XAxis
                            dataKey="day"
                            stroke="currentColor"
                            className="text-sm"
                          />
                          <YAxis stroke="currentColor" className="text-sm" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#6A0572"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {analyticsData.weeklyActivity.every(
                      (item) => item.count === 0
                    ) && (
                      <div className="text-center mt-4 text-sm text-muted-foreground">
                        Read some papers to see your weekly activity patterns
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Publication Years */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#49BBBD]" />
                      Publication Years
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analyticsData.publicationYears}
                          layout="vertical"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            className="opacity-30"
                          />
                          <XAxis
                            type="number"
                            stroke="currentColor"
                            className="text-sm"
                          />
                          <YAxis
                            type="category"
                            dataKey="year"
                            width={80}
                            stroke="currentColor"
                            className="text-sm"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#FF6B6B"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Authors */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#49BBBD]" />
                      Top Authors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {analyticsData.authorStats
                        .slice(0, 8)
                        .map((author, index) => (
                          <div
                            key={author.author}
                            className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                              >
                                #{index + 1}
                              </Badge>
                              <span className="text-sm font-medium text-foreground">
                                {author.author}
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {author.count} papers
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
              <CardContent className="p-6">
                <Download
                  className="mx-auto text-muted-foreground mb-3"
                  size={32}
                />
                <CardTitle className="text-lg mb-2">Export Your Data</CardTitle>
                <CardDescription className="mb-4">
                  Download your complete research analytics in JSON format
                </CardDescription>
                <Button
                  onClick={exportData}
                  className="bg-[#49BBBD] hover:bg-[#3aa8a9]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Analytics Data
                </Button>
                <div className="mt-3 text-xs text-muted-foreground">
                  Includes all your reading patterns and research insights
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
