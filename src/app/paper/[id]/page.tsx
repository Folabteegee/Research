"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { addXP } from "@/lib/gamification"; // 👈 XP import

export default function PaperDetail() {
  const { id } = useParams();
  const [paper, setPaper] = useState<any>(null);

  useEffect(() => {
    async function fetchPaper() {
      const res = await fetch(`https://api.openalex.org/works/${id}`);
      const data = await res.json();
      setPaper(data);

      // 🎯 reward XP when user opens paper details
      addXP(10);
    }
    fetchPaper();
  }, [id]);

  if (!paper) return <div className="flex justify-center p-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold mb-4">{paper.display_name}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {paper.abstract_inverted_index
          ? Object.keys(paper.abstract_inverted_index).join(" ")
          : "No abstract available."}
      </p>
      <div className="text-sm text-gray-500">
        <p>
          <strong>Authors:</strong>{" "}
          {paper.authorships?.map((a: any) => a.author.display_name).join(", ")}
        </p>
        <p>
          <strong>Published:</strong> {paper.publication_year}
        </p>
        <p>
          <strong>DOI:</strong> {paper.doi}
        </p>
      </div>
      <a
        href={paper.primary_location?.source?.url}
        target="_blank"
        className="inline-block mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
        onClick={() => addXP(10)} // 🎯 reward for reading full paper
      >
        Read Full Paper
      </a>
    </div>
  );
}
