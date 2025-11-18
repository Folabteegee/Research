"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/context/ApiContext";
import { useAuth } from "@/context/AuthContext";
import {
  addXP,
  unlockAchievement,
  checkSavedAchievements,
} from "@/lib/gamification";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Save,
  TrendingUp,
  Brain,
  User,
  Calendar,
  Building,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
  const { papers, fetchPapers } = useApi();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  // Get user ID for gamification
  const userId = user?.uid;

  const trendingTopics = [
    {
      name: "Artificial Intelligence",
      icon: "🤖",
      color: "from-purple-500 to-blue-500",
      description: "Machine learning, neural networks, and AI applications",
    },
    {
      name: "Climate Change",
      icon: "🌍",
      color: "from-green-500 to-teal-500",
      description: "Environmental science and sustainability research",
    },
    {
      name: "Neuroscience",
      icon: "🧠",
      color: "from-pink-500 to-rose-500",
      description: "Brain research and cognitive sciences",
    },
    {
      name: "Renewable Energy",
      icon: "⚡",
      color: "from-yellow-500 to-orange-500",
      description: "Solar, wind, and sustainable energy solutions",
    },
    {
      name: "Microbiology",
      icon: "🔬",
      color: "from-blue-500 to-cyan-500",
      description: "Microorganisms and biomedical research",
    },
    {
      name: "Quantum Computing",
      icon: "⚛️",
      color: "from-indigo-500 to-purple-500",
      description: "Quantum algorithms and computing technologies",
    },
  ];

  const researchCategories = [
    {
      name: "Computer Science",
      topics: [
        "Machine Learning",
        "Cybersecurity",
        "Data Science",
        "Software Engineering",
      ],
    },
    {
      name: "Life Sciences",
      topics: ["Genetics", "Bioinformatics", "Ecology", "Pharmacology"],
    },
    {
      name: "Physical Sciences",
      topics: ["Physics", "Chemistry", "Astronomy", "Materials Science"],
    },
    {
      name: "Social Sciences",
      topics: ["Psychology", "Economics", "Sociology", "Political Science"],
    },
  ];

  // Get user-specific storage key
  const getUserLibraryKey = () => {
    return userId ? `savedPapers_${userId}` : "savedPapers_guest";
  };

  useEffect(() => {
    if (papers.length === 0) fetchTrendingPapers();
  }, []);

  const fetchTrendingPapers = async (topic?: string) => {
    setLoading(true);
    setActiveTopic(topic || "");
    try {
      const searchTopic =
        topic ||
        trendingTopics[Math.floor(Math.random() * trendingTopics.length)].name;
      await fetchPapers(searchTopic);

      // Track search for gamification
      const searchesKey = userId ? `searches_${userId}` : "searches_guest";
      const currentSearches = parseInt(
        localStorage.getItem(searchesKey) || "0"
      );
      localStorage.setItem(searchesKey, String(currentSearches + 1));

      // Add XP for exploring topics
      const newXP = addXP(5, userId);
      console.log(`+5 XP for exploring. Total XP: ${newXP}`);

      // Trigger storage update for real-time sync
      window.dispatchEvent(new Event("storage"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setActiveTopic("");
    try {
      await fetchPapers(search);

      // Track search for gamification
      const searchesKey = userId ? `searches_${userId}` : "searches_guest";
      const currentSearches = parseInt(
        localStorage.getItem(searchesKey) || "0"
      );
      localStorage.setItem(searchesKey, String(currentSearches + 1));

      // Add XP for searching
      const newXP = addXP(5, userId);
      console.log(`+5 XP for searching. Total XP: ${newXP}`);

      // Trigger storage update for real-time sync
      window.dispatchEvent(new Event("storage"));
    } finally {
      setLoading(false);
    }
  };

  const handleReadFull = (paper: any) => {
    const openAccessUrl = paper.open_access?.url;
    const doiUrl = paper.doi ? `https://doi.org/${paper.doi}` : null;

    if (openAccessUrl) {
      window.open(openAccessUrl, "_blank");

      // Add XP for reading with user ID
      const newXP = addXP(10, userId);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      // Track read count with user-specific key
      const readKey = userId ? `reads_${userId}` : "reads_guest";
      const readCount = parseInt(localStorage.getItem(readKey) || "0") + 1;
      localStorage.setItem(readKey, readCount.toString());

      // Force update achievements page
      window.dispatchEvent(new Event("storage"));
    } else if (doiUrl) {
      window.open(doiUrl, "_blank");

      // Add XP for reading with user ID
      const newXP = addXP(10, userId);
      console.log(`+10 XP for reading. Total XP: ${newXP}`);

      // Track read count with user-specific key
      const readKey = userId ? `reads_${userId}` : "reads_guest";
      const readCount = parseInt(localStorage.getItem(readKey) || "0") + 1;
      localStorage.setItem(readKey, readCount.toString());

      // Force update achievements page
      window.dispatchEvent(new Event("storage"));
    } else {
      alert(
        "❌ This paper is not freely available. Try using Zotero or your institution's library."
      );
    }
  };

  const handleSave = (paper: any) => {
    const userLibraryKey = getUserLibraryKey();
    const stored = localStorage.getItem(userLibraryKey);
    const current = stored ? JSON.parse(stored) : [];
    const exists = current.some((p: any) => p.id === paper.id);
    if (exists) return alert("Already saved to your library!");

    const newList = [
      ...current,
      {
        id: paper.id,
        title: paper.display_name,
        author:
          paper.authorships?.[0]?.author?.display_name || "Unknown Author",
        year: paper.publication_year || "N/A",
        journal: paper.host_venue?.display_name || "N/A",
        url: paper.open_access?.url || paper.doi,
      },
    ];
    localStorage.setItem(userLibraryKey, JSON.stringify(newList));

    // Add XP and check achievements with user ID
    const newXP = addXP(10, userId);
    console.log(`+10 XP for saving. Total XP: ${newXP}`);

    // Check saved papers achievements
    checkSavedAchievements(userId);

    alert(
      `✅ Paper saved to your ${
        user ? "personal" : "guest"
      } library! +10 XP earned!`
    );

    // Force update achievements page
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(#49BBBD_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-5 dark:opacity-10"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
                <TrendingUp className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Research Trends
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover trending papers and explore cutting-edge research across
              various fields
            </p>
            {user && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Earn XP for exploring, saving, and reading!
                </Badge>
              </div>
            )}
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
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
                size={24}
              />
              <Input
                type="text"
                placeholder="Search for specific papers, authors, or research topics..."
                className="w-full pl-12 pr-32 py-6 bg-card border-2 border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all duration-300 shadow-sm text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#49BBBD] hover:bg-[#3aa8a9] text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Search
              </Button>
            </div>
            <div className="text-center mt-4">
              <Badge variant="outline" className="bg-card/50 backdrop-blur-sm">
                🔍 +5 XP for searching/exploring • 💾 +10 XP for saving • 📖 +10
                XP for reading
              </Badge>
            </div>
          </motion.form>

          {/* Content Tabs */}
          <Tabs
            defaultValue="trending"
            className="mb-8"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 bg-background/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending Topics
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Research Categories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending">
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-12"
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#49BBBD]" />
                      Hot Research Topics
                    </CardTitle>
                    <CardDescription>
                      Explore the most popular and emerging research areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                      {trendingTopics.map((topic, index) => (
                        <motion.div
                          key={topic.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <Card
                            className={`bg-gradient-to-br ${
                              topic.color
                            } text-white cursor-pointer hover:shadow-lg transition-all duration-300 h-full ${
                              activeTopic === topic.name
                                ? "ring-2 ring-white ring-opacity-50"
                                : ""
                            }`}
                            onClick={() => fetchTrendingPapers(topic.name)}
                          >
                            <CardContent className="p-3 md:p-4 text-center">
                              <div className="text-xl md:text-2xl mb-1 md:mb-2">
                                {topic.icon}
                              </div>
                              <h3 className="font-semibold text-xs md:text-sm mb-1 md:mb-2">
                                {topic.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="bg-white/20 text-white border-none text-xs"
                              >
                                +5 XP
                              </Badge>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </TabsContent>

            <TabsContent value="categories">
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-12"
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-[#49BBBD]" />
                      Research Categories
                    </CardTitle>
                    <CardDescription>
                      Browse papers by academic discipline and field
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {researchCategories.map((category, index) => (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <Card className="bg-card border-border/50 hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {category.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {category.topics.map((topic) => (
                                  <Badge
                                    key={topic}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-[#49BBBD] hover:text-white transition-colors"
                                    onClick={() => {
                                      setSearch(topic);
                                      handleSearch({
                                        preventDefault: () => {},
                                      } as React.FormEvent);
                                    }}
                                  >
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            </TabsContent>
          </Tabs>

          {/* Active Topic Indicator */}
          {activeTopic && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <Alert className="bg-[#49BBBD]/10 border-[#49BBBD]/20">
                <AlertDescription className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#49BBBD]" />
                  Showing results for: <strong>{activeTopic}</strong> • +5 XP
                  earned!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* User Library Info */}
          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-center"
            >
              <Badge
                variant="outline"
                className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
              >
                Saving to {user.email}'s personal library
              </Badge>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 justify-center">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="space-y-3 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Grid */}
          {!loading && papers.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl">
                        Research Papers
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-[#49BBBD] text-white"
                        >
                          {papers.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {activeTopic
                          ? `Trending in ${activeTopic}`
                          : "Explore research papers"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20"
                    >
                      Earn XP for reading and saving!
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6">
                {papers.map((paper: any, index: number) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#49BBBD]/30">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Paper Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <CardTitle className="text-xl group-hover:text-[#49BBBD] transition-colors duration-300 pr-4">
                                {paper.display_name}
                              </CardTitle>
                              {paper.cited_by_count > 100 && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800"
                                >
                                  Highly Cited
                                </Badge>
                              )}
                            </div>

                            {/* Authors */}
                            {paper.authorships?.length > 0 && (
                              <div className="flex items-center gap-2 mb-3">
                                <User
                                  size={16}
                                  className="text-muted-foreground"
                                />
                                <span className="text-muted-foreground text-sm">
                                  {paper.authorships
                                    .map((a: any) => a.author.display_name)
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            {/* Journal and Year */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                              {paper.host_venue?.display_name && (
                                <div className="flex items-center gap-1">
                                  <Building size={14} />
                                  <span>{paper.host_venue.display_name}</span>
                                </div>
                              )}
                              {paper.publication_year && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                >
                                  <Calendar size={12} className="mr-1" />
                                  {paper.publication_year}
                                </Badge>
                              )}
                              {paper.cited_by_count > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                >
                                  {paper.cited_by_count} citations
                                </Badge>
                              )}
                            </div>

                            {/* Abstract Preview */}
                            {paper.abstract && (
                              <CardDescription className="leading-relaxed line-clamp-2">
                                {paper.abstract}
                              </CardDescription>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex lg:flex-col gap-2 lg:gap-3">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReadFull(paper);
                              }}
                              className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white shadow-sm hover:shadow-md"
                              size="sm"
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              Read +10 XP
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave(paper);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-border hover:border-[#49BBBD] hover:bg-[#49BBBD]/5"
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Save +10 XP
                            </Button>
                          </div>
                        </div>

                        {/* View Details Arrow */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Click to view details
                          </span>
                          <ArrowRight
                            className="text-muted-foreground group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                            size={16}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty State */}
          {!loading && papers.length === 0 && search && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
                <CardContent className="p-8">
                  <Search
                    className="mx-auto text-muted-foreground/30 mb-4"
                    size={48}
                  />
                  <CardTitle className="text-lg font-semibold text-foreground mb-2">
                    No papers found
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Try searching for a different topic or explore trending
                    research areas above.
                  </CardDescription>
                  <Button
                    variant="outline"
                    className="mt-4 border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white"
                    onClick={() => setSearch("")}
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
