"use client";

import { useState } from "react";
import { searchPapers } from "@/lib/api/openAlex";
import { useRouter } from "next/navigation";
import { useZotero } from "@/context/ZoteroContext";
import { useAuth } from "@/context/AuthContext";
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
  const router = useRouter();
  const { library } = useZotero();
  const { user } = useAuth();

  // Get user ID for gamification
  const userId = user?.uid;

  // Get user-specific storage key
  const getUserLibraryKey = () => {
    return userId ? `savedPapers_${userId}` : "savedPapers_guest";
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      const data = await searchPapers(query);
      setResults(data.results || []);

      // Track search for gamification
      const searchesKey = userId ? `searches_${userId}` : "searches_guest";
      const currentSearches = parseInt(
        localStorage.getItem(searchesKey) || "0"
      );
      localStorage.setItem(searchesKey, String(currentSearches + 1));

      // Add XP for searching
      const newXP = addXP(5, userId);
      console.log(`+5 XP for searching. Total XP: ${newXP}`);

      // Trigger storage update for real-time sync
      window.dispatchEvent(new Event("storage"));
    } catch (err: any) {
      setError(
        err.message || "Failed to fetch results. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (id: string) => {
    router.push(`/paper/${id}`);
  };

  const handleSave = (paper: any) => {
    const userLibraryKey = getUserLibraryKey();
    const stored = localStorage.getItem(userLibraryKey);
    const existing = stored ? JSON.parse(stored) : [];

    if (existing.find((p: any) => p.id === paper.id)) {
      alert("Already saved to your library!");
      return;
    }

    const newItem = {
      id: paper.id,
      title: paper.display_name,
      author:
        paper.authorships?.map((a: any) => a.author.display_name).join(", ") ||
        "Unknown author",
      year: paper.publication_year || "N/A",
      journal: paper.host_venue?.display_name || "N/A",
      link:
        paper.primary_location?.source?.url ||
        paper.primary_location?.landing_page_url ||
        "",
    };

    const updated = [...existing, newItem];
    localStorage.setItem(userLibraryKey, JSON.stringify(updated));
    alert(`✅ Paper saved to your ${user ? "personal" : "guest"} library!`);

    // Add XP and check achievements with user ID
    const newXP = addXP(10, userId);
    console.log(`+10 XP for saving. Total XP: ${newXP}`);

    // Check saved papers achievements
    checkSavedAchievements(userId);

    // Force update achievements page
    window.dispatchEvent(new Event("storage"));
  };

  const handleReadFullPaper = (paper: any) => {
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
      localStorage.setItem(readKey, readCount.toString());

      // Track detailed reading data for analytics
      trackReading(paper);

      // Force update achievements page
      window.dispatchEvent(new Event("storage"));
    } else {
      alert("Full paper link not available for this item.");
    }
  };

  // Track detailed reading data for analytics
  const trackReading = (paper: any) => {
    const readKey = userId ? `reads_${userId}` : "reads_guest";

    try {
      // Try to get existing reading data
      const existingData = localStorage.getItem(readKey);
      let readPapers: any[] = [];

      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          if (Array.isArray(parsed)) {
            readPapers = parsed;
          }
          // If it's a number (old format), we'll start fresh with array
        } catch (error) {
          // If parsing fails, start with empty array
          console.log("Starting fresh reading tracking array");
        }
      }

      const readingRecord = {
        paperId: paper.id,
        title: paper.display_name,
        readAt: new Date().toISOString(),
        authors:
          paper.authorships
            ?.map((a: any) => a.author.display_name)
            .join(", ") || "Unknown author",
        journal: paper.host_venue?.display_name || "N/A",
        year: paper.publication_year || "N/A",
        url:
          paper.primary_location?.landing_page_url ||
          paper.primary_location?.source?.url ||
          "",
      };

      // Keep only the last 100 reads to prevent storage from growing too large
      const updatedReads = [readingRecord, ...readPapers.slice(0, 99)];
      localStorage.setItem(readKey, JSON.stringify(updatedReads));

      console.log(`📖 Reading tracked: ${paper.display_name}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 text-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#49BBBD_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-5"></div>
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Research Paper Search
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover academic papers using OpenAlex database. Search by topic,
              author, or keywords.
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
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                size={24}
              />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for research papers, authors, topics, or keywords..."
                className="w-full pl-12 pr-32 py-6 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all duration-300 shadow-sm text-lg"
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
            <div className="text-center mt-4">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
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
              <Card className="max-w-md mx-auto bg-white/70 backdrop-blur-sm border-gray-200/50">
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
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 max-w-md mx-auto">
                <CardContent className="p-8">
                  <Search className="mx-auto text-gray-300 mb-4" size={48} />
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    No results found
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    No papers found for{" "}
                    <span className="font-semibold">"{query}"</span>
                  </CardDescription>
                  <p className="text-gray-500 text-sm mt-2">
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
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">
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
                        <Badge
                          variant="outline"
                          className="mt-1 bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                        >
                          Saving to {user.email}'s library
                        </Badge>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <Tabs defaultValue="all" className="w-full lg:w-auto">
                      <TabsList className="bg-white/50 border border-gray-200/50">
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
                      className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#49BBBD]/30"
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
                                  className="bg-orange-50 text-orange-700 border-orange-200"
                                >
                                  Highly Cited
                                </Badge>
                              )}
                            </div>

                            {/* Authors */}
                            {item.authorships?.length > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <User size={16} className="text-gray-400" />
                                <span className="text-gray-600 text-sm">
                                  {item.authorships
                                    .map((a: any) => a.author.display_name)
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            {/* Journal and Year */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                              {item.host_venue?.display_name && (
                                <div className="flex items-center gap-1">
                                  <Building size={14} />
                                  <span>{item.host_venue.display_name}</span>
                                </div>
                              )}
                              {item.publication_year && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  <Calendar size={12} className="mr-1" />
                                  {item.publication_year}
                                </Badge>
                              )}
                              {item.cited_by_count > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
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
                              className="border-gray-300 hover:border-[#49BBBD] hover:bg-[#49BBBD]/5"
                            >
                              <BookOpen size={16} className="mr-2" />
                              Read +10 XP
                            </Button>
                          </div>
                        </div>

                        {/* View Details Arrow */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Click to view details
                          </span>
                          <ArrowRight
                            className="text-gray-400 group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
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
    </div>
  );
}
