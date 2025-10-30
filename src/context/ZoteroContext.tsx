"use client";
import { createContext, useState, useContext, ReactNode } from "react";
import { getZoteroCollection } from "@/lib/api/zotero";

interface ZoteroContextType {
  library: any[];
  getLibrary: (userId: string) => Promise<void>;
}

const ZoteroContext = createContext<ZoteroContextType | undefined>(undefined);

export const ZoteroProvider = ({ children }: { children: ReactNode }) => {
  const [library, setLibrary] = useState<any[]>([]);

  const getLibrary = async (userId: string) => {
    const data = await getZoteroCollection(userId);
    setLibrary(data);
  };

  return (
    <ZoteroContext.Provider value={{ library, getLibrary }}>
      {children}
    </ZoteroContext.Provider>
  );
};

export const useZotero = () => {
  const context = useContext(ZoteroContext);
  if (!context) throw new Error("useZotero must be used inside ZoteroProvider");
  return context;
};
