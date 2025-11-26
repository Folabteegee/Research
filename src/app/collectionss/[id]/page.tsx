"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
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
  RefreshCw,
  Cloud,
  CloudOff,
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
  const {
    syncToCloud,
    syncFromCloud,
    isSyncing,
    lastSynced,
    syncError,
    triggerDataChange,
  } = useSync();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [availablePapers, setAvailablePapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("papers");
  const [showAddPapers, setShowAddPapers] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    color: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  // Enhanced sync functions
  const enhancedSyncToCloud = async () => {
    setSyncStatus("syncing");
    try {
      const success = await syncToCloud();
      if (success) {
        setSyncStatus("success");
        setTimeout(() => {
          loadCollectionData();
        }, 1000);
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
        loadCollectionData();
      } else {
        setSyncStatus("error");
      }
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  // Update sync status based on isSyncing
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

  // Load collection data
  const loadCollectionData = () => {
    setLoading(true);
    try {
      const collectionsKey = user
        ? `collections_${user.uid}`
        : "collections_guest";
      const storedCollections = localStorage.getItem(collectionsKey);
      const collections: Collection[] = storedCollections
        ? JSON.parse(storedCollections)
        : [];

      const papersKey = user ? `savedPapers_${user.uid}` : "savedPapers_guest";
      const storedPapers = localStorage.getItem(papersKey);
      const allPapers: Paper[] = storedPapers ? JSON.parse(storedPapers) : [];

      const currentCollection = collections.find(
        (col) => col.id === collectionId
      );

      if (currentCollection) {
        setCollection(currentCollection);
        setAllPapers(allPapers);
        setEditFormData({
          name: currentCollection.name,
          description: currentCollection.description,
          color: currentCollection.color,
          tags: [...currentCollection.tags],
        });

        const available = allPapers.filter(
          (paper) => !currentCollection.papers.some((p) => p.id === paper.id)
        );
        setAvailablePapers(available);
      } else {
        router.push("/collections");
      }
    } catch (error) {
      console.error("Error loading collection:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollectionData();

    const handleDataChange = () => {
      loadCollectionData();
    };

    const handleCloudDataApplied = () => {
      loadCollectionData();
    };

    window.addEventListener("storage", handleDataChange);
    window.addEventListener("cloudDataApplied", handleCloudDataApplied);
    window.addEventListener("dataChanged", handleDataChange);

    return () => {
      window.removeEventListener("storage", handleDataChange);
      window.removeEventListener("cloudDataApplied", handleCloudDataApplied);
      window.removeEventListener("dataChanged", handleDataChange);
    };
  }, [collectionId, user, router]);

  // Auto-sync when collection data changes
  useEffect(() => {
    if (collection && !loading && user) {
      const syncTimer = setTimeout(async () => {
        try {
          await syncToCloud();
        } catch (error) {
          console.error("❌ Failed to auto-sync collection:", error);
        }
      }, 3000);

      return () => clearTimeout(syncTimer);
    }
  }, [collection, loading, user, syncToCloud]);

  // Update collection function
  const updateCollection = async (updatedData: Partial<Collection>) => {
    if (!collection) return;

    const updatedCollection: Collection = {
      ...collection,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

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

    setTimeout(async () => {
      try {
        await syncToCloud();
        triggerDataChange();
      } catch (error) {
        console.error("❌ Failed to sync collection update:", error);
      }
    }, 500);
  };

  // Edit form handlers
  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = () => {
    if (!collection) return;

    updateCollection({
      name: editFormData.name,
      description: editFormData.description,
      color: editFormData.color,
      tags: editFormData.tags,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editFormData.tags.includes(newTag.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleColorChange = (color: string) => {
    setEditFormData((prev) => ({
      ...prev,
      color,
    }));
  };

  // Paper management functions
  const addPapersToCollection = async (paperIds: string[]) => {
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

    const newAvailable = availablePapers.filter(
      (paper) => !paperIds.includes(paper.id)
    );
    setAvailablePapers(newAvailable);
    setSelectedPapers([]);
    setShowAddPapers(false);

    setTimeout(async () => {
      try {
        await syncToCloud();
        triggerDataChange();
      } catch (error) {
        console.error("❌ Failed to sync collection update:", error);
      }
    }, 500);
  };

  const removePaperFromCollection = async (paperId: string) => {
    if (!collection) return;

    const updatedCollection: Collection = {
      ...collection,
      papers: collection.papers.filter((paper) => paper.id !== paperId),
      paperCount: collection.paperCount - 1,
      updatedAt: new Date().toISOString(),
    };

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

    const removedPaper = allPapers.find((paper) => paper.id === paperId);
    if (removedPaper) {
      setAvailablePapers([...availablePapers, removedPaper]);
    }

    setTimeout(async () => {
      try {
        await syncToCloud();
        triggerDataChange();
      } catch (error) {
        console.error("❌ Failed to sync collection update:", error);
      }
    }, 500);
  };

  const deleteCollection = async () => {
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

    setTimeout(async () => {
      try {
        await syncToCloud();
        triggerDataChange();
      } catch (error) {
        console.error("❌ Failed to sync collection deletion:", error);
      }
    }, 500);

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
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6 bg-muted" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full bg-muted" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full bg-muted" />
              <Skeleton className="h-32 w-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription className="text-center">
            Collection not found. Redirecting...
            <div className="mt-4 flex gap-2 justify-center">
              <Button
                onClick={enhancedSyncFromCloud}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync from Cloud
              </Button>
              <Button onClick={() => router.push("/collections")} size="sm">
                Back to Collections
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
                className="border-border"
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
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {collection.name}
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  {collection.description}
                </p>
                {user && (
                  <p className="text-sm text-[#49BBBD] mt-1">
                    Changes sync automatically across devices
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {/* Edit Collection Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-border">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">
                        Edit Collection
                      </DialogTitle>
                      <DialogDescription>
                        Update your collection details. Changes will be saved
                        automatically.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Collection Name */}
                      <div className="space-y-2">
                        <label
                          htmlFor="collection-name"
                          className="text-sm font-medium text-foreground"
                        >
                          Collection Name
                        </label>
                        <Input
                          id="collection-name"
                          value={editFormData.name}
                          onChange={(e) =>
                            handleEditFormChange("name", e.target.value)
                          }
                          placeholder="Enter collection name"
                          className="bg-background border-border"
                        />
                      </div>

                      {/* Collection Description */}
                      <div className="space-y-2">
                        <label
                          htmlFor="collection-description"
                          className="text-sm font-medium text-foreground"
                        >
                          Description
                        </label>
                        <textarea
                          id="collection-description"
                          value={editFormData.description}
                          onChange={(e) =>
                            handleEditFormChange("description", e.target.value)
                          }
                          placeholder="Describe your collection..."
                          rows={3}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] resize-none"
                        />
                      </div>

                      {/* Collection Color */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Color Theme
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            "#49BBBD", // Teal
                            "#3B82F6", // Blue
                            "#8B5CF6", // Purple
                            "#EC4899", // Pink
                            "#F59E0B", // Amber
                            "#EF4444", // Red
                            "#10B981", // Emerald
                            "#6366F1", // Indigo
                            "#F97316", // Orange
                            "#06B6D4", // Cyan
                          ].map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                editFormData.color === color
                                  ? "border-foreground scale-110"
                                  : "border-border hover:scale-105"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => handleColorChange(color)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Collection Tags */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 min-h-12 bg-background border border-border rounded-md">
                          {editFormData.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 bg-secondary text-secondary-foreground"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-destructive ml-1"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ))}
                          <div className="flex gap-2 flex-1 min-w-0">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddTag();
                                }
                              }}
                              placeholder="Add a tag..."
                              className="flex-1 min-w-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6"
                            />
                            <Button
                              type="button"
                              onClick={handleAddTag}
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              disabled={!newTag.trim()}
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Press Enter or click + to add a tag
                        </p>
                      </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        {user && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Cloud className="w-3 h-3" />
                            Changes will sync automatically
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="border-border">
                          Cancel
                        </Button>
                        <Button
                          className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                          onClick={handleSaveEdit}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => setShowAddPapers(true)}
                  className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Papers
                </Button>
              </div>
            </div>

            {/* Collection Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {collection.paperCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Papers
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {new Set(collection.papers.map((p) => p.journal)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Journals</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {
                      new Set(collection.papers.flatMap((p) => p.tags || []))
                        .size
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Unique Tags
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {new Date(collection.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {collection.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.header>

          {/* Add Papers Dialog */}
          <Dialog open={showAddPapers} onOpenChange={setShowAddPapers}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add Papers to Collection
                </DialogTitle>
                <DialogDescription>
                  Select papers from your library to add to this collection.
                  {user && (
                    <span className="text-[#49BBBD] ml-2">
                      Changes will sync automatically.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                {/* Search and Controls */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search papers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background border-border"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={selectAllPapers}
                    className="border-border"
                  >
                    {selectedPapers.length === availablePapers.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                {/* Papers List */}
                <div className="overflow-y-auto max-h-96 space-y-2">
                  {filteredAvailablePapers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
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
                            ? "bg-primary/10 border-primary/20"
                            : "bg-card/50 border-border/50 hover:bg-accent/50"
                        }`}
                        onClick={() => togglePaperSelection(paper.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectedPapers.includes(paper.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {selectedPapers.includes(paper.id) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                            {paper.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <User className="w-3 h-3" />
                            <span className="line-clamp-1">{paper.author}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  <span className="text-sm text-muted-foreground">
                    {selectedPapers.length} papers selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddPapers(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => addPapersToCollection(selectedPapers)}
                      disabled={selectedPapers.length === 0}
                      className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
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
            <TabsList className="bg-card/50 backdrop-blur-sm border-border/50">
              <TabsTrigger
                value="papers"
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <FileText className="w-4 h-4 mr-2" />
                Papers ({collection.paperCount})
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="papers" className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search papers in this collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
                <Select defaultValue="title">
                  <SelectTrigger className="w-32 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Papers Grid */}
              {filteredCollectionPapers.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-8 text-center">
                    <FileText
                      className="mx-auto text-muted-foreground/30 mb-4"
                      size={48}
                    />
                    <CardTitle className="text-lg mb-2 text-foreground">
                      No Papers Yet
                    </CardTitle>
                    <CardDescription className="mb-4">
                      {collection.paperCount === 0
                        ? "This collection doesn't have any papers yet."
                        : "No papers match your search."}
                    </CardDescription>
                    <Button
                      onClick={() => setShowAddPapers(true)}
                      className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                    >
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
                      <Card className="group hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
                                {paper.title}
                              </h3>

                              <div className="space-y-1 text-sm text-muted-foreground mb-3">
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
                                      className="text-xs border-border"
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
                                  className="opacity-100 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-background border-border"
                              >
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
                                  className="text-destructive"
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
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Collection Analytics
                  </CardTitle>
                  <CardDescription>
                    Insights about the papers in this collection
                    {user && (
                      <span className="text-[#49BBBD] ml-2">
                        • Data syncs automatically
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">
                        Journals Distribution
                      </h4>
                      <div className="text-muted-foreground text-sm">
                        Analytics visualization coming soon...
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">
                        Publication Years
                      </h4>
                      <div className="text-muted-foreground text-sm">
                        Analytics visualization coming soon...
                      </div>
                    </div>
                  </div>

                  {lastSynced && (
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground text-center">
                        Last cloud sync: {new Date(lastSynced).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
