// src/lib/gamification.ts
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export const baseAchievements: Achievement[] = [
  {
    id: "first-read",
    name: "First Read 📖",
    description: "Read your first paper!",
    icon: "📘",
    unlocked: false,
  },
  {
    id: "five-saved",
    name: "Collector 💾",
    description: "Saved 5 papers to your library.",
    icon: "💾",
    unlocked: false,
  },
  {
    id: "ten-read",
    name: "Scholar 🎓",
    description: "Read 10 papers!",
    icon: "🎓",
    unlocked: false,
  },
  {
    id: "streak-3",
    name: "Consistent 🔥",
    description: "Logged in 3 days in a row.",
    icon: "🔥",
    unlocked: false,
  },
];

// --- safe localStorage helpers ---
function safeGetItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    // noop
  }
}

// --- XP & level ---
export function getUserXP(): number {
  const raw = safeGetItem("userXP") || "0";
  const val = parseInt(raw, 10);
  return Number.isNaN(val) ? 0 : val;
}

function setUserXP(xp: number) {
  safeSetItem("userXP", String(xp));
}

export function addXP(points: number) {
  const current = getUserXP();
  const updated = current + Math.max(0, Math.floor(points));
  setUserXP(updated);

  // Check for achievements that depend on XP
  checkXPBasedAchievements(updated);

  // Notify other tabs/windows (storage event)
  try {
    // write a small timestamp key to trigger storage event across tabs
    safeSetItem("lastXPUpdate", String(Date.now()));
  } catch {
    /* noop */
  }

  return updated;
}

export function getLevel(xp: number): number {
  // 100 XP per level (level 1 = 0-99 xp)
  const value = Math.floor(xp / 100) + 1;
  return value >= 1 ? value : 1;
}

// --- Achievements storage & helpers ---
export function getAchievements(): Achievement[] {
  try {
    const storedRaw = safeGetItem("achievements");
    const stored = storedRaw ? JSON.parse(storedRaw) : [];
    // merge with baseAchievements so new badges are added automatically
    const merged = baseAchievements.map((base) => {
      const found = Array.isArray(stored)
        ? stored.find((s: Achievement) => s.id === base.id)
        : undefined;
      return found ? { ...base, unlocked: !!found.unlocked } : { ...base };
    });
    return merged;
  } catch {
    // fallback to defaults
    return baseAchievements.map((b) => ({ ...b }));
  }
}

function saveAchievements(list: Achievement[]) {
  safeSetItem("achievements", JSON.stringify(list));
}

export function unlockAchievement(id: string) {
  const list = getAchievements();
  let changed = false;
  const updated = list.map((a) => {
    if (a.id === id && !a.unlocked) {
      changed = true;
      return { ...a, unlocked: true };
    }
    return a;
  });
  if (changed) {
    saveAchievements(updated);
    // also trigger storage event across tabs
    safeSetItem(
      "lastAchievementUnlock",
      JSON.stringify({ id, at: Date.now() })
    );
  }
  return updated;
}

// --- XP-based achievement checks ---
function checkXPBasedAchievements(currentXP: number) {
  // first-read (>=10 xp)
  if (currentXP >= 10) unlockAchievement("first-read");
  // ten-read (>=100 xp) -> corresponds roughly to 10 reads at 10xp each
  if (currentXP >= 100) unlockAchievement("ten-read");
  // other XP thresholds can be added here
}

// --- Saved-papers related checks ---
export function getSavedPapersCount(): number {
  try {
    const raw = safeGetItem("savedPapers");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Call this after saving/removing papers so achievements based on saved count are checked.
 */
export function checkSavedAchievements() {
  const count = getSavedPapersCount();
  if (count >= 5) unlockAchievement("five-saved");
  // more saved thresholds can be added here
}

// --- Streak (safe and tolerant) ---
export function updateStreak() {
  try {
    const today = new Date();
    const todayStr = today.toDateString();

    const lastRaw = safeGetItem("lastVisit");
    const lastDate = lastRaw ? new Date(lastRaw) : null;
    let streak = parseInt(safeGetItem("streak") || "0", 10);
    if (Number.isNaN(streak)) streak = 0;

    if (!lastDate || lastDate.toDateString() !== todayStr) {
      // difference in days (use UTC midnight to avoid timezone edge issues)
      const lastMidnight = lastDate
        ? Date.UTC(
            lastDate.getFullYear(),
            lastDate.getMonth(),
            lastDate.getDate()
          )
        : null;
      const todayMidnight = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      if (
        lastMidnight &&
        todayMidnight - lastMidnight === 24 * 60 * 60 * 1000
      ) {
        // exactly 1 day difference
        streak = streak + 1;
      } else {
        // reset or first visit
        streak = 1;
      }

      safeSetItem("streak", String(streak));
      safeSetItem("lastVisit", todayStr);

      if (streak >= 3) unlockAchievement("streak-3");
    }

    return streak;
  } catch {
    return parseInt(safeGetItem("streak") || "0", 10) || 0;
  }
}

// --- utility to reset (dev/testing) ---
export function resetGamification() {
  safeSetItem("userXP", "0");
  safeSetItem(
    "achievements",
    JSON.stringify(baseAchievements.map((b) => ({ ...b })))
  );
  safeSetItem("streak", "0");
  safeSetItem("lastVisit", "");
}

// export additional helpers if needed
export default {
  getUserXP,
  addXP,
  getLevel,
  getAchievements,
  unlockAchievement,
  updateStreak,
  checkSavedAchievements,
  getSavedPapersCount,
  resetGamification,
};
