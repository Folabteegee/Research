"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRecommendations } from "@/lib/api/openAlex";
import { addXP } from "@/lib/gamification";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Filter,
  BookOpen,
  Save,
  User,
  Calendar,
  Building,
  ArrowRight,
  TrendingUp,
  Target,
  RefreshCw,
  Star,
  Lightbulb,
} from "lucide-react";

interface RecommendationRequest {
  interests: string[];
  recentPapers: string[];
  preferredJournals: string[];
  yearsRange: [number, number];
  maxResults: number;
}

export default function RecommendationPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState("");
  const [filters, setFilters] = useState({
    yearsRange: [2018, 2024] as [number, number],
    maxResults: 10,
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const userId = user?.uid;

  // Get user's saved papers for personalization
  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = () => {
    if (!user) return;

    const userLibraryKey = `savedPapers_${user.uid}`;
    const stored = localStorage.getItem(userLibraryKey);
    const savedPapers = stored ? JSON.parse(stored) : [];

    // Extract interests from saved papers titles and abstracts
    const interests = extractInterestsFromPapers(savedPapers);
    setUserInterests(interests);

    // Set default interests if none found
    if (interests.length === 0) {
      setUserInterests(["machine learning", "artificial intelligence"]);
    }
  };

  const extractInterestsFromPapers = (papers: any[]): string[] => {
    const keywords = new Set<string>();
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "using",
      "based",
      "approach",
      "from",
      "this",
      "that",
      "which",
      "what",
      "how",
      "when",
      "where",
      "why",
      "are",
      "is",
      "was",
      "were",
      "have",
      "has",
      "had",
      "been",
      "being",
      "does",
      "do",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "shall",
    ]);

    papers.forEach((paper) => {
      // Simple keyword extraction from title
      const title = paper.title?.toLowerCase() || "";

      title.split(/\s+/).forEach((word: string) => {
        // Remove punctuation and filter meaningful words
        const cleanWord = word.replace(/[^\w]/g, "");
        if (cleanWord.length > 4 && !commonWords.has(cleanWord)) {
          keywords.add(cleanWord);
        }
      });
    });

    return Array.from(keywords).slice(0, 8); // Limit to 8 interests
  };

  const addInterest = () => {
    if (
      currentInterest.trim() &&
      !userInterests.includes(currentInterest.trim())
    ) {
      setUserInterests([...userInterests, currentInterest.trim()]);
      setCurrentInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setUserInterests(userInterests.filter((i) => i !== interest));
  };

  const generateRecommendations = async () => {
    if (userInterests.length === 0) {
      setError("Please add at least one research interest");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userLibraryKey = user
        ? `savedPapers_${user.uid}`
        : "savedPapers_guest";
      const stored = localStorage.getItem(userLibraryKey);
      const savedPapers = stored ? JSON.parse(stored) : [];

      const recommendationRequest: RecommendationRequest = {
        interests: userInterests,
        recentPapers: savedPapers.slice(0, 5).map((p: any) => p.title),
        preferredJournals: [],
        yearsRange: filters.yearsRange,
        maxResults: filters.maxResults,
      };

      console.log("Generating recommendations with:", recommendationRequest);
      const recommendations = await getRecommendations(recommendationRequest);

      if (recommendations.length === 0) {
        setError(
          "No recommendations found right now. This might be due to API limits. Try again in a moment or try different interests."
        );
        setRecommendations([]);
      } else {
        setRecommendations(recommendations);
        const newXP = addXP(15, userId);
        console.log(`+15 XP for AI recommendations. Total XP: ${newXP}`);
      }
    } catch (err: any) {
      console.error("Recommendation error:", err);
      setError(
        "Service temporarily unavailable. Please try again in a few moments."
      );
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (paper: any) => {
    const userLibraryKey = user
      ? `savedPapers_${user.uid}`
      : "savedPapers_guest";
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

    // Add XP for saving
    const newXP = addXP(10, userId);
    console.log(`+10 XP for saving. Total XP: ${newXP}`);
  };

  const handleNavigate = (id: string) => {
    router.push(`/paper/${id}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-900">
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
                <Sparkles className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI Research Recommendations
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized paper recommendations based on your interests and
              reading history
            </p>
            {user && (
              <p className="text-sm text-[#49BBBD]">
                Powered by AI • Earn 15 XP for generating recommendations
              </p>
            )}
          </motion.header>

          {/* Recommendation Configuration */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Interests Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target size={20} className="text-[#49BBBD]" />
                  Research Interests
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Add topics you're interested in. AI will find relevant papers.
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addInterest()}
                    placeholder="e.g., deep learning, neuroscience..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={addInterest}
                    className="bg-[#49BBBD] shadow-2xl text-white px-4 py-2 rounded-lg hover:bg-[#49BBBD]/60 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userInterests.map((interest, index) => (
                    <motion.span
                      key={interest}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#49BBBD]/30 text-[#49BBBD] px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="hover:text-green-300"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Filters Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter size={20} className="text-[#49BBBD]" />
                  Recommendation Filters
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Years: {filters.yearsRange[0]} -{" "}
                      {filters.yearsRange[1]}
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        value={filters.yearsRange[0]}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            yearsRange: [
                              parseInt(e.target.value),
                              filters.yearsRange[1],
                            ],
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={filters.yearsRange[1]}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            yearsRange: [
                              filters.yearsRange[0],
                              parseInt(e.target.value),
                            ],
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Recommendations: {filters.maxResults}
                    </label>
                    <select
                      value={filters.maxResults}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxResults: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 papers</option>
                      <option value={10}>10 papers</option>
                      <option value={15}>15 papers</option>
                      <option value={20}>20 papers</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateRecommendations}
                disabled={loading || userInterests.length === 0}
                className="bg-[#49BBBD] hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    Generating AI Recommendations...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} />
                    Generate AI Recommendations +15 XP
                  </div>
                )}
              </motion.button>
            </div>
          </motion.section>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <p className="text-red-600 text-center font-medium">{error}</p>
            </motion.div>
          )}

          {/* Recommendations Grid */}
          {recommendations.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" size={24} />
                  Personalized Recommendations
                  <span className="text-purple-500 ml-2">
                    ({recommendations.length})
                  </span>
                </h2>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">
                    Filtered for {filters.yearsRange[0]}-{filters.yearsRange[1]}
                  </p>
                  <p className="text-purple-500 text-xs mt-1">
                    Sorted by relevance to your interests
                  </p>
                </div>
              </div>

              {/* Year Filter Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-500" size={16} />
                    <span className="text-sm text-blue-700 font-medium">
                      Showing papers from {filters.yearsRange[0]} to{" "}
                      {filters.yearsRange[1]}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {
                      recommendations.filter(
                        (p) =>
                          p.publication_year >= filters.yearsRange[0] &&
                          p.publication_year <= filters.yearsRange[1]
                      ).length
                    }{" "}
                    papers in range
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {recommendations.map((item, index) => {
                  const isInYearRange =
                    item.publication_year &&
                    item.publication_year >= filters.yearsRange[0] &&
                    item.publication_year <= filters.yearsRange[1];

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer group relative ${
                        isInYearRange
                          ? "border-gray-200 shadow-sm hover:shadow-lg"
                          : "border-orange-200 bg-orange-50 shadow-sm"
                      }`}
                      onClick={() => handleNavigate(item.id?.split("/").pop())}
                    >
                      {/* AI Recommendation Badge */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Sparkles size={12} />
                        AI Recommended
                      </div>

                      {/* Year Range Indicator */}
                      {!isInYearRange && (
                        <div className="absolute -top-2 -left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Outside Year Range
                        </div>
                      )}

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Paper Info */}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-500 transition-colors duration-300 mb-3">
                            {item.display_name}
                          </h3>

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
                              <div
                                className={`flex items-center gap-1 ${
                                  isInYearRange
                                    ? "text-green-600 font-semibold"
                                    : "text-orange-600"
                                }`}
                              >
                                <Calendar size={14} />
                                <span>Published {item.publication_year}</span>
                                {!isInYearRange && (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full ml-1">
                                    Outside filter
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Abstract Preview */}
                          {item.abstract && (
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                              {item.abstract}
                            </p>
                          )}

                          {/* Relevance Score */}
                          {item.relevance_score && (
                            <div className="flex items-center gap-2 mt-3">
                              <TrendingUp
                                size={14}
                                className="text-green-500"
                              />
                              <span className="text-xs text-gray-500">
                                Relevance:{" "}
                                {(item.relevance_score * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-2 lg:gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(item);
                            }}
                            className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                          >
                            <Save size={16} />
                            Save +10 XP
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReadFullPaper(item);
                            }}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                          >
                            <BookOpen size={16} />
                            Read +10 XP
                          </motion.button>
                        </div>
                      </div>

                      {/* View Details Arrow */}
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Click to view detailed information
                        </span>
                        <ArrowRight
                          className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300"
                          size={16}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Empty State */}
          {!loading && recommendations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                <Sparkles className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get Personalized Recommendations
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your research interests above and let AI find the perfect
                  papers for you.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>✨ Based on your saved papers</p>
                  <p>🎯 Tailored to your interests</p>
                  <p>📚 Updated as you read more</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
