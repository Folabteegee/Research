"use client";

import { useEffect, useState } from "react";
import { getDailyQuote } from "@/lib/api/quotes";

export default function QuoteTicker() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const data = await getDailyQuote();
        if (Array.isArray(data) && data[0]) {
          setQuote(data[0].q);
          setAuthor(data[0].a);
        }
      } catch (err) {
        console.error("Quote fetch error:", err);
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 20000);
    return () => clearInterval(interval);
  }, []);

  if (!quote) return null; // render nothing until client fetches quote

  return (
    <div className="absolute top-4 w-full overflow-hidden">
      <div className="whitespace-nowrap animate-marquee text-lg italic font-medium text-indigo-700 dark:text-indigo-300">
        “{quote}” — {author}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
