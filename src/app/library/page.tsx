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
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/navbar";
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
  const { syncToCloud, syncFromCloud, isSyncing, lastSynced } = useSync();
  const [savedPapers, setSavedPapers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  // Get user-specific storage key
  const getUserLibraryKey = () => {
    return user ? `savedPapers_${user.uid}` : "savedPapers_guest";
  };

  // Load papers with sync awareness - FIXED: Added cloud sync integration
  useEffect(() => {
    const loadPapers = () => {
      if (user) {
        const userLibraryKey = getUserLibraryKey();
        const stored = localStorage.getItem(userLibraryKey);
        if (stored) {
          try {
            const papers = JSON.parse(stored);
            setSavedPapers(Array.isArray(papers) ? papers : []);
          } catch (error) {
            console.error("Error parsing saved papers:", error);
            setSavedPapers([]);
          }
        } else {
          setSavedPapers([]);
        }
      }
    };

    loadPapers();

    // Listen for storage changes and cloud data updates
    const handleStorageChange = () => {
      loadPapers();
    };

    const handleCloudDataApplied = () => {
      console.log("🔄 Cloud data applied, reloading library");
      loadPapers();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cloudDataApplied", handleCloudDataApplied);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cloudDataApplied", handleCloudDataApplied);
    };
  }, [user]);

  // Update sync status - FIXED: Better sync status tracking
  useEffect(() => {
    if (isSyncing) {
      setSyncStatus("syncing");
    } else if (syncStatus === "syncing") {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  }, [isSyncing, syncStatus]);

  const handleReadFullPaper = (paper: any) => {
    if (paper.link) {
      window.open(paper.link, "_blank");
    } else {
      alert("Full paper link not available for this item.");
    }
  };

  const handleRemove = async (id: string) => {
    const updated = savedPapers.filter((paper) => paper.id !== id);
    setSavedPapers(updated);
    const userLibraryKey = getUserLibraryKey();
    localStorage.setItem(userLibraryKey, JSON.stringify(updated));

    // Sync after removal - FIXED: Better error handling
    setTimeout(async () => {
      try {
        await syncToCloud();
        window.dispatchEvent(new Event("dataChanged"));
        console.log("✅ Paper removal synced to cloud");
      } catch (error) {
        console.error("❌ Failed to sync paper removal:", error);
      }
    }, 500);
  };

  const handleRemoveAll = async () => {
    if (
      confirm("Are you sure you want to remove all papers from your library?")
    ) {
      setSavedPapers([]);
      const userLibraryKey = getUserLibraryKey();
      localStorage.removeItem(userLibraryKey);

      // Sync after clearing - FIXED: Better error handling
      setTimeout(async () => {
        try {
          await syncToCloud();
          window.dispatchEvent(new Event("dataChanged"));
          console.log("✅ Library clearance synced to cloud");
        } catch (error) {
          console.error("❌ Failed to sync library clearance:", error);
        }
      }, 500);
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

  // Enhanced sync functions - FIXED: Better sync handling
  const enhancedSyncToCloud = async () => {
    setSyncStatus("syncing");
    try {
      await syncToCloud();
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const enhancedSyncFromCloud = async () => {
    setSyncStatus("syncing");
    try {
      await syncFromCloud();
      // Papers will be reloaded via the event listeners
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
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

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case "syncing":
        return "Syncing...";
      case "success":
        return "Synced!";
      case "error":
        return "Sync failed";
      default:
        return lastSynced
          ? `Synced ${new Date(lastSynced).toLocaleTimeString()}`
          : "Ready to sync";
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "success":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "error":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
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
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
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
                  <p className="text-muted-foreground mt-1">
                    Your personal collection of saved research papers
                  </p>
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
                        className="text-red-600 dark:text-red-400"
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
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    <div className="flex-1 w-full">
                      <Input
                        placeholder="Search your library by title, author, or journal..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-background/50 border-border"
                      />
                    </div>

                    <Tabs defaultValue="all" className="w-full lg:w-auto">
                      <TabsList className="bg-background/50 border border-border/50">
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

                    <Badge variant="outline" className="bg-background/50">
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
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
                <CardContent className="p-8">
                  <BookOpen
                    className="mx-auto text-muted-foreground/30 mb-4"
                    size={64}
                  />
                  <CardTitle className="text-2xl font-semibold text-foreground mb-2">
                    Your Library is Empty
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-6">
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
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#49BBBD]/30 h-full">
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
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs"
                            >
                              Recent
                            </Badge>
                          )}
                          <ArrowRight
                            className="text-muted-foreground group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User size={14} />
                            <span className="line-clamp-1">{paper.author}</span>
                          </div>
                        )}

                        {paper.journal && paper.journal !== "N/A" && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building size={14} />
                            <span className="line-clamp-1">
                              {paper.journal}
                            </span>
                          </div>
                        )}

                        {paper.year && paper.year !== "N/A" && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={14} />
                            <span>Published {paper.year}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-border">
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
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
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
      <BottomNav />
    </div>
  );
}
