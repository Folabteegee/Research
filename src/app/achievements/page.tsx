"use client";
import { useEffect, useState } from "react";
import {
  getUserXP,
  getLevel,
  getAchievements,
  updateStreak,
} from "@/lib/gamification";
import XPBar from "@/components/XPBar";

export default function AchievementsPage() {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  // load user data + listen for updates
  useEffect(() => {
    const loadData = () => {
      const x = getUserXP();
      const l = getLevel(x);
      const s = updateStreak();
      setXP(x);
      setLevel(l);
      setStreak(s);
      setAchievements(getAchievements());
    };

    loadData();

    // listen for localStorage updates (from other tabs/pages)
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center text-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-4xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">
        🏆 Your Achievements
      </h1>

      {/* XP + Level cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-lg font-semibold">XP</h2>
          <p className="text-3xl font-bold text-indigo-600">{xp}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-lg font-semibold">Level</h2>
          <p className="text-3xl font-bold text-indigo-600">{level}</p>
        </div>
      </div>

      {/* XP Progress bar */}
      <XPBar xp={xp} />

      {/* Streak */}
      <div className="mt-6 mb-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md w-full max-w-xs">
        <h3 className="text-lg font-semibold mb-1">🔥 Streak</h3>
        <p className="text-xl font-bold text-orange-500">{streak} day(s)</p>
      </div>

      {/* Achievements Grid */}
      <h3 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">
        🎖️ Badges
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl shadow-md transform transition duration-300 hover:scale-105 ${
              a.unlocked
                ? "bg-green-100 dark:bg-green-900 text-green-800 animate-bounce"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 opacity-70"
            }`}
          >
            <div className="text-4xl mb-2">{a.icon}</div>
            <h4 className="font-semibold">{a.name}</h4>
            <p className="text-sm">{a.description}</p>
          </div>
        ))}
      </div>

      {/* Encouragement */}
      <p className="mt-10 text-gray-600 dark:text-gray-400 text-sm">
        Keep exploring papers and saving research to unlock new levels and
        badges 🚀
      </p>
    </div>
  );
}
