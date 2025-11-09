"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
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
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  useEffect(() => {
    loadAnalyticsData();
  }, [user, timeRange]);

  const loadAnalyticsData = () => {
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
          // Check if it's the new format (array) or old format (number)
          if (Array.isArray(parsed)) {
            readPapers = parsed;
          } else if (typeof parsed === "number") {
            // Convert old format to new format - create mock data for existing reads
            readPapers = generateMockReadingData(parsed);
            // Save the new format
            localStorage.setItem(readPapersKey, JSON.stringify(readPapers));
          }
        } catch (error) {
          console.log("Read papers data is not valid JSON, using empty array");
          readPapers = [];
        }
      }

      const data = generateAnalyticsData(savedPapers, readPapers);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Set empty analytics data on error
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
  };

  // Generate mock reading data for existing read counts
  const generateMockReadingData = (readCount: number): ReadingRecord[] => {
    const mockRecords: ReadingRecord[] = [];
    const now = new Date();

    for (let i = 0; i < readCount; i++) {
      // Distribute reads over the past 30 days
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
    // Reading trend by month
    const monthlyTrend = generateMonthlyTrend(savedPapers);

    // Top journals
    const journalStats = generateJournalStats(savedPapers);

    // Publication years
    const yearStats = generateYearStats(savedPapers);

    // Reading time patterns
    const timePatterns = generateTimePatterns(readPapers);

    // Author statistics
    const authorStats = generateAuthorStats(savedPapers);

    // Category analysis
    const categoryStats = generateCategoryStats(savedPapers);

    // Weekly activity
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

    // Initialize all hours with 0 count
    const hourCounts = hours.map((hour) => ({ hour: `${hour}:00`, count: 0 }));

    if (!Array.isArray(readPapers)) {
      return hourCounts;
    }

    // Count reads by hour
    readPapers.forEach((paper) => {
      if (paper && paper.readAt) {
        try {
          const readTime = new Date(paper.readAt);
          const hour = readTime.getHours();
          const hourEntry = hourCounts.find((h) => parseInt(h.hour) === hour);
          if (hourEntry) {
            hourEntry.count += 1;
          }
        } catch (error) {
          // Skip invalid dates
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

    // Initialize all days with 0 count
    const dayCounts = days.map((day) => ({ day, count: 0 }));

    if (!Array.isArray(readPapers)) {
      return dayCounts;
    }

    // Count reads by day of week
    readPapers.forEach((paper) => {
      if (paper && paper.readAt) {
        try {
          const readDate = new Date(paper.readAt);
          const dayIndex = (readDate.getDay() + 6) % 7; // Convert to Mon-Sun (0-6)
          const dayEntry = dayCounts[dayIndex];
          if (dayEntry) {
            dayEntry.count += 1;
          }
        } catch (error) {
          // Skip invalid dates
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#49BBBD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your research analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">
            Save and read some papers to see your research analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#49BBBD_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-5"></div>
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
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-2xl shadow-lg">
                <BarChart3 className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Research Analytics
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gain insights into your reading patterns and research habits
            </p>
          </motion.header>

          {/* Summary Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* ... (keep your existing summary cards) */}
          </motion.section>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Reading Trend */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" size={20} />
                  Reading Trend
                </h3>
                <Filter size={16} className="text-gray-400" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.readingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#49BBBD" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Journals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Building className="text-purple-500" size={20} />
                Top Journals
              </h3>
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
                    >
                      {analyticsData.topJournals.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Publication Years */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Calendar className="text-orange-500" size={20} />
                Publication Years
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.publicationYears}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="year" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF6B6B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Reading Time Patterns - FIXED */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Clock className="text-green-500" size={20} />
                Reading Time Patterns
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.readingTimePattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
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
                <div className="text-center mt-4 text-sm text-gray-500">
                  Read some papers to see your reading time patterns
                </div>
              )}
            </motion.div>

            {/* Weekly Activity - FIXED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Eye className="text-indigo-500" size={20} />
                Weekly Reading Activity
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6A0572" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {analyticsData.weeklyActivity.every(
                (item) => item.count === 0
              ) && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  Read some papers to see your weekly activity patterns
                </div>
              )}
            </motion.div>
          </div>

          {/* ... (rest of your components remain the same) */}
        </div>
      </div>
    </div>
  );
}
