"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext"; // IMPORT THE THEME CONTEXT
import { motion } from "framer-motion";
import { useSync } from "@/lib/hooks/useSync";
import { Cloud, RefreshCw } from "lucide-react";
import {
  User,
  Bell,
  Shield,
  Database,
  Download,
  Trash2,
  Zap,
  Settings,
  Palette,
  Volume2,
  Check,
  X,
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  // USE THE THEME CONTEXT INSTEAD OF LOCAL STATE
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [fontSize, setFontSize] = useState("medium");
  const [soundEffects, setSoundEffects] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();

  // Initialize settings from localStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load other settings from localStorage with defaults
    const savedNotifications =
      localStorage.getItem("notifications") !== "false";
    const savedAutoSave = localStorage.getItem("autoSave") !== "false";
    const savedReadingMode = localStorage.getItem("readingMode") === "true";
    const savedLanguage = localStorage.getItem("language") || "english";
    const savedFontSize = localStorage.getItem("fontSize") || "medium";
    const savedSoundEffects = localStorage.getItem("soundEffects") !== "false";

    setNotifications(savedNotifications);
    setAutoSave(savedAutoSave);
    setReadingMode(savedReadingMode);
    setLanguage(savedLanguage);
    setFontSize(savedFontSize);
    setSoundEffects(savedSoundEffects);

    // Apply settings immediately (except dark mode - handled by ThemeContext)
    applySettings({
      fontSize: savedFontSize,
      readingMode: savedReadingMode,
    });
  };

  const applySettings = (settings: {
    fontSize: string;
    readingMode: boolean;
  }) => {
    // Apply font size
    document.documentElement.classList.remove(
      "text-sm",
      "text-base",
      "text-lg",
      "text-xl"
    );
    switch (settings.fontSize) {
      case "small":
        document.documentElement.classList.add("text-sm");
        break;
      case "medium":
        document.documentElement.classList.add("text-base");
        break;
      case "large":
        document.documentElement.classList.add("text-lg");
        break;
      case "xlarge":
        document.documentElement.classList.add("text-xl");
        break;
    }

    // Apply reading mode
    if (settings.readingMode) {
      document.documentElement.classList.add("reading-mode");
    } else {
      document.documentElement.classList.remove("reading-mode");
    }
  };

  const handleSettingChange = (setting: string, value: any) => {
    // Save to localStorage
    localStorage.setItem(setting, value.toString());

    if (setting === "fontSize") {
      setFontSize(value);
      document.documentElement.classList.remove(
        "text-sm",
        "text-base",
        "text-lg",
        "text-xl"
      );
      switch (value) {
        case "small":
          document.documentElement.classList.add("text-sm");
          break;
        case "medium":
          document.documentElement.classList.add("text-base");
          break;
        case "large":
          document.documentElement.classList.add("text-lg");
          break;
        case "xlarge":
          document.documentElement.classList.add("text-xl");
          break;
      }
    }

    if (setting === "readingMode") {
      setReadingMode(value);
      if (value) {
        document.documentElement.classList.add("reading-mode");
      } else {
        document.documentElement.classList.remove("reading-mode");
      }
    }

    // Play sound effect for toggle changes if sound is enabled
    if (
      ["notifications", "autoSave", "soundEffects", "readingMode"].includes(
        setting
      ) &&
      soundEffects
    ) {
      playToggleSound();
    }
  };

  const playToggleSound = () => {
    // Create a simple toggle sound
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const exportData = () => {
    try {
      const userLibraryKey = user
        ? `savedPapers_${user.uid}`
        : "savedPapers_guest";
      const stored = localStorage.getItem(userLibraryKey);
      const savedPapers = stored ? JSON.parse(stored) : [];

      // Include collections data
      const collectionsKey = user
        ? `collections_${user.uid}`
        : "collections_guest";
      const storedCollections = localStorage.getItem(collectionsKey);
      const collections = storedCollections
        ? JSON.parse(storedCollections)
        : [];

      // Include reading history
      const readsKey = user ? `reads_${user.uid}` : "reads_guest";
      const storedReads = localStorage.getItem(readsKey);
      const readingHistory = storedReads ? JSON.parse(storedReads) : [];

      const exportData = {
        savedPapers,
        collections,
        readingHistory,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `research-companion-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();

      // Show success feedback
      if (notifications) {
        alert("✅ Data exported successfully!");
      }
    } catch (error) {
      alert("❌ Error exporting data. Please try again.");
    }
  };

  const { syncToCloud, syncFromCloud, isSyncing, lastSynced } = useSync();

  const clearData = () => {
    if (showConfirmation) {
      try {
        const userId = user?.uid;

        // Clear all application data
        const appKeys = [
          userId ? `savedPapers_${userId}` : "savedPapers_guest",
          userId ? `collections_${userId}` : "collections_guest",
          userId ? `reads_${userId}` : "reads_guest",
          userId ? `searches_${userId}` : "searches_guest",
        ];

        // Clear gamification data
        const gamificationKeys = [
          userId ? `userXP_${userId}` : "userXP_guest",
          userId ? `achievements_${userId}` : "achievements_guest",
          userId ? `streak_${userId}` : "streak_guest",
          userId ? `lastVisit_${userId}` : "lastVisit_guest",
          "lastXPUpdate",
          "lastAchievementUnlock",
        ];

        // Clear profile picture
        if (userId) {
          localStorage.removeItem(`profilePic_${userId}`);
        }

        // Remove all items
        [...appKeys, ...gamificationKeys].forEach((key) => {
          localStorage.removeItem(key);
        });

        setShowConfirmation(false);

        if (notifications) {
          alert(
            "✅ All your data has been cleared successfully! Starting fresh with a clean slate."
          );
        }

        // Refresh the page to reflect changes
        window.location.reload();
      } catch (error) {
        alert("❌ Error clearing data. Please try again.");
      }
    } else {
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 5000);
    }
  };

  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      const defaultSettings = {
        notifications: true,
        autoSave: true,
        readingMode: false,
        language: "english",
        fontSize: "medium",
        soundEffects: true,
      };

      Object.entries(defaultSettings).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
      });

      // Reset theme to light
      setTheme("light");

      loadSettings();

      if (notifications) {
        alert("✅ Settings reset to default successfully!");
      }
    }
  };

  const SettingSection = ({
    title,
    icon: Icon,
    children,
    className = "",
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    className?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-border/50 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#49BBBD] p-2 rounded-lg">
          <Icon className="text-white" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.div>
  );

  const SettingToggle = ({
    label,
    description,
    enabled,
    onEnabledChange,
    settingKey,
  }: {
    label: string;
    description: string;
    enabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
    settingKey: string;
  }) => (
    <div className="flex justify-between items-center py-3">
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={(checked) => {
          onEnabledChange(checked);
          handleSettingChange(settingKey, checked);
        }}
        className="data-[state=checked]:bg-[#49BBBD]"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#49BBBD]/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg">
              <Settings className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Settings</h1>
          <p className="text-muted-foreground">
            Customize your research companion experience
          </p>
        </motion.header>

        {/* Confirmation Alert */}
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Alert className="bg-destructive/10 border-destructive/20">
              <AlertDescription className="text-destructive-foreground">
                <div className="flex items-center justify-between">
                  <span>
                    Are you sure you want to clear all data? This action cannot
                    be undone.
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfirmation(false)}
                      className="border-border"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={clearData}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Appearance Settings */}
        <SettingSection title="Appearance" icon={Palette}>
          <div className="space-y-2">
            {/* USE THEME CONTEXT FOR DARK MODE */}
            <div className="flex justify-between items-center py-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => {
                  setTheme(checked ? "dark" : "light");
                }}
                className="data-[state=checked]:bg-[#49BBBD]"
              />
            </div>

            <div className="py-3">
              <label className="font-medium text-foreground mb-2 block">
                Font Size
              </label>
              <Select
                value={fontSize}
                onValueChange={(value) => {
                  setFontSize(value);
                  handleSettingChange("fontSize", value);
                }}
              >
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingSection>

        {/* Account & Integration */}
        <SettingSection title="Account & Integration" icon={User}>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">
                  Zotero Integration
                </p>
                <p className="text-sm text-muted-foreground">
                  Sync with your Zotero library
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
              >
                Coming Soon
              </Badge>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">OpenAlex</p>
                <p className="text-sm text-muted-foreground">
                  Research paper database
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Check className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>

            {user && (
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Logged in as
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </SettingSection>

        <SettingSection title="Cloud Sync" icon={Cloud}>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Cross-Device Sync
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your research library, achievements, and progress sync across
                all devices. Login with the same account anywhere to continue
                your research.
              </p>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">Sync Status</p>
                <p className="text-sm text-muted-foreground">
                  {isSyncing
                    ? "Syncing..."
                    : lastSynced
                    ? `Last synced: ${new Date(
                        lastSynced
                      ).toLocaleTimeString()}`
                    : "Not synced yet"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={syncFromCloud}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                  className="border-border"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${
                      isSyncing ? "animate-spin" : ""
                    }`}
                  />
                  Pull
                </Button>
                <Button
                  onClick={syncToCloud}
                  disabled={isSyncing}
                  variant="default"
                  size="sm"
                  className="bg-[#49BBBD] hover:bg-[#3aa8a9]"
                >
                  <Cloud className="w-4 h-4 mr-1" />
                  Push
                </Button>
              </div>
            </div>

            {user && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 text-center">
                  ✅ Signed in as {user.email} - Data will sync automatically
                </p>
              </div>
            )}
          </div>
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data Management" icon={Database}>
          <div className="space-y-3">
            <Button
              onClick={exportData}
              variant="outline"
              className="w-full justify-start h-12 border-border"
            >
              <Download className="w-4 h-4 mr-3 text-[#49BBBD]" />
              <div className="text-left">
                <p className="font-medium text-foreground">Export Library</p>
                <p className="text-sm text-muted-foreground">
                  Download your research data as JSON
                </p>
              </div>
            </Button>

            <Button
              onClick={resetSettings}
              variant="outline"
              className="w-full justify-start h-12 border-border"
            >
              <Zap className="w-4 h-4 mr-3 text-orange-500" />
              <div className="text-left">
                <p className="font-medium text-foreground">Reset Settings</p>
                <p className="text-sm text-muted-foreground">
                  Restore all settings to default
                </p>
              </div>
            </Button>

            <Button
              onClick={clearData}
              variant="outline"
              className="w-full justify-start h-12 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              <div className="text-left">
                <p className="font-medium text-destructive">Clear All Data</p>
                <p className="text-sm text-destructive/80">
                  {showConfirmation
                    ? "Click again to confirm"
                    : "Permanently delete all data"}
                </p>
              </div>
            </Button>
          </div>
        </SettingSection>

        {/* Privacy & Security */}
        <SettingSection title="Privacy & Security" icon={Shield}>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium text-foreground">Data Storage</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is stored locally in your browser. We don't collect
                any personal information.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium text-foreground">Privacy Policy</p>
              <p className="text-sm text-muted-foreground mt-1">
                This app respects your privacy. All processing happens on your
                device.
              </p>
            </div>
          </div>
        </SettingSection>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          <p>Research Companion v1.0.0</p>
          <p className="mt-1">
            Built with ❤️ by Taiwo G. Afolabi for researchers
          </p>
        </motion.div>
      </div>
    </div>
  );
}
