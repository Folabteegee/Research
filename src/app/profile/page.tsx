"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSync } from "@/lib/hooks/useSync";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Edit3,
  Save,
  Camera,
  Calendar,
  Award,
  BookOpen,
  Zap,
  Settings,
  UserCog,
  MapPin,
  Globe,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getUserXP, getLevel, updateStreak } from "@/lib/gamification";

// Helper function to safely parse JSON
const safeJsonParse = (value: string | null, defaultValue: any = null) => {
  if (
    !value ||
    value === "null" ||
    value === "undefined" ||
    value === "NaN" ||
    value === '""'
  ) {
    return defaultValue;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("JSON parse error:", error);
    return defaultValue;
  }
};

// Profile Picture Upload Component
function ProfilePictureUpload({
  currentProfilePic,
  onProfilePictureChange,
}: {
  currentProfilePic: string | null;
  onProfilePictureChange: () => void;
}) {
  const { user } = useAuth();
  const { syncToCloud } = useSync();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUserProfilePicKey = () => {
    return user ? `profilePic_${user.uid}` : "profilePic_guest";
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        localStorage.setItem(getUserProfilePicKey(), imageDataUrl);
        onProfilePictureChange();

        // Sync to cloud
        setTimeout(async () => {
          try {
            await syncToCloud();
            console.log("✅ Profile picture synced to cloud");
          } catch (error) {
            console.error("❌ Failed to sync profile picture:", error);
          }
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const userInitial = user?.email?.[0]?.toUpperCase() || "U";
  const hasValidProfilePic = currentProfilePic || user?.photoURL;

  return (
    <div className="relative">
      <div
        className="relative group cursor-pointer"
        onClick={handleUploadClick}
      >
        <Avatar className="h-24 w-24 border-2 border-[#49BBBD]/20 group-hover:border-[#49BBBD] transition-all duration-300">
          {hasValidProfilePic ? (
            <AvatarImage
              src={currentProfilePic || user?.photoURL || undefined}
              alt="Profile"
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9] text-white text-xl font-semibold">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#49BBBD] rounded-full border-2 border-background flex items-center justify-center">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { syncToCloud } = useSync();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "Research enthusiast exploring the world of academic papers.",
    location: "",
    website: "",
  });
  const [currentProfilePic, setCurrentProfilePic] = useState<string | null>(
    null
  );
  const [stats, setStats] = useState({
    papersSaved: 0,
    readingTime: "0h",
    streak: 0,
    level: 1,
    xp: 0,
  });

  // Load profile data and stats
  useEffect(() => {
    loadProfileData();
    loadUserStats();

    // Listen for data changes to update stats
    const handleDataChanged = () => {
      loadUserStats();
    };

    window.addEventListener("dataChanged", handleDataChanged);
    return () => {
      window.removeEventListener("dataChanged", handleDataChanged);
    };
  }, [user]);

  const loadProfileData = () => {
    if (user) {
      const userProfileKey = `userProfile_${user.uid}`;
      const storedProfile = localStorage.getItem(userProfileKey);

      if (storedProfile) {
        try {
          const profileData = JSON.parse(storedProfile);
          setProfile(profileData);
        } catch (error) {
          console.error("Error parsing profile data:", error);
        }
      } else {
        // Set default display name from email
        const displayName =
          user.displayName ||
          (user.email ? user.email.split("@")[0] : "Researcher");
        setProfile((prev) => ({ ...prev, displayName }));
      }

      // Load profile picture
      const profilePicKey = `profilePic_${user.uid}`;
      const savedProfilePic = localStorage.getItem(profilePicKey);
      setCurrentProfilePic(savedProfilePic);
    }
  };

  const loadUserStats = () => {
    if (!user) return;

    const userId = user.uid;

    // Load saved papers count
    const userLibraryKey = `savedPapers_${userId}`;
    const storedPapers = localStorage.getItem(userLibraryKey);
    const savedPapers = safeJsonParse(storedPapers, []);

    // Load reading time
    const readPapersKey = `reads_${userId}`;
    const readPapersData = localStorage.getItem(readPapersKey);
    let readingHours = 0;
    if (readPapersData) {
      try {
        const readPapers = safeJsonParse(readPapersData, []);
        if (Array.isArray(readPapers)) {
          readingHours = Math.floor(readPapers.length * 0.5);
        }
      } catch (error) {
        readingHours = 0;
      }
    }

    // Load actual streak and level from gamification
    const streak = updateStreak(userId);
    const xp = getUserXP(userId);
    const level = getLevel(xp);

    setStats({
      papersSaved: savedPapers.length,
      readingTime: `${readingHours}h`,
      streak: streak,
      level: level,
      xp: xp,
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const userProfileKey = `userProfile_${user.uid}`;
    localStorage.setItem(userProfileKey, JSON.stringify(profile));

    // Update display name in localStorage for dashboard
    localStorage.setItem(`userDisplayName_${user.uid}`, profile.displayName);

    // Sync to cloud
    try {
      await syncToCloud();
      console.log("✅ Profile changes synced to cloud");
    } catch (error) {
      console.error("❌ Failed to sync profile changes:", error);
    }

    // Trigger data change event to update dashboard and other pages
    window.dispatchEvent(new Event("dataChanged"));
    window.dispatchEvent(new Event("storage"));

    setIsEditing(false);
  };

  const handleProfilePictureChange = () => {
    // Reload profile picture
    if (user) {
      const profilePicKey = `profilePic_${user.uid}`;
      const savedProfilePic = localStorage.getItem(profilePicKey);
      setCurrentProfilePic(savedProfilePic);
    }

    // Trigger data change to update dashboard
    window.dispatchEvent(new Event("dataChanged"));
  };

  const userEmail = user?.email || "Not signed in";
  const userInitial = user?.email?.[0]?.toUpperCase() || "U";
  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
              <UserCog className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Profile Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your personal information and research preferences
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="h-5 w-5 text-[#49BBBD]" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture & Basic Info */}
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <ProfilePictureUpload
                      currentProfilePic={currentProfilePic}
                      onProfilePictureChange={handleProfilePictureChange}
                    />
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Display Name
                          </label>
                          <Input
                            value={profile.displayName}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                displayName: e.target.value,
                              }))
                            }
                            placeholder="Enter your display name"
                            className="bg-background/50 border-border"
                            disabled={!isEditing}
                          />
                          <p className="text-xs text-muted-foreground">
                            This name will appear on your dashboard
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <Input
                            value={userEmail}
                            disabled
                            className="bg-muted/50 border-border text-muted-foreground"
                          />
                          <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bio
                        </label>
                        <Textarea
                          value={profile.bio}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          placeholder="Tell us about yourself and your research interests..."
                          rows={3}
                          className="bg-background/50 border-border resize-none"
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Location
                          </label>
                          <Input
                            value={profile.location}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            placeholder="Your location"
                            className="bg-background/50 border-border"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Website
                          </label>
                          <Input
                            value={profile.website}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                website: e.target.value,
                              }))
                            }
                            placeholder="https://example.com"
                            className="bg-background/50 border-border"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-[#49BBBD] hover:bg-[#3aa8a9] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            loadProfileData(); // Reload original data
                          }}
                          className="border-border"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Settings className="h-5 w-5 text-[#49BBBD]" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Member Since
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {joinDate}
                      </p>
                    </div>
                    <Calendar className="text-muted-foreground" size={20} />
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Account Status
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user ? "Verified Account" : "Guest Mode"}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                      Active
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Data Sync
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user ? "Enabled across devices" : "Local only"}
                      </p>
                    </div>
                    <Badge className="bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/20">
                      {user ? "Cloud Sync" : "Local"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Research Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Award className="h-5 w-5 text-[#49BBBD]" />
                    Research Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#49BBBD]/10 p-2 rounded-lg">
                        <BookOpen className="text-[#49BBBD]" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Papers Saved
                        </p>
                        <p className="text-2xl font-bold text-[#49BBBD]">
                          {stats.papersSaved}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#49BBBD]/10 p-2 rounded-lg">
                        <Zap className="text-[#49BBBD]" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Current Streak
                        </p>
                        <p className="text-2xl font-bold text-[#49BBBD]">
                          {stats.streak} days
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#49BBBD]/10 p-2 rounded-lg">
                        <User className="text-[#49BBBD]" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Research Level
                        </p>
                        <p className="text-2xl font-bold text-[#49BBBD]">
                          {stats.level}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#49BBBD]/10 p-2 rounded-lg">
                        <Calendar className="text-[#49BBBD]" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Reading Time
                        </p>
                        <p className="text-2xl font-bold text-[#49BBBD]">
                          {stats.readingTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#49BBBD]/10 p-2 rounded-lg">
                        <Award className="text-[#49BBBD]" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Total XP
                        </p>
                        <p className="text-2xl font-bold text-[#49BBBD]">
                          {stats.xp}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-900 dark:text-white">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    App Settings
                  </Button>
                  {!user && (
                    <Button className="w-full bg-[#49BBBD] hover:bg-[#3aa8a9] text-white">
                      <User className="w-4 h-4 mr-2" />
                      Sign In to Sync
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
