"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Afolabi Taiwo Glory",
    email: "taiwoglory136@gmail.com",
    bio: "Frontend engineer & research enthusiast.",
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl mt-10 shadow-lg">
      <h1 className="text-2xl font-bold mb-6">👤 Profile</h1>
      <input
        className="w-full p-2 mb-3 border rounded-xl"
        value={profile.name}
      />
      <input
        className="w-full p-2 mb-3 border rounded-xl"
        value={profile.email}
      />
      <textarea
        className="w-full p-2 border rounded-xl"
        rows={3}
        value={profile.bio}
      ></textarea>
      <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
        Save Changes
      </button>
    </div>
  );
}
