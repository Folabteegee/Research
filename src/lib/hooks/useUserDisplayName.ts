"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export function useUserDisplayName() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("Researcher");

  useEffect(() => {
    if (user) {
      const savedDisplayName = localStorage.getItem(
        `userDisplayName_${user.uid}`
      );
      if (savedDisplayName) {
        setDisplayName(savedDisplayName);
      } else {
        const nameFromEmail = user.email
          ? user.email.split("@")[0]
          : "Researcher";
        setDisplayName(nameFromEmail);
      }
    }
  }, [user]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        const savedDisplayName = localStorage.getItem(
          `userDisplayName_${user.uid}`
        );
        if (savedDisplayName) {
          setDisplayName(savedDisplayName);
        }
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [user]);

  return displayName;
}
