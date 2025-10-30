"use client";
import { createContext, useContext, useState } from "react";
import { searchPapers } from "@/lib/api/openAlex";
import { getDailyQuote } from "@/lib/api/quotes";

const ApiContext = createContext<any>(null);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [papers, setPapers] = useState([]);
  const [quote, setQuote] = useState("");

  const fetchPapers = async (query: string) => {
    const data = await searchPapers(query);
    setPapers(data.results || []);
  };

  const fetchQuote = async () => {
    const data = await getDailyQuote();
    setQuote(data[0]?.q + " — " + data[0]?.a);
  };

  return (
    <ApiContext.Provider value={{ papers, fetchPapers, quote, fetchQuote }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
