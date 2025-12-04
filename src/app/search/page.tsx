"use client";

import { useState, useEffect } from "react";
import { searchPapers } from "@/lib/api/openAlex";
import { useRouter } from "next/navigation";
import { useZotero } from "@/context/ZoteroContext";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { BottomNav } from "@/components/navbar";
import { useToast } from "@/components/ui/toast";
import {
  addXP,
  unlockAchievement,
  checkSavedAchievements,
} from "@/lib/gamification";
import { motion } from "framer-motion";
import {
  Search,
  Save,
  BookOpen,
  User,
  Calendar,
  Building,
  ArrowRight,
  Brain,
  Download,
  Filter,
  Sparkles,
  Clock,
  X,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const router = useRouter();
  const { library } = useZotero();
  const { user } = useAuth();
  const { syncToCloud, triggerDataChange } = useSync();
  const { showToast, ToastContainer } = useToast();

  // Get user ID for gamification
  const userId = user?.uid;

  // Get user-specific storage key
  const getUserLibraryKey = () => {
    return userId ? `savedPapers_${userId}` : "savedPapers_guest";
  };

  // Load recent searches and previous results on component mount
  useEffect(() => {
    loadRecentSearches();
    loadPreviousResults();

    // Run storage cleanup on mount
    cleanupStorage();

    // Set up periodic cleanup every 5 minutes
    const interval = setInterval(cleanupStorage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to clear temporary data
  const clearTemporaryData = () => {
    try {
      // Clear temporary search data
      const tempKeys = [
        userId ? `previousResults_${userId}` : "previousResults_guest",
        userId ? `recentSearches_${userId}` : "recentSearches_guest",
        userId ? `temp_${userId}` : "temp_guest",
      ];

      tempKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Also clear old reading data (keep only last 50)
      const readKey = userId ? `reads_${userId}` : "reads_guest";
      const readsData = localStorage.getItem(readKey);
      if (readsData) {
        try {
          const reads = JSON.parse(readsData);
          if (Array.isArray(reads) && reads.length > 50) {
            const recentReads = reads.slice(-50);
            localStorage.setItem(readKey, JSON.stringify(recentReads));
          }
        } catch (e) {
          localStorage.removeItem(readKey);
        }
      }

      return true;
    } catch (error) {
      console.error("Error clearing temporary data:", error);
      return false;
    }
  };

  // Clean up old storage data
  const cleanupStorage = () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Clean saved papers older than 1 month (keep max 1000)
      const userLibraryKey = getUserLibraryKey();
      const savedData = localStorage.getItem(userLibraryKey);
      if (savedData) {
        try {
          const savedPapers = JSON.parse(savedData);
          if (Array.isArray(savedPapers)) {
            const recentPapers = savedPapers.filter((paper, index) => {
              if (index < 1000) return true; // Keep first 1000 papers
              const paperDate = new Date(paper.savedAt);
              return paperDate > oneMonthAgo;
            });

            if (recentPapers.length < savedPapers.length) {
              localStorage.setItem(
                userLibraryKey,
                JSON.stringify(recentPapers)
              );
            }
          }
        } catch (e) {
          console.error("Error cleaning saved papers:", e);
        }
      }
    } catch (error) {
      console.error("Storage cleanup error:", error);
    }
  };

  const loadRecentSearches = () => {
    const searchesKey = userId
      ? `recentSearches_${userId}`
      : "recentSearches_guest";
    const stored = localStorage.getItem(searchesKey);
    if (stored) {
      try {
        const searches = JSON.parse(stored);
        setRecentSearches(Array.isArray(searches) ? searches : []);
      } catch (error) {
        console.error("Error loading recent searches:", error);
        setRecentSearches([]);
      }
    }
  };

  const loadPreviousResults = () => {
    const resultsKey = userId
      ? `previousResults_${userId}`
      : "previousResults_guest";
    const stored = sessionStorage.getItem(resultsKey); // Use sessionStorage instead
    if (stored) {
      try {
        const previousData = JSON.parse(stored);
        if (previousData.query && previousData.results) {
          setQuery(previousData.query);
          setResults(previousData.results);
        }
      } catch (error) {
        console.error("Error loading previous results:", error);
      }
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const searchesKey = userId
      ? `recentSearches_${userId}`
      : "recentSearches_guest";
    const updatedSearches = [
      searchQuery.trim(),
      ...recentSearches.filter((s) => s !== searchQuery.trim()),
    ].slice(0, 10);

    try {
      localStorage.setItem(searchesKey, JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    } catch (error: any) {
      if (error.message && error.message.includes("quota")) {
        clearTemporaryData();
        // Try again after clearing
        try {
          localStorage.setItem(
            searchesKey,
            JSON.stringify(updatedSearches.slice(0, 5))
          );
          setRecentSearches(updatedSearches.slice(0, 5));
        } catch (retryError) {
          console.log("Could not save recent search after clearing");
        }
      }
    }
  };

  const removeRecentSearch = (searchToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const searchesKey = userId
      ? `recentSearches_${userId}`
      : "recentSearches_guest";
    const updatedSearches = recentSearches.filter((s) => s !== searchToRemove);

    try {
      localStorage.setItem(searchesKey, JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  };

  const clearRecentSearches = () => {
    const searchesKey = userId
      ? `recentSearches_${userId}`
      : "recentSearches_guest";
    setRecentSearches([]);
    localStorage.removeItem(searchesKey);
  };

  const handleSearch = async (e: React.FormEvent, searchQuery?: string) => {
    e?.preventDefault();
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setError("");
    try {
      const data = await searchPapers(finalQuery);
      setResults(data.results || []);
      setQuery(finalQuery);

      // Save to recent searches
      saveRecentSearch(finalQuery);

      // Save current results with minimal data
      const resultsKey = userId
        ? `previousResults_${userId}`
        : "previousResults_guest";

      try {
        // Store minimal data to save space
        const minimalResults = (data.results || [])
          .map((paper: any) => ({
            id: paper.id,
            title: paper.display_name?.substring(0, 100) || "Untitled",
            author: paper.authorships?.[0]?.author?.display_name || "Unknown",
            year: paper.publication_year,
          }))
          .slice(0, 20); // Store only first 20 results

        // Use sessionStorage to avoid localStorage quota issues
        sessionStorage.setItem(
          resultsKey,
          JSON.stringify({
            query: finalQuery,
            results: minimalResults,
            timestamp: Date.now(),
          })
        );
      } catch (storageError: any) {
        // If sessionStorage also fails, just continue without saving
        console.log("Could not save search results");
      }

      // Track search for gamification
      const searchesKey = userId ? `searches_${userId}` : "searches_guest";
      const currentSearches = parseInt(
        localStorage.getItem(searchesKey) || "0"
      );

      try {
        localStorage.setItem(searchesKey, String(currentSearches + 1));
      } catch (error) {
        // If can't save search count, just continue
        console.log("Could not save search count");
      }

      // Add XP for searching
      const newXP = addXP(5, userId);
      console.log(`+5 XP for searching. Total XP: ${newXP}`);

      // Sync to cloud after searching
      setTimeout(async () => {
        try {
          await syncToCloud();
          triggerDataChange();
          console.log("✅ Search activity synced to cloud");
        } catch (syncError) {
          console.error("❌ Failed to sync search activity:", syncError);
        }
      }, 500);

      // Trigger storage update for real-time sync
      window.dispatchEvent(new Event("storage"));
    } catch (err: any) {
      // Show user-friendly error
      if (err.message && err.message.includes("quota")) {
        setError(
          "Storage is getting full. We cleared some temporary data. Please try again."
        );
        clearTemporaryData();
      } else {
        setError(
          err.message ||
            "Failed to fetch results. Please check your connection."
        );
      }
    } finally {
      setLoading(false);
      setShowRecentSearches(false);
    }
  };

  const handleNavigate = (id: string) => {
    // Save minimal data to sessionStorage
    const resultsKey = userId
      ? `previousResults_${userId}`
      : "previousResults_guest";

    try {
      const minimalResults = results.slice(0, 10).map((paper: any) => ({
        id: paper.id,
        title: paper.display_name?.substring(0, 100) || "Untitled",
        author: paper.authorships?.[0]?.author?.display_name || "Unknown",
        year: paper.publication_year,
      }));

      sessionStorage.setItem(
        resultsKey,
        JSON.stringify({
          query: query,
          results: minimalResults,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.log("Could not save navigation data");
    }

    router.push(`/paper/${id}`);
  };

  const handleSave = async (paper: any) => {
    const userLibraryKey = getUserLibraryKey();
    const stored = localStorage.getItem(userLibraryKey);
    const existing = stored ? JSON.parse(stored) : [];

    if (existing.find((p: any) => p.id === paper.id)) {
      showToast("Already saved to your library!", "info");
      return;
    }

    const newItem = {
      id: paper.id,
      title: paper.display_name?.substring(0, 300) || "Untitled",
      author:
        paper.authorships
          ?.map((a: any) => a.author.display_name)
          .join(", ")
          .substring(0, 200) || "Unknown author",
      year: paper.publication_year || "N/A",
      journal: paper.host_venue?.display_name?.substring(0, 100) || "N/A",
      link:
        paper.primary_location?.source?.url ||
        paper.primary_location?.landing_page_url ||
        "",
      abstract: paper.abstract ? paper.abstract.substring(0, 500) : "",
      tags: paper.tags ? paper.tags.slice(0, 5) : [],
      savedAt: new Date().toISOString(),
    };

    const updated = [...existing, newItem];

    try {
      // Try to save to localStorage
      localStorage.setItem(userLibraryKey, JSON.stringify(updated));

      // Show success toast
      showToast(
        `✅ Paper saved to your ${user ? "personal" : "guest"} library! +10 XP`
      );

      // Add XP and check achievements with user ID
      const newXP = addXP(10, userId);
      console.log(`+10 XP for saving. Total XP: ${newXP}`);

      // Check saved papers achievements
      checkSavedAchievements(userId);

      // Sync to cloud after saving
      setTimeout(async () => {
        try {
          await syncToCloud();
          triggerDataChange();
          console.log("✅ Saved paper synced to cloud");
        } catch (syncError) {
          console.error("❌ Failed to sync saved paper:", syncError);
        }
      }, 500);

      // Force update achievements page
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("dataChanged"));
    } catch (error: any) {
      // Check if it's a quota error
      if (error.message && error.message.includes("quota")) {
        showToast(
          "⚠️ Storage is getting full! We cleared some temporary data. Please try saving again."
        );

        // Automatically clear temporary data
        clearTemporaryData();
      } else {
        // Other error
        showToast("❌ Could not save paper. Please try again.", "error");
      }
      console.error("Error saving paper:", error);
    }
  };

  const handleReadFullPaper = async (paper: any) => {
    const url =
      paper.primary_location?.landing_page_url ||
      paper.primary_location?.source?.url ||
      paper.open_access?.url_for_pdf ||
      null;

    if (url) {
      window.open(url, "_blank");

      // Add XP for reading with user ID
      const newXP = addXP(10, userId);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      // Track read count with user-specific key
      const readKey = userId ? `reads_${userId}` : "reads_guest";
      const readCount = parseInt(localStorage.getItem(readKey) || "0") + 1;

      try {
        localStorage.setItem(readKey, readCount.toString());
      } catch (error) {
        console.log("Could not save read count");
      }

      // Track detailed reading data for analytics
      trackReading(paper);

      // Sync to cloud after reading
      setTimeout(async () => {
        try {
          await syncToCloud();
          triggerDataChange();
          console.log("✅ Reading activity synced to cloud");
        } catch (syncError) {
          console.error("❌ Failed to sync reading activity:", syncError);
        }
      }, 500);

      // Force update achievements page
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("dataChanged"));
    } else {
      showToast("Full paper link not available for this item.", "info");
    }
  };

  // Track detailed reading data for analytics
  const trackReading = (paper: any) => {
    const readKey = userId ? `reads_${userId}` : "reads_guest";

    try {
      const existingData = localStorage.getItem(readKey);
      let readPapers: any[] = [];

      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          if (Array.isArray(parsed)) {
            readPapers = parsed;
          }
        } catch (error) {
          // If parsing fails, start with empty array
          console.log("Starting fresh reading tracking array");
        }
      }

      const readingRecord = {
        paperId: paper.id,
        title: paper.display_name?.substring(0, 100) || "Untitled",
        readAt: new Date().toISOString(),
      };

      // Keep only the last 100 reads
      const updatedReads = [readingRecord, ...readPapers.slice(0, 99)];

      // Try to save, but don't crash if storage is full
      try {
        localStorage.setItem(readKey, JSON.stringify(updatedReads));
        console.log(`📖 Reading tracked: ${paper.display_name}`);
      } catch (error) {
        console.log("Could not save reading data");
        // If storage is full, keep only the new record
        try {
          localStorage.setItem(readKey, JSON.stringify([readingRecord]));
        } catch (e) {
          // If still fails, give up
        }
      }
    } catch (error) {
      console.error("Error tracking reading:", error);
    }
  };

  // Filter results based on active filter
  const filteredResults = results.filter((paper) => {
    if (activeFilter === "recent") {
      return paper.publication_year >= 2020;
    } else if (activeFilter === "highly-cited") {
      return paper.cited_by_count > 100;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Toast Container */}
      <ToastContainer />

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
              <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
                <Brain className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Research Paper Search
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover academic papers. Search by topic or keywords.
            </p>
            {user && (
              <p className="text-sm text-[#49BBBD] mt-2 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Papers will be saved to your personal library • Earn XP for
                searching, saving, and reading!
              </p>
            )}
          </motion.header>

          {/* Search Form */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <div className="relative max-w-3xl mx-auto">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
                size={24}
              />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowRecentSearches(true)}
                placeholder="Search for research papers, topics or keywords..."
                className="w-full pl-12 pr-32 py-6 bg-card border-2 border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all duration-300 shadow-sm text-lg"
              />
              <Button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  "Search"
                )}
              </Button>
            </div>

            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <History size={16} />
                      Recent Searches
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-xs text-muted-foreground hover:text-red-600"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer group transition-all duration-200"
                        onClick={() =>
                          handleSearch(new Event("submit") as any, search)
                        }
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Clock size={16} className="text-muted-foreground" />
                          <span className="text-foreground group-hover:text-[#49BBBD] transition-colors">
                            {search}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => removeRecentSearch(search, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="text-center mt-4">
              <Badge
                variant="outline"
                className="bg-card/50 text-[#49DBBB] backdrop-blur-sm"
              >
                🔍 +5 XP for searching • 💾 +10 XP for saving • 📖 +10 XP for
                reading
              </Badge>
            </div>
          </motion.form>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <Alert variant="destructive">
                <AlertDescription className="text-center">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                  <div className="space-y-3 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
                <CardContent className="p-8">
                  <Search
                    className="mx-auto text-muted-foreground/30 mb-4"
                    size={48}
                  />
                  <CardTitle className="text-lg font-semibold text-foreground mb-2">
                    No results found
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    No papers found for{" "}
                    <span className="font-semibold">"{query}"</span>
                  </CardDescription>
                  <p className="text-muted-foreground text-sm mt-2">
                    Try different keywords or check your spelling
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white"
                    onClick={() => setQuery("")}
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Section */}
          {!loading && results.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Results Header with Filters */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        Search Results
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-[#49BBBD] text-white"
                        >
                          {filteredResults.length}
                        </Badge>
                      </h2>
                      <CardDescription>
                        Found {results.length} papers for "{query}"
                      </CardDescription>
                      {user && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                          >
                            Saving to {user.email}'s library
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <Tabs defaultValue="all" className="w-full lg:w-auto">
                      <TabsList className="bg-background/50 border border-border/50">
                        <TabsTrigger
                          value="all"
                          onClick={() => setActiveFilter("all")}
                        >
                          All Papers
                        </TabsTrigger>
                        <TabsTrigger
                          value="recent"
                          onClick={() => setActiveFilter("recent")}
                        >
                          Recent
                        </TabsTrigger>
                        <TabsTrigger
                          value="highly-cited"
                          onClick={() => setActiveFilter("highly-cited")}
                        >
                          Highly Cited
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Results Grid */}
              <div className="grid gap-6">
                {filteredResults.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card
                      className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#49BBBD]/30"
                      onClick={() => handleNavigate(item.id?.split("/").pop())}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Paper Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <CardTitle className="text-xl group-hover:text-[#49BBBD] transition-colors duration-300 pr-4">
                                {item.display_name}
                              </CardTitle>
                              {item.cited_by_count > 100 && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                                >
                                  Highly Cited
                                </Badge>
                              )}
                            </div>

                            {/* Authors */}
                            {item.authorships?.length > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <User
                                  size={16}
                                  className="text-muted-foreground"
                                />
                                <span className="text-muted-foreground text-sm">
                                  {item.authorships
                                    .map((a: any) => a.author.display_name)
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            {/* Journal and Year */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                              {item.host_venue?.display_name && (
                                <div className="flex items-center gap-1">
                                  <Building size={14} />
                                  <span>{item.host_venue.display_name}</span>
                                </div>
                              )}
                              {item.publication_year && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                >
                                  <Calendar size={12} className="mr-1" />
                                  {item.publication_year}
                                </Badge>
                              )}
                              {item.cited_by_count > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                >
                                  {item.cited_by_count} citations
                                </Badge>
                              )}
                            </div>

                            {/* Abstract Preview */}
                            {item.abstract && (
                              <CardDescription className="leading-relaxed line-clamp-2">
                                {item.abstract}
                              </CardDescription>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex lg:flex-col gap-2 lg:gap-3">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave(item);
                              }}
                              className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white shadow-sm hover:shadow-md"
                              size="sm"
                            >
                              <Save size={16} className="mr-2" />
                              Save +10 XP
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReadFullPaper(item);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-border hover:border-[#49BBBD] hover:bg-[#49BBBD]/5"
                            >
                              <BookOpen size={16} className="mr-2" />
                              Read +10 XP
                            </Button>
                          </div>
                        </div>

                        {/* View Details Arrow */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Click to view details
                          </span>
                          <ArrowRight
                            className="text-muted-foreground group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                            size={16}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
