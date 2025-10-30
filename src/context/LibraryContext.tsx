"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Paper {
  id: string;
  title: string;
  author: string;
}

interface LibraryContextType {
  savedPapers: Paper[];
  savePaper: (paper: Paper) => void;
  removePaper: (id: string) => void;
  clearLibrary: () => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const LibraryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [savedPapers, setSavedPapers] = useState<Paper[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("savedPapers");
    if (stored) setSavedPapers(JSON.parse(stored));
  }, []);

  const savePaper = (paper: Paper) => {
    const exists = savedPapers.some((p) => p.id === paper.id);
    if (!exists) {
      const updated = [...savedPapers, paper];
      setSavedPapers(updated);
      localStorage.setItem("savedPapers", JSON.stringify(updated));
    }
  };

  const removePaper = (id: string) => {
    const updated = savedPapers.filter((p) => p.id !== id);
    setSavedPapers(updated);
    localStorage.setItem("savedPapers", JSON.stringify(updated));
  };

  const clearLibrary = () => {
    setSavedPapers([]);
    localStorage.removeItem("savedPapers");
  };

  return (
    <LibraryContext.Provider
      value={{ savedPapers, savePaper, removePaper, clearLibrary }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside LibraryProvider");
  return ctx;
};
