"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Trash2,
  Search,
  FileText,
  User,
  Calendar,
  Building,
  ArrowRight,
  Brain,
  Library,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LibraryPage() {
  const { user } = useAuth();
  const [savedPapers, setSavedPapers] = useState<any[]>([]);

  // Get user-specific storage key
  const getUserLibraryKey = () => {
    return user ? `savedPapers_${user.uid}` : "savedPapers_guest";
  };

  useEffect(() => {
    if (user) {
      const userLibraryKey = getUserLibraryKey();
      const stored = localStorage.getItem(userLibraryKey);
      if (stored) {
        setSavedPapers(JSON.parse(stored));
      } else {
        setSavedPapers([]);
      }
    }
  }, [user]);

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
    const userLibraryKey = getUserLibraryKey();
    localStorage.setItem(userLibraryKey, JSON.stringify(updated));
  };

  const handleRemoveAll = () => {
    if (
      confirm("Are you sure you want to remove all papers from your library?")
    ) {
      setSavedPapers([]);
      const userLibraryKey = getUserLibraryKey();
      localStorage.removeItem(userLibraryKey);
    }
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
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg"
                >
                  <Library className="text-white" size={32} />
                </motion.div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    My Research Library
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {savedPapers.length} saved paper
                    {savedPapers.length !== 1 ? "s" : ""}
                  </p>
                  {user && (
                    <p className="text-sm text-gray-500 mt-1">
                      Personal library for {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/search">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white px-4 py-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Search size={20} />
                    Find More Papers
                  </motion.button>
                </Link>

                {savedPapers.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemoveAll}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Trash2 size={20} />
                    Clear All
                  </motion.button>
                )}
              </div>
            </div>
          </motion.header>

          {/* Empty State */}
          {savedPapers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Your Library is Empty
                </h2>
                <p className="text-gray-600 mb-6">
                  Start building your personal research collection by saving
                  papers from search results.
                </p>
                <Link href="/search">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Search className="inline mr-2" size={20} />
                    Explore Papers
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Papers Grid */}
          {savedPapers.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {savedPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-6">
                    {/* Paper Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-[#49BBBD]/10 p-2 rounded-xl">
                        <FileText className="text-[#49BBBD]" size={20} />
                      </div>
                      <ArrowRight
                        className="text-gray-400 group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                        size={16}
                      />
                    </div>

                    {/* Paper Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#49BBBD] transition-colors duration-300">
                      {paper.title}
                    </h3>

                    {/* Paper Metadata */}
                    <div className="space-y-2 mb-4">
                      {paper.author && paper.author !== "Unknown author" && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={14} />
                          <span className="line-clamp-1">{paper.author}</span>
                        </div>
                      )}

                      {paper.journal && paper.journal !== "N/A" && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building size={14} />
                          <span className="line-clamp-1">{paper.journal}</span>
                        </div>
                      )}

                      {paper.year && paper.year !== "N/A" && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>Published {paper.year}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadFullPaper(paper);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white py-2 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        <BookOpen size={16} />
                        Read
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(paper.id);
                        }}
                        className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md w-10"
                        title="Remove from library"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
