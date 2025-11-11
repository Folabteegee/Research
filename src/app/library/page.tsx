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
  Filter,
  Download,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LibraryPage() {
  const { user } = useAuth();
  const [savedPapers, setSavedPapers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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

  const handleExportLibrary = () => {
    const dataStr = JSON.stringify(savedPapers, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `research-library-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  // Filter and search papers
  const filteredPapers = savedPapers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.journal.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "recent") {
      const currentYear = new Date().getFullYear();
      return matchesSearch && paper.year >= currentYear - 2;
    } else if (activeFilter === "oldest") {
      return matchesSearch && paper.year < 2020;
    }
    return matchesSearch;
  });

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-[#49BBBD]">
                  <AvatarImage src={user?.photoURL || ""} />
                  <AvatarFallback className="bg-[#49BBBD] text-white text-lg font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      My Research Library
                    </h1>
                    <Badge
                      variant="secondary"
                      className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {savedPapers.length} items
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Your personal collection of saved research papers
                  </p>
                  {user && (
                    <p className="text-sm text-gray-500 mt-1">
                      Personal library for {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button asChild className="bg-[#49BBBD] hover:bg-[#3aa8a9]">
                  <Link href="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Find More Papers
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportLibrary}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Library
                    </DropdownMenuItem>
                    {savedPapers.length > 0 && (
                      <DropdownMenuItem
                        onClick={handleRemoveAll}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.header>

          {/* Search and Filter Bar */}
          {savedPapers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    <div className="flex-1 w-full">
                      <Input
                        placeholder="Search your library by title, author, or journal..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/50 border-gray-200"
                      />
                    </div>

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
                          value="oldest"
                          onClick={() => setActiveFilter("oldest")}
                        >
                          Classic
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Badge variant="outline" className="bg-white/50">
                      {filteredPapers.length} of {savedPapers.length} papers
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {savedPapers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 max-w-md mx-auto">
                <CardContent className="p-8">
                  <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
                  <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">
                    Your Library is Empty
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-6">
                    Start building your personal research collection by saving
                    papers from search results.
                  </CardDescription>
                  <Button asChild className="bg-[#49BBBD] hover:bg-[#3aa8a9]">
                    <Link href="/search">
                      <Search className="mr-2 h-4 w-4" />
                      Explore Papers
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Search Results Alert */}
          {savedPapers.length > 0 &&
            searchQuery &&
            filteredPapers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <Alert>
                  <AlertDescription>
                    No papers found matching "{searchQuery}". Try different
                    search terms.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

          {/* Papers Grid */}
          {filteredPapers.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#49BBBD]/30 h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Paper Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-[#49BBBD]/10 p-2 rounded-xl">
                          <FileText className="text-[#49BBBD]" size={20} />
                        </div>
                        <div className="flex items-center gap-2">
                          {paper.year && paper.year >= 2020 && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              Recent
                            </Badge>
                          )}
                          <ArrowRight
                            className="text-gray-400 group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                            size={16}
                          />
                        </div>
                      </div>

                      {/* Paper Title */}
                      <CardTitle className="text-lg mb-3 line-clamp-2 group-hover:text-[#49BBBD] transition-colors duration-300 flex-1">
                        {paper.title}
                      </CardTitle>

                      {/* Paper Metadata */}
                      <div className="space-y-2 mb-4 flex-1">
                        {paper.author && paper.author !== "Unknown author" && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={14} />
                            <span className="line-clamp-1">{paper.author}</span>
                          </div>
                        )}

                        {paper.journal && paper.journal !== "N/A" && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building size={14} />
                            <span className="line-clamp-1">
                              {paper.journal}
                            </span>
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
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadFullPaper(paper);
                          }}
                          className="flex-1 bg-[#49BBBD] hover:bg-[#3aa8a9]"
                          size="sm"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Read
                        </Button>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(paper.id);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
