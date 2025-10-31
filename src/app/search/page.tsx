"use client";

import { useState } from "react";
import { searchPapers } from "@/lib/api/openAlex";
import { useRouter } from "next/navigation";
import { useZotero } from "@/context/ZoteroContext";
import { addXP, unlockAchievement } from "@/lib/gamification";
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
} from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { library } = useZotero();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      const data = await searchPapers(query);
      setResults(data.results || []);
    } catch (err) {
      setError("Failed to fetch results. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (id: string) => {
    router.push(`/paper/${id}`);
  };

  const handleSave = (paper: any) => {
    const stored = localStorage.getItem("savedPapers");
    const existing = stored ? JSON.parse(stored) : [];

    if (existing.find((p: any) => p.id === paper.id)) {
      alert("Already saved to library!");
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
    localStorage.setItem("savedPapers", JSON.stringify(updated));
    alert("✅ Paper saved to your Zotero library!");

    const newXP = addXP(10);
    console.log(`+10 XP for saving. Total XP: ${newXP}`);

    const saveCount = updated.length;
    if (saveCount >= 1) unlockAchievement("first-read");
    if (saveCount >= 5) unlockAchievement("five-saved");
  };

  const handleReadFullPaper = (paper: any) => {
    const url =
      paper.primary_location?.landing_page_url ||
      paper.primary_location?.source?.url ||
      paper.open_access?.url_for_pdf ||
      null;

    if (url) {
      window.open(url, "_blank");

      const newXP = addXP(10);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      const readCount = parseInt(localStorage.getItem("readCount") || "0") + 1;
      localStorage.setItem("readCount", readCount.toString());

      if (readCount >= 1) unlockAchievement("first-read");
      if (readCount >= 10) unlockAchievement("ten-read");
    } else {
      alert("Full paper link not available for this item.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for research papers, authors, topics, or keywords..."
                className="w-full pl-14 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all duration-300 shadow-sm text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </motion.form>

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
                  Searching OpenAlex database...
                </span>
              </div>
            </motion.div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                <Search className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  No papers found for{" "}
                  <span className="font-semibold">"{query}"</span>
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try different keywords or check your spelling
                </p>
              </div>
            </motion.div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Search Results
                  <span className="text-[#49BBBD] ml-2">
                    ({results.length})
                  </span>
                </h2>
                <p className="text-gray-600 text-sm">
                  Found {results.length} papers for "{query}"
                </p>
              </div>

              <div className="grid gap-6">
                {results.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleNavigate(item.id?.split("/").pop())}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Paper Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#49BBBD] transition-colors duration-300 mb-3">
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
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Published {item.publication_year}</span>
                            </div>
                          )}
                        </div>

                        {/* Abstract Preview */}
                        {item.abstract && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {item.abstract}
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
                            handleSave(item);
                          }}
                          className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
                        >
                          <Save size={16} />
                          Save
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
                          Read
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
        </div>
      </div>
    </div>
  );
}
