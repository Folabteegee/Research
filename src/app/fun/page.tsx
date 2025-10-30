"use client";
import { useEffect, useState } from "react";

export default function FunPage() {
  const [quote, setQuote] = useState("");
  const [fact, setFact] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    async function loadFunStuff() {
      const q = await fetch("https://api.quotable.io/random?tags=science");
      const f = await fetch(
        "https://uselessfacts.jsph.pl/random.json?language=en"
      );
      const i = await fetch(
        "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
      );

      const qd = await q.json();
      const fd = await f.json();
      const id = await i.json();

      setQuote(qd.content);
      setFact(fd.text);
      setImage(id.url);
    }
    loadFunStuff();
  }, []);

  return (
    <div className="p-8 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold mb-6">🎮 Fun Zone</h1>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow max-w-xl">
        <p className="italic mb-4">💬 “{quote}”</p>
        <p className="mb-4">🧠 {fact}</p>
        {image && <img src={image} alt="NASA" className="rounded-xl mt-4" />}
      </div>
    </div>
  );
}
