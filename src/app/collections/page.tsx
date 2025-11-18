"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Folder,
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
  Library,
  ChevronDown,
  Grid,
  List,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "papers">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("collections");
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    color: "#49BBBD",
    tags: [] as string[],
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const router = useRouter();
  const { user } = useAuth();

  const colors = [
    "#49BBBD",
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#6A0572",
    "#118AB2",
    "#EF476F",
    "#06D6A0",
    "#7209B7",
    "#F8961E",
  ];

  useEffect(() => {
    loadCollectionsAndPapers();
  }, [user]);

  const loadCollectionsAndPapers = () => {
    setLoading(true);
    try {
      const userLibraryKey = user
        ? `savedPapers_${user.uid}`
        : "savedPapers_guest";
      const storedPapers = localStorage.getItem(userLibraryKey);
      const papers: Paper[] = storedPapers ? JSON.parse(storedPapers) : [];

      const collectionsKey = user
        ? `collections_${user.uid}`
        : "collections_guest";
      const storedCollections = localStorage.getItem(collectionsKey);
      const savedCollections: Collection[] = storedCollections
        ? JSON.parse(storedCollections)
        : [];

      setAllPapers(papers);
      setCollections(savedCollections);
    } catch (error) {
      console.error("Error loading collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = () => {
    if (!newCollection.name.trim()) return;

    const collection: Collection = {
      id: `collection-${Date.now()}`,
      name: newCollection.name,
      description: newCollection.description,
      color: newCollection.color,
      papers: [],
      tags: newCollection.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paperCount: 0,
    };

    const updatedCollections = [...collections, collection];
    setCollections(updatedCollections);
    saveCollections(updatedCollections);

    // Trigger storage event to update dashboard
    window.dispatchEvent(new Event("storage"));

    setNewCollection({ name: "", description: "", color: "#49BBBD", tags: [] });
    setShowCreateDialog(false);
  };

  const updateCollection = (updatedCollection: Collection) => {
    const updatedCollections = collections.map((col) =>
      col.id === updatedCollection.id ? updatedCollection : col
    );
    setCollections(updatedCollections);
    saveCollections(updatedCollections);

    // Trigger storage event to update dashboard
    window.dispatchEvent(new Event("storage"));

    setEditingCollection(null);
  };

  const deleteCollection = (collectionId: string) => {
    const updatedCollections = collections.filter(
      (col) => col.id !== collectionId
    );
    setCollections(updatedCollections);
    saveCollections(updatedCollections);

    // Trigger storage event to update dashboard
    window.dispatchEvent(new Event("storage"));
  };

  const saveCollections = (collectionsToSave: Collection[]) => {
    const collectionsKey = user
      ? `collections_${user.uid}`
      : "collections_guest";
    localStorage.setItem(collectionsKey, JSON.stringify(collectionsToSave));
  };

  const addPaperToCollection = (collectionId: string, paper: Paper) => {
    const updatedCollections = collections.map((collection) => {
      if (collection.id === collectionId) {
        const paperExists = collection.papers.some((p) => p.id === paper.id);
        if (!paperExists) {
          return {
            ...collection,
            papers: [...collection.papers, paper],
            paperCount: collection.paperCount + 1,
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return collection;
    });
    setCollections(updatedCollections);
    saveCollections(updatedCollections);
  };

  const removePaperFromCollection = (collectionId: string, paperId: string) => {
    const updatedCollections = collections.map((collection) => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          papers: collection.papers.filter((p) => p.id !== paperId),
          paperCount: collection.paperCount - 1,
          updatedAt: new Date().toISOString(),
        };
      }
      return collection;
    });
    setCollections(updatedCollections);
    saveCollections(updatedCollections);
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    collections.forEach((collection) => {
      collection.tags.forEach((tag) => tags.add(tag));
      collection.papers.forEach((paper) => {
        paper.tags?.forEach((tag) => tags.add(tag));
      });
    });
    return Array.from(tags);
  };

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => collection.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "papers":
        return b.paperCount - a.paperCount;
      case "date":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  const CollectionCard = ({ collection }: { collection: Collection }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-border group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: collection.color }}
            >
              <Folder size={24} />
            </div>
            <div>
              <CardTitle className="text-lg line-clamp-1 text-foreground">
                {collection.name}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {collection.description}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-100 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditingCollection(collection)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteCollection(collection.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-1 mb-3">
          {collection.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {collection.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{collection.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{collection.paperCount} papers</span>
          <span>
            Updated {new Date(collection.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/collectionss/${collection.id}`)}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          View Collection
        </Button>
      </CardFooter>
    </Card>
  );

  const PaperCard = ({ paper }: { paper: Paper }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold line-clamp-2 text-sm leading-tight text-foreground">
            {paper.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-100 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Folder className="w-4 h-4 mr-2" />
                    Add to Collection
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Collection</DialogTitle>
                    <DialogDescription>
                      Choose a collection for this paper
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: collection.color }}
                          />
                          <span className="font-medium text-foreground">
                            {collection.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={
                            collection.papers.some((p) => p.id === paper.id)
                              ? "outline"
                              : "default"
                          }
                          onClick={() => {
                            if (
                              collection.papers.some((p) => p.id === paper.id)
                            ) {
                              removePaperFromCollection(
                                collection.id,
                                paper.id
                              );
                            } else {
                              addPaperToCollection(collection.id, paper);
                            }
                          }}
                        >
                          {collection.papers.some((p) => p.id === paper.id)
                            ? "Remove"
                            : "Add"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span className="line-clamp-1">{paper.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building size={12} />
            <span className="line-clamp-1">{paper.journal}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{paper.year}</span>
          </div>
        </div>

        {paper.tags && paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {paper.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {paper.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{paper.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#49BBBD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your collections...</p>
        </div>
      </div>
    );
  }

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
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
                    <Library className="text-white" size={32} />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Collections
                </h1>
                <p className="text-xl text-muted-foreground">
                  Organize and manage your research papers
                </p>
              </div>

              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#49BBBD] hover:bg-[#3aa8a9]">
                    <Plus className="w-4 h-4 mr-2" />
                    New Collection
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                    <DialogDescription>
                      Organize your papers into themed collections for better
                      research management.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-foreground">
                        Collection Name
                      </label>
                      <Input
                        value={newCollection.name}
                        onChange={(e) =>
                          setNewCollection({
                            ...newCollection,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Machine Learning Papers"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-foreground">
                        Description
                      </label>
                      <Input
                        value={newCollection.description}
                        onChange={(e) =>
                          setNewCollection({
                            ...newCollection,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of this collection"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-foreground">
                        Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newCollection.color === color
                                ? "border-foreground"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              setNewCollection({ ...newCollection, color })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createCollection}
                      disabled={!newCollection.name.trim()}
                    >
                      Create Collection
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.header>

          {/* Edit Collection Dialog */}
          <Dialog
            open={!!editingCollection}
            onOpenChange={(open) => !open && setEditingCollection(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Collection</DialogTitle>
              </DialogHeader>
              {editingCollection && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      Collection Name
                    </label>
                    <Input
                      value={editingCollection.name}
                      onChange={(e) =>
                        setEditingCollection({
                          ...editingCollection,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      Description
                    </label>
                    <Input
                      value={editingCollection.description}
                      onChange={(e) =>
                        setEditingCollection({
                          ...editingCollection,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            editingCollection.color === color
                              ? "border-foreground"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            setEditingCollection({
                              ...editingCollection,
                              color,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingCollection(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    editingCollection && updateCollection(editingCollection)
                  }
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger
                value="collections"
                className="flex items-center gap-2"
              >
                <Folder className="h-4 w-4" />
                Collections ({collections.length})
              </TabsTrigger>
              <TabsTrigger value="papers" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Papers ({allPapers.length})
              </TabsTrigger>
            </TabsList>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-card/50 border-border"
                  />
                </div>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-32 bg-card/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="papers">Papers</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className="border-border"
                >
                  {viewMode === "grid" ? (
                    <List size={16} />
                  ) : (
                    <Grid size={16} />
                  )}
                </Button>
              </div>

              {activeTab === "collections" && (
                <div className="flex gap-2 flex-wrap">
                  {getAllTags()
                    .slice(0, 5)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  {getAllTags().length > 5 && (
                    <Badge variant="outline" className="cursor-pointer">
                      +{getAllTags().length - 5}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <TabsContent value="collections" className="space-y-6">
              {sortedCollections.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
                    <CardContent className="p-8">
                      <Folder
                        className="mx-auto text-muted-foreground/30 mb-4"
                        size={48}
                      />
                      <CardTitle className="text-lg mb-2 text-foreground">
                        No Collections Yet
                      </CardTitle>
                      <CardDescription className="mb-4">
                        Create your first collection to organize your research
                        papers.
                      </CardDescription>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Collection
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {sortedCollections.map((collection, index) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CollectionCard collection={collection} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="papers" className="space-y-6">
              {allPapers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
                    <CardContent className="p-8">
                      <FileText
                        className="mx-auto text-muted-foreground/30 mb-4"
                        size={48}
                      />
                      <CardTitle className="text-lg mb-2 text-foreground">
                        No Papers Saved
                      </CardTitle>
                      <CardDescription className="mb-4">
                        Save some papers to your library to see them here.
                      </CardDescription>
                      <Button onClick={() => router.push("/recommendations")}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Find Papers
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {allPapers.map((paper, index) => (
                    <motion.div
                      key={paper.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PaperCard paper={paper} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
