"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { addXP } from "@/lib/gamification";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Link as LinkIcon,
  FileText,
  ArrowLeft,
  Building,
  Download,
  Brain,
} from "lucide-react";
import Link from "next/link";

export default function PaperDetail() {
  const { id } = useParams();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaper() {
      setLoading(true);
      try {
        const res = await fetch(`https://api.openalex.org/works/${id}`);
        const data = await res.json();
        setPaper(data);
        addXP(10); // 🎯 reward XP when user opens paper details
      } catch (error) {
        console.error("Error fetching paper:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPaper();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="w-8 h-8 border-2 border-[#49BBBD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading paper details...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Paper Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested paper could not be loaded.
          </p>
          <Link href="/search">
            <button className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white px-6 py-2 rounded-xl transition-all duration-300">
              Back to Search
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const abstractText = paper.abstract_inverted_index
    ? Object.keys(paper.abstract_inverted_index).join(" ")
    : "No abstract available.";

  const fullTextUrl =
    paper.primary_location?.source?.url ||
    paper.primary_location?.landing_page_url ||
    paper.open_access?.url_for_pdf;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#49BBBD_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-5"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/search">
              <button className="flex items-center gap-2 text-gray-600 hover:text-[#49BBBD] transition-colors duration-300 group">
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform duration-300"
                />
                Back to Search
              </button>
            </Link>
          </motion.div>

          {/* Paper Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
          >
            {/* Header with Icon */}
            <div className="bg-gradient-to-r from-[#49BBBD] to-[#3aa8a9] p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <FileText size={24} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                  {paper.display_name}
                </h1>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-white/90">
                {paper.publication_year && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Published {paper.publication_year}</span>
                  </div>
                )}
                {paper.cited_by_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Brain size={16} />
                    <span>{paper.cited_by_count} citations</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Authors */}
              {paper.authorships?.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <User size={20} className="text-[#49BBBD]" />
                    Authors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {paper.authorships.map((authorship: any, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {authorship.author.display_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Publication Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paper.host_venue?.display_name && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                      <Building size={20} className="text-[#49BBBD]" />
                      Journal
                    </h3>
                    <p className="text-gray-600">
                      {paper.host_venue.display_name}
                    </p>
                  </div>
                )}

                {paper.doi && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                      <LinkIcon size={20} className="text-[#49BBBD]" />
                      DOI
                    </h3>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#49BBBD] hover:text-[#3aa8a9] transition-colors duration-300 break-all"
                    >
                      {paper.doi}
                    </a>
                  </div>
                )}
              </div>

              {/* Abstract */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Abstract
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {abstractText}
                  </p>
                </div>
              </div>

              {/* Keywords */}
              {paper.keywords && paper.keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map((keyword: any, index: number) => (
                      <span
                        key={index}
                        className="bg-[#49BBBD]/10 text-[#49BBBD] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {keyword.display_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {fullTextUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={fullTextUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => addXP(10)} // 🎯 reward for reading full paper
                    className="flex items-center justify-center gap-2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex-1"
                  >
                    <Download size={20} />
                    Read Full Paper
                  </motion.a>
                )}

                <Link href="/search">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex-1"
                  >
                    <FileText size={20} />
                    Find Similar Papers
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* XP Notification */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-[#49BBBD]/10 border border-[#49BBBD]/20 rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[#49BBBD] font-medium">
              <Brain size={20} />
              <span>+10 XP for viewing paper details!</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
