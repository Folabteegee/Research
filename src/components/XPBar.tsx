"use client";
import React from "react";

export default function XPBar({ xp }: { xp: number }) {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  return (
    <div className="w-full max-w-md mt-4">
      <div className="flex justify-between mb-1 text-sm">
        <span>Level {level}</span>
        <span>{progress}/100 XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
        <div
          className="bg-indigo-600 h-4 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
