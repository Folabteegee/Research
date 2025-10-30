"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/context/ApiContext";
import { addXP } from "@/lib/gamification"; // 👈 import XP system

export default function ExplorePage() {
  const { papers, fetchPapers, quote, fetchQuote } = useApi();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const trendingTopics = [
    "Artificial Intelligence",
    "Climate Change",
    "Neuroscience",
    "Renewable Energy",
    "Microbiology",
  ];

  useEffect(() => {
    fetchQuote();
    if (papers.length === 0) fetchTrendingPapers();
  }, []);

  const fetchTrendingPapers = async () => {
    setLoading(true);
    try {
      await fetchPapers(
        trendingTopics[Math.floor(Math.random() * trendingTopics.length)]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    try {
      await fetchPapers(search);
    } finally {
      setLoading(false);
    }
  };

  // ✅ READ FULL PAPER HANDLER with XP reward
  const handleReadFull = (paper: any) => {
    const openAccessUrl = paper.open_access?.url;
    const doiUrl = paper.doi ? `https://doi.org/${paper.doi}` : null;

    if (openAccessUrl) {
      window.open(openAccessUrl, "_blank");
      addXP(10); // 🎯 reward +10 XP for reading
    } else if (doiUrl) {
      window.open(doiUrl, "_blank");
      addXP(10); // 🎯 reward +10 XP for reading
    } else {
      alert(
        "❌ This paper is not freely available. Try using Zotero or your institution’s library."
      );
    }
  };

  // ✅ SAVE PAPER HANDLER with XP reward
  const handleSave = (paper: any) => {
    const stored = localStorage.getItem("savedPapers");
    const current = stored ? JSON.parse(stored) : [];
    const exists = current.some((p: any) => p.id === paper.id);
    if (exists) return alert("Already saved!");

    const newList = [
      ...current,
      {
        id: paper.id,
        title: paper.display_name,
        author:
          paper.authorships?.[0]?.author?.display_name || "Unknown Author",
        url: paper.open_access?.url || paper.doi,
      },
    ];
    localStorage.setItem("savedPapers", JSON.stringify(newList));

    addXP(10); // 🎯 reward +10 XP for saving
    alert("✅ Paper saved to library! +10 XP earned!");
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">
        🔍 Explore Research
      </h1>

      <form onSubmit={handleSearch} className="flex mb-6">
        <input
          type="text"
          placeholder="Search papers, authors, or topics..."
          className="flex-grow px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </form>

      {quote && (
        <p className="italic text-gray-600 mb-8 bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl shadow-sm">
          {quote}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper: any) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                {paper.display_name}
              </h3>
              <p className="text-sm text-gray-600">
                {paper.authorships?.[0]?.author?.display_name ||
                  "Unknown Author"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Published: {paper.publication_year || "N/A"}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleReadFull(paper)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded-lg transition"
                >
                  📖 Read Full Paper
                </button>
                <button
                  onClick={() => handleSave(paper)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded-lg transition"
                >
                  💾 Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
