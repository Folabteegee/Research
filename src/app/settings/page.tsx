"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="max-w-lg mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl mt-10 shadow">
      <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

      <div className="flex justify-between items-center mb-4">
        <p>Dark Mode</p>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-14 h-8 rounded-full ${
            darkMode ? "bg-blue-600" : "bg-gray-300"
          } relative transition`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition ${
              darkMode ? "translate-x-6" : ""
            }`}
          ></span>
        </button>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Connected Accounts</h2>
        <p className="text-sm text-gray-500">Zotero: Connected ✅</p>
        <p className="text-sm text-gray-500">OpenAlex: Connected ✅</p>
      </div>
    </div>
  );
}
