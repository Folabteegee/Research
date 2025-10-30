"use client";
import { useEffect, useState } from "react";

export default function LibraryPage() {
  const [savedPapers, setSavedPapers] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("savedPapers");
    if (stored) setSavedPapers(JSON.parse(stored));
  }, []);

  const handleReadFullPaper = (paper: any) => {
    if (paper.link) {
      window.open(paper.link, "_blank");
    } else {
      alert("Full paper link not available for this item.");
    }
  };

  const handleRemove = (id: string) => {
    const updated = savedPapers.filter((paper) => paper.id !== id);
    setSavedPapers(updated);
    localStorage.setItem("savedPapers", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">
        📚 Your Library
      </h1>

      {savedPapers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No saved papers yet. Explore and save one!
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                {paper.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {paper.author}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {paper.journal ? `${paper.journal} • ` : ""}
                {paper.year ? `Published: ${paper.year}` : ""}
              </p>

              <div className="mt-4">
                <button
                  onClick={() => handleReadFullPaper(paper)}
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition"
                >
                  Read Full Paper
                </button>
                <button
                  onClick={() => handleRemove(paper.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition"
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
