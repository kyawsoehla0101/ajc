import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LanguageList({
  profileId,
  languageList,
  setLanguageList,
  onEdit,
}) {
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch Language Data
  useEffect(() => {
    if (!profileId) return;

    setLoading(true);
    axios
      .get(`${API_URL}/accounts-jobseeker/language/?profile=${profileId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setLanguageList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching languages:", err);
        setLoading(false);
      });
  }, [profileId, setLanguageList]);

  if (loading) {
    return (
      <div className="text-gray-500 text-sm italic">Loading languages...</div>
    );
  }

  if (!languageList || languageList.length === 0) {
    return <p className="text-gray-500 mb-3">No language added yet.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Languages</h2>
      <ul className="space-y-3">
        {languageList.map((lang) => (
          <li
            key={lang.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p className="font-medium">Language Name: {lang.name}</p>
              <p className="text-gray-500 text-sm">
                Proficiency: {lang.proficiency}
              </p>
            </div>

            <button
              onClick={() => onEdit(lang)}
              className="text-blue-600 hover:underline text-sm"
            >
              ✎ Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
