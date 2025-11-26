"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { getRecommendations } from "@/lib/api/openAlex";
import { addXP } from "@/lib/gamification";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/navbar";
import {
  Brain,
  Sparkles,
  Filter,
  BookOpen,
  Save,
  User,
  Calendar,
  Building,
  ArrowRight,
  TrendingUp,
  Target,
  RefreshCw,
  Star,
  Lightbulb,
  Plus,
  X,
  Cloud,
  CloudOff,
} from "lucide-react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecommendationRequest {
  interests: string[];
  recentPapers: string[];
  preferredJournals: string[];
  yearsRange: [number, number];
  maxResults: number;
}

export default function RecommendationPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState("");
  const [filters, setFilters] = useState({
    yearsRange: [2018, 2024] as [number, number],
    maxResults: 10,
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("interests");
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const { user } = useAuth();
  const {
    syncToCloud,
    syncFromCloud,
    isSyncing,
    lastSynced,
    syncError,
    triggerDataChange,
  } = useSync();

  const userId = user?.uid;

  // Enhanced sync functions - FIXED: Better error handling
  const enhancedSyncToCloud = async () => {
    setSyncStatus("syncing");
    try {
      const success = await syncToCloud();
      if (success) {
        setSyncStatus("success");
      } else {
        setSyncStatus("error");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const enhancedSyncFromCloud = async () => {
    setSyncStatus("syncing");
    try {
      const success = await syncFromCloud();
      if (success) {
        setSyncStatus("success");
        loadUserPreferences(); // Reload preferences after sync
      } else {
        setSyncStatus("error");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  // Update sync status based on isSyncing - FIXED: Better status tracking
  useEffect(() => {
    if (isSyncing) {
      setSyncStatus("syncing");
    } else if (syncStatus === "syncing") {
      if (syncError) {
        setSyncStatus("error");
      } else {
        setSyncStatus("success");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    }
  }, [isSyncing, syncStatus, syncError]);

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case "syncing":
        return "Syncing...";
      case "success":
        return "Synced!";
      case "error":
        return syncError || "Sync failed";
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

  const getSyncIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-3 h-3 mr-1 animate-spin" />;
      case "success":
        return <Cloud className="w-3 h-3 mr-1" />;
      case "error":
        return <CloudOff className="w-3 h-3 mr-1" />;
      default:
        return <Cloud className="w-3 h-3 mr-1" />;
    }
  };

  // Get user's saved papers for personalization - FIXED: Added sync awareness
  useEffect(() => {
    loadUserPreferences();

    // Listen for cloud data updates
    const handleCloudDataApplied = () => {
      console.log("🔄 Cloud data applied, reloading user preferences");
      loadUserPreferences();
    };

    window.addEventListener("cloudDataApplied", handleCloudDataApplied);

    return () => {
      window.removeEventListener("cloudDataApplied", handleCloudDataApplied);
    };
  }, [user]);

  const loadUserPreferences = () => {
    if (!user) return;

    const userLibraryKey = `savedPapers_${user.uid}`;
    const stored = localStorage.getItem(userLibraryKey);
    const savedPapers = stored ? JSON.parse(stored) : [];

    // Extract interests from saved papers titles and abstracts
    const interests = extractInterestsFromPapers(savedPapers);
    setUserInterests(interests);

    // Set default interests if none found
    if (interests.length === 0) {
      setUserInterests(["machine learning", "artificial intelligence"]);
    }
  };

  const extractInterestsFromPapers = (papers: any[]): string[] => {
    const keywords = new Set<string>();
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "using",
      "based",
      "approach",
      "from",
      "this",
      "that",
      "which",
      "what",
      "how",
      "when",
      "where",
      "why",
      "are",
      "is",
      "was",
      "were",
      "have",
      "has",
      "had",
      "been",
      "being",
      "does",
      "do",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "shall",
    ]);

    papers.forEach((paper) => {
      // Simple keyword extraction from title
      const title = paper.title?.toLowerCase() || "";
      title.split(/\s+/).forEach((word: string) => {
        const cleanWord = word.replace(/[^\w]/g, "");
        if (cleanWord.length > 4 && !commonWords.has(cleanWord)) {
          keywords.add(cleanWord);
        }
      });
    });

    return Array.from(keywords).slice(0, 8);
  };

  const addInterest = () => {
    if (
      currentInterest.trim() &&
      !userInterests.includes(currentInterest.trim())
    ) {
      const updatedInterests = [...userInterests, currentInterest.trim()];
      setUserInterests(updatedInterests);
      setCurrentInterest("");

      // Sync interests to cloud - FIXED: Added sync for preferences
      setTimeout(async () => {
        try {
          await syncToCloud();
          triggerDataChange();
          console.log("✅ User interests synced to cloud");
        } catch (syncError) {
          console.error("❌ Failed to sync user interests:", syncError);
        }
      }, 1000);
    }
  };

  const removeInterest = (interest: string) => {
    const updatedInterests = userInterests.filter((i) => i !== interest);
    setUserInterests(updatedInterests);

    // Sync interests removal to cloud
    setTimeout(async () => {
      try {
        await syncToCloud();
        triggerDataChange();
        console.log("✅ User interests update synced to cloud");
      } catch (syncError) {
        console.error("❌ Failed to sync user interests removal:", syncError);
      }
    }, 1000);
  };

  const generateRecommendations = async () => {
    if (userInterests.length === 0) {
      setError("Please add at least one research interest");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userLibraryKey = user
        ? `savedPapers_${user.uid}`
        : "savedPapers_guest";
      const stored = localStorage.getItem(userLibraryKey);
      const savedPapers = stored ? JSON.parse(stored) : [];

      const recommendationRequest: RecommendationRequest = {
        interests: userInterests,
        recentPapers: savedPapers.slice(0, 5).map((p: any) => p.title),
        preferredJournals: [],
        yearsRange: filters.yearsRange,
        maxResults: filters.maxResults,
      };

      console.log("Generating recommendations with:", recommendationRequest);
      const recommendations = await getRecommendations(recommendationRequest);

      if (recommendations.length === 0) {
        setError(
          "No recommendations found right now. This might be due to API limits. Try again in a moment or try different interests."
        );
        setRecommendations([]);
      } else {
        setRecommendations(recommendations);
        const newXP = addXP(15, userId);
        console.log(`+15 XP for AI recommendations. Total XP: ${newXP}`);

        // Sync XP and recommendations activity to cloud
        setTimeout(async () => {
          try {
            await syncToCloud();
            triggerDataChange();
            console.log("✅ Recommendations activity synced to cloud");
          } catch (syncError) {
            console.error(
              "❌ Failed to sync recommendations activity:",
              syncError
            );
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error("Recommendation error:", err);
      setError(
        "Service temporarily unavailable. Please try again in a few moments."
      );
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (paper: any) => {
    const userLibraryKey = user
      ? `savedPapers_${user.uid}`
      : "savedPapers_guest";
    const stored = localStorage.getItem(userLibraryKey);
    const existing = stored ? JSON.parse(stored) : [];

    if (existing.find((p: any) => p.id === paper.id)) {
      alert("Already saved to your library!");
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
      abstract: paper.abstract || "",
      tags: paper.tags || [],
      savedAt: new Date().toISOString(),
    };

    const updated = [...existing, newItem];
    localStorage.setItem(userLibraryKey, JSON.stringify(updated));
    alert(`✅ Paper saved to your ${user ? "personal" : "guest"} library!`);

    // Add XP for saving
    const newXP = addXP(10, userId);
    console.log(`+10 XP for saving. Total XP: ${newXP}`);

    // Sync saved paper to cloud - FIXED: Better sync handling
    setTimeout(async () => {
      try {
        await syncToCloud();
        triggerDataChange();
        console.log("✅ Saved paper synced to cloud");
      } catch (syncError) {
        console.error("❌ Failed to sync saved paper:", syncError);
      }
    }, 500);
  };

  const handleReadFullPaper = async (paper: any) => {
    const url =
      paper.primary_location?.landing_page_url ||
      paper.primary_location?.source?.url ||
      paper.open_access?.url_for_pdf ||
      null;

    if (url) {
      window.open(url, "_blank");
      const newXP = addXP(10, userId);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      // Sync reading activity to cloud
      setTimeout(async () => {
        try {
          await syncToCloud();
          triggerDataChange();
          console.log("✅ Reading activity synced to cloud");
        } catch (syncError) {
          console.error("❌ Failed to sync reading activity:", syncError);
        }
      }, 500);
    } else {
      alert("Full paper link not available for this item.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="p-6 max-w-6xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
                <Sparkles className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              AI Research Recommendations
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized paper recommendations based on your interests and
              reading history
            </p>
            {user && (
              <p className="text-sm text-[#49BBBD] mt-2">
                Powered by AI • Earn 15 XP for generating recommendations
              </p>
            )}
          </motion.header>

          {/* Main Content */}
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Sidebar */}
            <div className="lg:col-span-2 w-full space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="text-[#49BBBD]" size={20} />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                      <TabsTrigger value="interests">Interests</TabsTrigger>
                      <TabsTrigger value="filters">Filters</TabsTrigger>
                    </TabsList>

                    <TabsContent value="interests" className="space-y-4 w-full">
                      <div className="space-y-3 w-full">
                        <div className="flex gap-2 w-full">
                          <Input
                            type="text"
                            value={currentInterest}
                            onChange={(e) => setCurrentInterest(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && addInterest()
                            }
                            placeholder="e.g., deep learning"
                            className="flex-1 bg-background border-border min-w-0"
                          />
                          <Button
                            onClick={addInterest}
                            size="icon"
                            className="shrink-0"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full">
                          {userInterests.map((interest) => (
                            <Badge
                              key={interest}
                              variant="secondary"
                              className="flex items-center gap-1 bg-secondary text-secondary-foreground"
                            >
                              {interest}
                              <button
                                onClick={() => removeInterest(interest)}
                                className="hover:text-destructive ml-1"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="filters" className="space-y-4 w-full">
                      <div className="space-y-3 w-full">
                        <div className="w-full">
                          <label className="text-sm font-medium mb-2 block text-foreground">
                            Publication Years
                          </label>
                          <div className="flex gap-2 w-full">
                            <Input
                              type="number"
                              value={filters.yearsRange[0]}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  yearsRange: [
                                    parseInt(e.target.value),
                                    filters.yearsRange[1],
                                  ],
                                })
                              }
                              className="flex-1 bg-background border-border min-w-0"
                            />
                            <Input
                              type="number"
                              value={filters.yearsRange[1]}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  yearsRange: [
                                    filters.yearsRange[0],
                                    parseInt(e.target.value),
                                  ],
                                })
                              }
                              className="flex-1 bg-background border-border min-w-0"
                            />
                          </div>
                        </div>

                        <div className="w-full">
                          <label className="text-sm font-medium mb-2 block text-foreground">
                            Number of Results
                          </label>
                          <Select
                            value={filters.maxResults.toString()}
                            onValueChange={(value) =>
                              setFilters({
                                ...filters,
                                maxResults: parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger className="w-full bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 papers</SelectItem>
                              <SelectItem value="10">10 papers</SelectItem>
                              <SelectItem value="15">15 papers</SelectItem>
                              <SelectItem value="20">20 papers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator className="my-4 bg-border w-full" />

                  <Button
                    onClick={generateRecommendations}
                    disabled={loading || userInterests.length === 0}
                    className="w-full bg-[#49BBBD] hover:bg-[#3aa8a9] text-white px-4 py-2.5 text-base"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Recommendations
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Stats Card */}
              {recommendations.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 w-full">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Recommendation Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 w-full">
                    <div className="flex justify-between w-full">
                      <span className="text-sm text-muted-foreground">
                        Total Results
                      </span>
                      <Badge variant="outline">{recommendations.length}</Badge>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm text-muted-foreground">
                        Year Range
                      </span>
                      <Badge variant="outline">
                        {filters.yearsRange[0]} - {filters.yearsRange[1]}
                      </Badge>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm text-muted-foreground">
                        In Range
                      </span>
                      <Badge variant="outline">
                        {
                          recommendations.filter(
                            (p) =>
                              p.publication_year >= filters.yearsRange[0] &&
                              p.publication_year <= filters.yearsRange[1]
                          ).length
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-sm text-muted-foreground">
                        User Interests
                      </span>
                      <Badge variant="outline">{userInterests.length}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Recommendations Grid */}
              {recommendations.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
                      <Lightbulb className="text-yellow-500" size={24} />
                      Personalized Recommendations
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {recommendations.length} papers
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {recommendations.map((item, index) => {
                      const isInYearRange =
                        item.publication_year &&
                        item.publication_year >= filters.yearsRange[0] &&
                        item.publication_year <= filters.yearsRange[1];

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Card
                            className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm border-border/50 ${
                              !isInYearRange
                                ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20"
                                : ""
                            }`}
                          >
                            <CardContent className="p-6">
                              {/* Header with Badges */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Recommended
                                </Badge>
                                {!isInYearRange && (
                                  <Badge
                                    variant="outline"
                                    className="text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700"
                                  >
                                    Outside Year Range
                                  </Badge>
                                )}
                                {item.relevance_score && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-auto bg-secondary text-secondary-foreground"
                                  >
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {(item.relevance_score * 100).toFixed(1)}%
                                    Relevant
                                  </Badge>
                                )}
                              </div>

                              {/* Paper Title */}
                              <h3 className="text-xl font-semibold mb-3 line-clamp-2 text-foreground group-hover:text-[#49BBBD] transition-colors">
                                {item.display_name}
                              </h3>

                              {/* Metadata */}
                              <div className="space-y-2 mb-4">
                                {item.authorships?.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User size={14} />
                                    <span className="line-clamp-1">
                                      {item.authorships
                                        .map((a: any) => a.author.display_name)
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  {item.host_venue?.display_name && (
                                    <div className="flex items-center gap-1">
                                      <Building size={14} />
                                      <span>
                                        {item.host_venue.display_name}
                                      </span>
                                    </div>
                                  )}
                                  {item.publication_year && (
                                    <div
                                      className={`flex items-center gap-1 ${
                                        isInYearRange
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-orange-600 dark:text-orange-400"
                                      }`}
                                    >
                                      <Calendar size={14} />
                                      <span>
                                        Published {item.publication_year}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Abstract Preview */}
                              {item.abstract && (
                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                                  {item.abstract}
                                </p>
                              )}

                              {/* Action Buttons */}
                              <div className="flex justify-between items-center pt-4 border-t border-border">
                                <div className="flex gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSave(item);
                                          }}
                                          className="border-border"
                                        >
                                          <Save className="w-4 h-4 mr-1" />
                                          Save
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Save to library +10 XP</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReadFullPaper(item);
                                          }}
                                          className="border-border"
                                        >
                                          <BookOpen className="w-4 h-4 mr-1" />
                                          Read
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Read full paper +10 XP</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground"
                                >
                                  View Details
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* Empty State */
                !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
                      <CardContent className="p-8">
                        <Sparkles
                          className="mx-auto text-muted-foreground/30 mb-4"
                          size={48}
                        />
                        <CardTitle className="text-lg mb-2 text-foreground">
                          Get Personalized Recommendations
                        </CardTitle>
                        <CardDescription className="mb-4">
                          Add your research interests and let AI find the
                          perfect papers for you.
                        </CardDescription>
                        <div className="text-sm text-muted-foreground space-y-1 text-center">
                          <p>
                            {" "}
                            Based on your saved papers • Tailored to your
                            interests
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}

              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card
                      key={index}
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-3/4 bg-muted" />
                          <Skeleton className="h-4 w-1/2 bg-muted" />
                          <Skeleton className="h-4 w-full bg-muted" />
                          <Skeleton className="h-4 w-2/3 bg-muted" />
                          <div className="flex gap-2 pt-4">
                            <Skeleton className="h-8 w-20 bg-muted" />
                            <Skeleton className="h-8 w-20 bg-muted" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
