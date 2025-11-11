"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  User,
  Bell,
  Shield,
  Database,
  Download,
  Trash2,
  Zap,
  Settings,
  BookOpen,
  Palette,
  Languages,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [fontSize, setFontSize] = useState("medium");
  const [soundEffects, setSoundEffects] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load settings from localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedNotifications =
      localStorage.getItem("notifications") !== "false";
    const savedAutoSave = localStorage.getItem("autoSave") !== "false";
    const savedReadingMode = localStorage.getItem("readingMode") === "true";
    const savedLanguage = localStorage.getItem("language") || "english";
    const savedFontSize = localStorage.getItem("fontSize") || "medium";
    const savedSoundEffects = localStorage.getItem("soundEffects") !== "false";

    setDarkMode(savedDarkMode);
    setNotifications(savedNotifications);
    setAutoSave(savedAutoSave);
    setReadingMode(savedReadingMode);
    setLanguage(savedLanguage);
    setFontSize(savedFontSize);
    setSoundEffects(savedSoundEffects);
  }, []);

  const handleSettingChange = (setting: string, value: any) => {
    localStorage.setItem(setting, value.toString());

    // Apply dark mode immediately
    if (setting === "darkMode") {
      if (value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const exportData = () => {
    const userLibraryKey = user
      ? `savedPapers_${user.uid}`
      : "savedPapers_guest";
    const stored = localStorage.getItem(userLibraryKey);
    const savedPapers = stored ? JSON.parse(stored) : [];

    const dataStr = JSON.stringify(savedPapers, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `research-library-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const clearData = () => {
    if (showConfirmation) {
      const userLibraryKey = user
        ? `savedPapers_${user.uid}`
        : "savedPapers_guest";
      localStorage.removeItem(userLibraryKey);
      localStorage.removeItem(user ? `reads_${user.uid}` : "reads_guest");
      localStorage.removeItem(user ? `searches_${user.uid}` : "searches_guest");
      setShowConfirmation(false);
      alert("All your data has been cleared successfully.");
    } else {
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    }
  };

  const SettingSection = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#49BBBD] p-2 rounded-lg">
          <Icon className="text-white" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );

  const ToggleSwitch = ({
    enabled,
    setEnabled,
    settingKey,
  }: {
    enabled: boolean;
    setEnabled: (value: boolean) => void;
    settingKey: string;
  }) => (
    <button
      onClick={() => {
        const newValue = !enabled;
        setEnabled(newValue);
        handleSettingChange(settingKey, newValue);
      }}
      className={`w-14 h-8 rounded-full relative transition-colors duration-200 ${
        enabled ? "bg-[#49BBBD]" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-200 ${
          enabled ? "translate-x-6" : ""
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-white dark:bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(#49BBBD_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] opacity-5"></div>
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your research companion experience
          </p>
        </motion.header>

        {/* Appearance Settings */}
        <SettingSection title="Appearance" icon={Palette}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
              <ToggleSwitch
                enabled={darkMode}
                setEnabled={setDarkMode}
                settingKey="darkMode"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Reading Mode
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Distraction-free reading experience
                </p>
              </div>
              <ToggleSwitch
                enabled={readingMode}
                setEnabled={setReadingMode}
                settingKey="readingMode"
              />
            </div>

            <div>
              <label className="font-medium text-gray-900 dark:text-white mb-2 block">
                Font Size
              </label>
              <select
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  handleSettingChange("fontSize", e.target.value);
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#49BBBD]"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>
          </div>
        </SettingSection>

        {/* Notifications & Sounds */}
        <SettingSection title="Notifications & Sounds" icon={Bell}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Notifications
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive updates and recommendations
                </p>
              </div>
              <ToggleSwitch
                enabled={notifications}
                setEnabled={setNotifications}
                settingKey="notifications"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Sound Effects
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Play sounds for interactions
                </p>
              </div>
              <div className="flex items-center gap-2">
                {soundEffects ? (
                  <Volume2 size={20} className="text-gray-400" />
                ) : (
                  <VolumeX size={20} className="text-gray-400" />
                )}
                <ToggleSwitch
                  enabled={soundEffects}
                  setEnabled={setSoundEffects}
                  settingKey="soundEffects"
                />
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Research Settings */}
        <SettingSection title="Research Preferences" icon={BookOpen}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Auto-save Papers
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically save papers to your library
                </p>
              </div>
              <ToggleSwitch
                enabled={autoSave}
                setEnabled={setAutoSave}
                settingKey="autoSave"
              />
            </div>

            <div>
              <label className="font-medium text-gray-900 dark:text-white mb-2 block">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  handleSettingChange("language", e.target.value);
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#49BBBD]"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
              </select>
            </div>
          </div>
        </SettingSection>

        {/* Account & Integration */}
        <SettingSection title="Account & Integration" icon={User}>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Zotero Integration
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sync with your Zotero library
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                Connected
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  OpenAlex API
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Research paper database
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                Connected
              </span>
            </div>

            {user && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
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

        {/* Data Management */}
        <SettingSection title="Data Management" icon={Database}>
          <div className="space-y-4">
            <button
              onClick={exportData}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="text-[#49BBBD]" size={20} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Export Library
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Download your saved papers as JSON
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={clearData}
              className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900 rounded-xl hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="text-red-600 dark:text-red-400" size={20} />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">
                    {showConfirmation
                      ? "Confirm Clear Data?"
                      : "Clear All Data"}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {showConfirmation
                      ? "Click again to confirm"
                      : "Permanently delete all your data"}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </SettingSection>

        {/* Privacy & Security */}
        <SettingSection title="Privacy & Security" icon={Shield}>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="font-medium text-gray-900 dark:text-white">
                Data Storage
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your data is stored locally in your browser. We don't collect
                any personal information.
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="font-medium text-gray-900 dark:text-white">
                Privacy Policy
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8"
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
