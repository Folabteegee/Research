// lib/firestore.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { increment } from "firebase/firestore";

// User data structure - UPDATED: Added collections
export interface UserData {
  savedPapers: any[];
  xp: number;
  achievements: any[];
  streak: number;
  lastVisit: string;
  reads: number;
  searches: number;
  collections: any[];
  createdAt: any;
  updatedAt: any;
}

// Default user data - UPDATED: Added collections
const defaultUserData: UserData = {
  savedPapers: [],
  xp: 0,
  achievements: [],
  streak: 0,
  lastVisit: new Date().toDateString(),
  reads: 0,
  searches: 0,
  collections: [],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

// Get user document reference
const getUserDoc = (userId: string) => doc(db, "users", userId);

// Get user data from Firestore - FIXED: Better error handling and data validation
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log("📡 Fetching user data from Firestore for:", userId);
    const userDoc = await getDoc(getUserDoc(userId));

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("📦 Retrieved user data:", data);

      // Validate and ensure all fields have proper defaults
      const userData: UserData = {
        savedPapers: Array.isArray(data.savedPapers) ? data.savedPapers : [],
        xp: typeof data.xp === "number" ? data.xp : 0,
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        streak: typeof data.streak === "number" ? data.streak : 0,
        lastVisit:
          typeof data.lastVisit === "string"
            ? data.lastVisit
            : new Date().toDateString(),
        reads: typeof data.reads === "number" ? data.reads : 0,
        searches: typeof data.searches === "number" ? data.searches : 0,
        collections: Array.isArray(data.collections) ? data.collections : [],
        createdAt: data.createdAt || serverTimestamp(),
        updatedAt: data.updatedAt || serverTimestamp(),
      };

      return userData;
    } else {
      console.log("👤 No existing user document, creating default...");
      // Create new user document with default data
      try {
        await setDoc(getUserDoc(userId), {
          ...defaultUserData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log("✅ New user document created with default data");
        return defaultUserData;
      } catch (createError) {
        console.error("❌ Error creating user document:", createError);
        return null;
      }
    }
  } catch (error) {
    console.error("❌ Error getting user data from Firestore:", error);
    return null;
  }
};

// Save user data to Firestore - FIXED: Complete data saving with validation
export const saveUserData = async (
  userId: string,
  data: Partial<UserData>
): Promise<boolean> => {
  try {
    console.log("💾 Saving user data to Firestore:", data);
    const userDoc = getUserDoc(userId);

    // Prepare clean data with validation
    const cleanData: any = {
      updatedAt: serverTimestamp(),
    };

    // Only include defined values with proper validation
    if (Array.isArray(data.savedPapers)) {
      cleanData.savedPapers = data.savedPapers;
    }
    if (typeof data.xp === "number") {
      cleanData.xp = data.xp;
    }
    if (Array.isArray(data.achievements)) {
      cleanData.achievements = data.achievements;
    }
    if (typeof data.streak === "number") {
      cleanData.streak = data.streak;
    }
    if (typeof data.lastVisit === "string") {
      cleanData.lastVisit = data.lastVisit;
    }
    if (typeof data.reads === "number") {
      cleanData.reads = data.reads;
    }
    if (typeof data.searches === "number") {
      cleanData.searches = data.searches;
    }
    if (Array.isArray(data.collections)) {
      cleanData.collections = data.collections;
    }

    // If no createdAt, set it (for new users)
    if (!data.createdAt) {
      const existingDoc = await getDoc(userDoc);
      if (!existingDoc.exists()) {
        cleanData.createdAt = serverTimestamp();
      }
    }

    console.log("🧹 Clean data to save:", cleanData);
    await setDoc(userDoc, cleanData, { merge: true });
    console.log("✅ User data saved successfully");
    return true;
  } catch (error) {
    console.error("❌ Error saving user data to Firestore:", error);
    return false;
  }
};

// Add XP to user - FIXED: Proper error handling
export const addUserXP = async (
  userId: string,
  points: number
): Promise<boolean> => {
  try {
    const userDoc = getUserDoc(userId);
    await updateDoc(userDoc, {
      xp: increment(points),
      updatedAt: serverTimestamp(),
    });
    console.log(`✅ Added ${points} XP to user ${userId}`);
    return true;
  } catch (error) {
    console.error("❌ Error adding XP:", error);
    return false;
  }
};

// Add saved paper - FIXED: Better paper data structure
export const addSavedPaper = async (
  userId: string,
  paper: any
): Promise<boolean> => {
  try {
    const userDoc = getUserDoc(userId);

    const paperData = {
      id: paper.id || `paper-${Date.now()}`,
      title: paper.title || paper.display_name || "Untitled Paper",
      author: paper.author || "Unknown author",
      year: paper.year || paper.publication_year || "N/A",
      journal: paper.journal || paper.host_venue?.display_name || "N/A",
      link: paper.link || paper.primary_location?.landing_page_url || "",
      abstract: paper.abstract || "",
      tags: paper.tags || [],
      savedAt: paper.savedAt || new Date().toISOString(),
    };

    await updateDoc(userDoc, {
      savedPapers: arrayUnion(paperData),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Paper saved to Firestore:", paperData.title);
    return true;
  } catch (error) {
    console.error("❌ Error saving paper to Firestore:", error);
    return false;
  }
};

// Remove saved paper - FIXED: Complete implementation
export const removeSavedPaper = async (
  userId: string,
  paperId: string
): Promise<boolean> => {
  try {
    const userData = await getUserData(userId);
    if (!userData) return false;

    const updatedPapers = userData.savedPapers.filter(
      (p: any) => p.id !== paperId
    );
    await saveUserData(userId, { savedPapers: updatedPapers });
    console.log("✅ Paper removed from Firestore:", paperId);
    return true;
  } catch (error) {
    console.error("❌ Error removing paper from Firestore:", error);
    return false;
  }
};

// Update streak - FIXED: Complete implementation
export const updateUserStreak = async (userId: string): Promise<number> => {
  try {
    const userData = await getUserData(userId);
    if (!userData) return 0;

    const today = new Date().toDateString();
    let streak = userData.streak || 0;
    const lastVisit = userData.lastVisit;

    if (lastVisit !== today) {
      const lastDate = lastVisit ? new Date(lastVisit) : null;
      const todayMidnight = new Date().setHours(0, 0, 0, 0);
      const lastMidnight = lastDate ? lastDate.setHours(0, 0, 0, 0) : null;

      if (
        lastMidnight &&
        todayMidnight - lastMidnight === 24 * 60 * 60 * 1000
      ) {
        streak += 1;
      } else if (
        lastMidnight &&
        todayMidnight - lastMidnight > 24 * 60 * 60 * 1000
      ) {
        streak = 1; // Reset if more than one day missed
      } else {
        streak = 1; // First visit or same day
      }

      await saveUserData(userId, {
        streak,
        lastVisit: today,
      });

      console.log(`✅ Streak updated to ${streak} days`);
    }

    return streak;
  } catch (error) {
    console.error("❌ Error updating streak:", error);
    return 0;
  }
};

// Add collection - NEW: Collection management
export const addCollection = async (
  userId: string,
  collection: any
): Promise<boolean> => {
  try {
    const userDoc = getUserDoc(userId);

    const collectionData = {
      id: collection.id || `collection-${Date.now()}`,
      name: collection.name || "Unnamed Collection",
      description: collection.description || "",
      color: collection.color || "#49BBBD",
      papers: collection.papers || [],
      tags: collection.tags || [],
      createdAt: collection.createdAt || new Date().toISOString(),
      updatedAt: collection.updatedAt || new Date().toISOString(),
      paperCount: collection.paperCount || 0,
    };

    await updateDoc(userDoc, {
      collections: arrayUnion(collectionData),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Collection saved to Firestore:", collectionData.name);
    return true;
  } catch (error) {
    console.error("❌ Error saving collection to Firestore:", error);
    return false;
  }
};
