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

// User data structure
export interface UserData {
  savedPapers: any[];
  xp: number;
  achievements: any[];
  streak: number;
  lastVisit: string;
  reads: number;
  searches: number;
  createdAt: any;
  updatedAt: any;
}

// Default user data
const defaultUserData: UserData = {
  savedPapers: [],
  xp: 0,
  achievements: [],
  streak: 0,
  lastVisit: new Date().toDateString(),
  reads: 0,
  searches: 0,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

// Get user document reference
const getUserDoc = (userId: string) => doc(db, "users", userId);

// Get user data from Firestore
export const getUserData = async (userId: string): Promise<UserData> => {
  try {
    const userDoc = await getDoc(getUserDoc(userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      // Create new user document with default data
      await setDoc(getUserDoc(userId), defaultUserData);
      return defaultUserData;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return defaultUserData;
  }
};

// Save user data to Firestore
export const saveUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    const userDoc = getUserDoc(userId);
    await updateDoc(userDoc, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

// Add XP to user
export const addUserXP = async (userId: string, points: number) => {
  try {
    const userDoc = getUserDoc(userId);
    await updateDoc(userDoc, {
      xp: increment(points),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding XP:", error);
  }
};

// Add saved paper
export const addSavedPaper = async (userId: string, paper: any) => {
  try {
    const userDoc = getUserDoc(userId);
    await updateDoc(userDoc, {
      savedPapers: arrayUnion(paper),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving paper:", error);
  }
};

// Remove saved paper
export const removeSavedPaper = async (userId: string, paperId: string) => {
  try {
    const userData = await getUserData(userId);
    const updatedPapers = userData.savedPapers.filter(
      (p: any) => p.id !== paperId
    );
    await saveUserData(userId, { savedPapers: updatedPapers });
  } catch (error) {
    console.error("Error removing paper:", error);
  }
};

// Update streak
export const updateUserStreak = async (userId: string) => {
  try {
    const userData = await getUserData(userId);
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
      } else {
        streak = 1;
      }

      await saveUserData(userId, {
        streak,
        lastVisit: today,
      });
    }

    return streak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return 0;
  }
};

// Import this at the top of the file
import { increment } from "firebase/firestore";
