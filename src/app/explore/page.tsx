"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/context/ApiContext";
import { useAuth } from "@/context/AuthContext";
import {
  addXP,
  unlockAchievement,
  checkSavedAchievements,
} from "@/lib/gamification";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Save,
  TrendingUp,
  Brain,
  User,
  Calendar,
  Building,
  ArrowRight,
} from "lucide-react";

export default function ExplorePage() {
  const { papers, fetchPapers } = useApi();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState("");

  // Get user ID for gamification
  const userId = user?.uid;

  const trendingTopics = [
    {
      name: "Artificial Intelligence",
      icon: "🤖",
      color: "from-purple-500 to-blue-500",
    },
    { name: "Climate Change", icon: "🌍", color: "from-green-500 to-teal-500" },
    { name: "Neuroscience", icon: "🧠", color: "from-pink-500 to-rose-500" },
    {
      name: "Renewable Energy",
      icon: "⚡",
      color: "from-yellow-500 to-orange-500",
    },
    { name: "Microbiology", icon: "🔬", color: "from-blue-500 to-cyan-500" },
    {
      name: "Quantum Computing",
      icon: "⚛️",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  // Get user-specific storage key
  const getUserLibraryKey = () => {
    return userId ? `savedPapers_${userId}` : "savedPapers_guest";
  };

  useEffect(() => {
    if (papers.length === 0) fetchTrendingPapers();
  }, []);

  const fetchTrendingPapers = async (topic?: string) => {
    setLoading(true);
    setActiveTopic(topic || "");
    try {
      const searchTopic =
        topic ||
        trendingTopics[Math.floor(Math.random() * trendingTopics.length)].name;
      await fetchPapers(searchTopic);

      // Track search for gamification
      const searchesKey = userId ? `searches_${userId}` : "searches_guest";
      const currentSearches = parseInt(
        localStorage.getItem(searchesKey) || "0"
      );
      localStorage.setItem(searchesKey, String(currentSearches + 1));

      // Add XP for exploring topics
      const newXP = addXP(5, userId);
      console.log(`+5 XP for exploring. Total XP: ${newXP}`);

      // Trigger storage update for real-time sync
      window.dispatchEvent(new Event("storage"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setActiveTopic("");
    try {
      await fetchPapers(search);

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
    } finally {
      setLoading(false);
    }
  };

  const handleReadFull = (paper: any) => {
    const openAccessUrl = paper.open_access?.url;
    const doiUrl = paper.doi ? `https://doi.org/${paper.doi}` : null;

    if (openAccessUrl) {
      window.open(openAccessUrl, "_blank");

      // Add XP for reading with user ID
      const newXP = addXP(10, userId);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      // Track read count with user-specific key
      const readKey = userId ? `reads_${userId}` : "reads_guest";
      const readCount = parseInt(localStorage.getItem(readKey) || "0") + 1;
      localStorage.setItem(readKey, readCount.toString());

      // Force update achievements page
      window.dispatchEvent(new Event("storage"));
    } else if (doiUrl) {
      window.open(doiUrl, "_blank");

      // Add XP for reading with user ID
      const newXP = addXP(10, userId);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      // Track read count with user-specific key
      const readKey = userId ? `reads_${userId}` : "reads_guest";
      const readCount = parseInt(localStorage.getItem(readKey) || "0") + 1;
      localStorage.setItem(readKey, readCount.toString());

      // Force update achievements page
      window.dispatchEvent(new Event("storage"));
    } else {
      alert(
        "❌ This paper is not freely available. Try using Zotero or your institution's library."
      );
    }
  };

  const handleSave = (paper: any) => {
    const userLibraryKey = getUserLibraryKey();
    const stored = localStorage.getItem(userLibraryKey);
    const current = stored ? JSON.parse(stored) : [];
    const exists = current.some((p: any) => p.id === paper.id);
    if (exists) return alert("Already saved to your library!");

    const newList = [
      ...current,
      {
        id: paper.id,
        title: paper.display_name,
        author:
          paper.authorships?.[0]?.author?.display_name || "Unknown Author",
        year: paper.publication_year || "N/A",
        journal: paper.host_venue?.display_name || "N/A",
        url: paper.open_access?.url || paper.doi,
      },
    ];
    localStorage.setItem(userLibraryKey, JSON.stringify(newList));

    // Add XP and check achievements with user ID
    const newXP = addXP(10, userId);
    console.log(`+10 XP for saving. Total XP: ${newXP}`);

    // Check saved papers achievements
    checkSavedAchievements(userId);

    alert(
      `✅ Paper saved to your ${
        user ? "personal" : "guest"
      } library! +10 XP earned!`
    );

    // Force update achievements page
    window.dispatchEvent(new Event("storage"));
  };

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
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
                <TrendingUp className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Research Trends
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover trending papers and explore cutting-edge research across
              various fields
            </p>
            {user && (
              <p className="text-sm text-[#49BBBD] mt-2">
                Papers will be saved to your personal library • Earn XP for
                exploring, saving, and reading!
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
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={24}
              />
              <input
                type="text"
                placeholder="Search for specific papers, authors, or research topics..."
                className="w-full pl-14 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all duration-300 shadow-sm text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                🔍 +5 XP for searching/exploring • 💾 +10 XP for saving • 📖 +10
                XP for reading
              </p>
            </div>
          </motion.form>

          {/* Trending Topics */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Trending Research Topics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingTopics.map((topic, index) => (
                <motion.button
                  key={topic.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchTrendingPapers(topic.name)}
                  className={`bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 text-center group ${
                    activeTopic === topic.name ? "ring-2 ring-[#49BBBD]" : ""
                  }`}
                >
                  <div className="text-2xl mb-2">{topic.icon}</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#49BBBD] transition-colors duration-300">
                    {topic.name}
                  </span>
                  <div className="mt-2 text-xs text-[#49BBBD] font-medium">
                    +5 XP
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Active Topic Indicator */}
          {activeTopic && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6"
            >
              <span className="bg-[#49BBBD] text-white px-4 py-2 rounded-full text-sm font-medium">
                Showing results for: {activeTopic} • +5 XP earned!
              </span>
            </motion.div>
          )}

          {/* User Library Info */}
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6"
            >
              <span className="bg-[#49BBBD]/10 text-[#49BBBD] px-4 py-2 rounded-full text-sm font-medium">
                Saving to {user.email}'s personal library • Earn XP for actions!
              </span>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center gap-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-6 h-6 border-2 border-[#49BBBD] border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600 font-medium">
                  Exploring research papers...
                </span>
              </div>
            </motion.div>
          )}

          {/* Results Grid */}
          {!loading && papers.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Research Papers
                  <span className="text-[#49BBBD] ml-2">({papers.length})</span>
                </h2>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">
                    {activeTopic
                      ? `Trending in ${activeTopic}`
                      : "Explore research papers"}
                  </p>
                  <p className="text-[#49BBBD] text-xs mt-1">
                    Earn XP for reading and saving!
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                {papers.map((paper: any, index: number) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Paper Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#49BBBD] transition-colors duration-300 mb-3">
                          {paper.display_name}
                        </h3>

                        {/* Authors */}
                        {paper.authorships?.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <User size={16} className="text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              {paper.authorships
                                .map((a: any) => a.author.display_name)
                                .join(", ")}
                            </span>
                          </div>
                        )}

                        {/* Journal and Year */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                          {paper.host_venue?.display_name && (
                            <div className="flex items-center gap-1">
                              <Building size={14} />
                              <span>{paper.host_venue.display_name}</span>
                            </div>
                          )}
                          {paper.publication_year && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Published {paper.publication_year}</span>
                            </div>
                          )}
                        </div>

                        {/* Abstract Preview */}
                        {paper.abstract && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {paper.abstract}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex lg:flex-col gap-2 lg:gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadFull(paper);
                          }}
                          className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                        >
                          <BookOpen size={16} />
                          Read +10 XP
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(paper);
                          }}
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                        >
                          <Save size={16} />
                          Save +10 XP
                        </motion.button>
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
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty State */}
          {!loading && papers.length === 0 && search && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                <Search className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No papers found
                </h3>
                <p className="text-gray-600">
                  Try searching for a different topic or explore trending
                  research areas above.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
