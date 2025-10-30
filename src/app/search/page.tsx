"use client";

import { useState } from "react";
import { searchPapers } from "@/lib/api/openAlex";
import { useRouter } from "next/navigation";
import { useZotero } from "@/context/ZoteroContext";
import { addXP, unlockAchievement } from "@/lib/gamification"; // ✅ import gamification

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

  // ✅ When user saves a paper, add XP & track achievements
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

    // 🏆 Add XP for saving
    const newXP = addXP(10);
    console.log(`+10 XP for saving. Total XP: ${newXP}`);

    // 🏅 Unlock achievements
    const saveCount = updated.length;
    if (saveCount >= 1) unlockAchievement("first-read"); // first action
    if (saveCount >= 5) unlockAchievement("five-saved");
  };

  // ✅ When user reads a full paper, add XP & track achievements
  const handleReadFullPaper = (paper: any) => {
    const url =
      paper.primary_location?.landing_page_url ||
      paper.primary_location?.source?.url ||
      paper.open_access?.url_for_pdf ||
      null;

    if (url) {
      window.open(url, "_blank");

      // 🏆 Add XP for reading
      const newXP = addXP(10);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      // Track number of reads
      const readCount = parseInt(localStorage.getItem("readCount") || "0") + 1;
      localStorage.setItem("readCount", readCount.toString());

      // 🏅 Unlock achievements
      if (readCount >= 1) unlockAchievement("first-read");
      if (readCount >= 10) unlockAchievement("ten-read");
    } else {
      alert("Full paper link not available for this item.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-indigo-600 dark:text-indigo-400">
          Search Research Papers
        </h1>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-10"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search OpenAlex for topics, papers, or authors..."
            className="flex-1 px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p className="text-center text-red-500 mb-6 font-medium">{error}</p>
        )}

        <section className="space-y-4">
          {loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
              Fetching papers from OpenAlex...
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No results found for{" "}
              <span className="font-semibold">"{query}"</span>
            </p>
          )}

          {!loading &&
            results.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <h2
                  onClick={() => handleNavigate(item.id?.split("/").pop())}
                  className="text-lg font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-indigo-500"
                >
                  {item.display_name}
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.authorships
                    ?.map((a: any) => a.author.display_name)
                    .join(", ") || "Unknown authors"}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {item.host_venue?.display_name
                    ? `${item.host_venue.display_name} • `
                    : ""}
                  {item.publication_year
                    ? `Published: ${item.publication_year}`
                    : ""}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleSave(item)}
                    className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    💾 Save to Zotero
                  </button>
                  <button
                    onClick={() => handleReadFullPaper(item)}
                    className="text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                  >
                    📖 Read Full Paper
                  </button>
                </div>
              </div>
            ))}
        </section>
      </div>
    </main>
  );
}
