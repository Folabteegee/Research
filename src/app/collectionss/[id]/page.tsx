"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Share2,
  Trash2,
  Edit3,
  BookOpen,
  Calendar,
  User,
  Building,
  Tag,
  FileText,
  X,
  Move,
  Check,
} from "lucide-react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Paper {
  id: string;
  title: string;
  author: string;
  year: string | number;
  journal: string;
  link: string;
  abstract?: string;
  tags?: string[];
  savedAt: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  papers: Paper[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  paperCount: number;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("papers");
  const [showAddPapers, setShowAddPapers] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);

  useEffect(() => {
    loadCollectionData();
  }, [collectionId, user]);

  const loadCollectionData = () => {
    setLoading(true);
    try {
      // Load collections
      const collectionsKey = user
        ? `collections_${user.uid}`
        : "collections_guest";
      const storedCollections = localStorage.getItem(collectionsKey);
      const collections: Collection[] = storedCollections
        ? JSON.parse(storedCollections)
        : [];

      // Load all papers
      const papersKey = user ? `savedPapers_${user.uid}` : "savedPapers_guest";
      const storedPapers = localStorage.getItem(papersKey);
      const allPapers: Paper[] = storedPapers ? JSON.parse(storedPapers) : [];

      const currentCollection = collections.find(
        (col) => col.id === collectionId
      );

      if (currentCollection) {
        setCollection(currentCollection);
        setAllPapers(allPapers);

        // Papers not in this collection
        const available = allPapers.filter(
          (paper) => !currentCollection.papers.some((p) => p.id === paper.id)
        );
        setAvailablePapers(available);
      } else {
        // Collection not found
        router.push("/collections");
      }
    } catch (error) {
      console.error("Error loading collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPapersToCollection = (paperIds: string[]) => {
    if (!collection) return;

    const papersToAdd = allPapers.filter((paper) =>
      paperIds.includes(paper.id)
    );

    const updatedCollection: Collection = {
      ...collection,
      papers: [...collection.papers, ...papersToAdd],
      paperCount: collection.paperCount + papersToAdd.length,
      updatedAt: new Date().toISOString(),
    };

    // Update collections in localStorage
    const collectionsKey = user
      ? `collections_${user.uid}`
      : "collections_guest";
    const storedCollections = localStorage.getItem(collectionsKey);
    const collections: Collection[] = storedCollections
      ? JSON.parse(storedCollections)
      : [];

    const updatedCollections = collections.map((col) =>
      col.id === collectionId ? updatedCollection : col
    );

    localStorage.setItem(collectionsKey, JSON.stringify(updatedCollections));
    setCollection(updatedCollection);

    // Update available papers
    const newAvailable = availablePapers.filter(
      (paper) => !paperIds.includes(paper.id)
    );
    setAvailablePapers(newAvailable);
    setSelectedPapers([]);
    setShowAddPapers(false);
  };

  const removePaperFromCollection = (paperId: string) => {
    if (!collection) return;

    const updatedCollection: Collection = {
      ...collection,
      papers: collection.papers.filter((paper) => paper.id !== paperId),
      paperCount: collection.paperCount - 1,
      updatedAt: new Date().toISOString(),
    };

    // Update collections in localStorage
    const collectionsKey = user
      ? `collections_${user.uid}`
      : "collections_guest";
    const storedCollections = localStorage.getItem(collectionsKey);
    const collections: Collection[] = storedCollections
      ? JSON.parse(storedCollections)
      : [];

    const updatedCollections = collections.map((col) =>
      col.id === collectionId ? updatedCollection : col
    );

    localStorage.setItem(collectionsKey, JSON.stringify(updatedCollections));
    setCollection(updatedCollection);

    // Add back to available papers
    const removedPaper = allPapers.find((paper) => paper.id === paperId);
    if (removedPaper) {
      setAvailablePapers([...availablePapers, removedPaper]);
    }
  };

  const deleteCollection = () => {
    const collectionsKey = user
      ? `collections_${user.uid}`
      : "collections_guest";
    const storedCollections = localStorage.getItem(collectionsKey);
    const collections: Collection[] = storedCollections
      ? JSON.parse(storedCollections)
      : [];

    const updatedCollections = collections.filter(
      (col) => col.id !== collectionId
    );
    localStorage.setItem(collectionsKey, JSON.stringify(updatedCollections));

    router.push("/collections");
  };

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers((prev) =>
      prev.includes(paperId)
        ? prev.filter((id) => id !== paperId)
        : [...prev, paperId]
    );
  };

  const selectAllPapers = () => {
    if (selectedPapers.length === availablePapers.length) {
      setSelectedPapers([]);
    } else {
      setSelectedPapers(availablePapers.map((paper) => paper.id));
    }
  };

  const filteredAvailablePapers = availablePapers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.journal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollectionPapers =
    collection?.papers.filter(
      (paper) =>
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.journal.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Collection not found. Redirecting...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/collections")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
              style={{ backgroundColor: collection.color }}
            >
              <FileText size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {collection.name}
              </h1>
              <p className="text-gray-600">{collection.description}</p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                  </DialogHeader>
                  {/* Edit form would go here */}
                </DialogContent>
              </Dialog>

              <Button onClick={() => setShowAddPapers(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Papers
              </Button>
            </div>
          </div>

          {/* Collection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {collection.paperCount}
                </div>
                <div className="text-sm text-gray-600">Total Papers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(collection.papers.map((p) => p.journal)).size}
                </div>
                <div className="text-sm text-gray-600">Journals</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(collection.papers.flatMap((p) => p.tags || [])).size}
                </div>
                <div className="text-sm text-gray-600">Unique Tags</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600">Last Updated</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(collection.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {collection.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {collection.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </motion.header>

        {/* Add Papers Dialog */}
        <Dialog open={showAddPapers} onOpenChange={setShowAddPapers}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Papers to Collection</DialogTitle>
              <DialogDescription>
                Select papers from your library to add to this collection.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              {/* Search and Controls */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search papers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={selectAllPapers}>
                  {selectedPapers.length === availablePapers.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              {/* Papers List */}
              <div className="overflow-y-auto max-h-96 space-y-2">
                {filteredAvailablePapers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {availablePapers.length === 0
                      ? "No papers available to add"
                      : "No papers match your search"}
                  </div>
                ) : (
                  filteredAvailablePapers.map((paper) => (
                    <div
                      key={paper.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPapers.includes(paper.id)
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => togglePaperSelection(paper.id)}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          selectedPapers.includes(paper.id)
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPapers.includes(paper.id) && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {paper.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <User className="w-3 h-3" />
                          <span className="line-clamp-1">{paper.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Building className="w-3 h-3" />
                          <span>{paper.journal}</span>
                          <Calendar className="w-3 h-3" />
                          <span>{paper.year}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-600">
                  {selectedPapers.length} papers selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPapers(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => addPapersToCollection(selectedPapers)}
                    disabled={selectedPapers.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Selected Papers
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="papers">
              <FileText className="w-4 h-4 mr-2" />
              Papers ({collection.paperCount})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BookOpen className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="papers" className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search papers in this collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="title">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Papers Grid */}
            {filteredCollectionPapers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                  <CardTitle className="text-lg mb-2">No Papers Yet</CardTitle>
                  <CardDescription className="mb-4">
                    {collection.paperCount === 0
                      ? "This collection doesn't have any papers yet."
                      : "No papers match your search."}
                  </CardDescription>
                  <Button onClick={() => setShowAddPapers(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Papers
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCollectionPapers.map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                              {paper.title}
                            </h3>

                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <User size={14} />
                                <span className="line-clamp-1">
                                  {paper.author}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Building size={14} />
                                  <span>{paper.journal}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{paper.year}</span>
                                </div>
                              </div>
                            </div>

                            {paper.tags && paper.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {paper.tags.map((tag, tagIndex) => (
                                  <Badge
                                    key={tagIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(paper.link, "_blank")
                                }
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Read Paper
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  removePaperFromCollection(paper.id)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove from Collection
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Collection Analytics</CardTitle>
                <CardDescription>
                  Insights about the papers in this collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">
                      Journals Distribution
                    </h4>
                    {/* Journal distribution chart would go here */}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Publication Years</h4>
                    {/* Year distribution chart would go here */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
