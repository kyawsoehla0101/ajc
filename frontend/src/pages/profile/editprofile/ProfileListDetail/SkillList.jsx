import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SkillList({
  profileId,
  skillList,
  setSkillList,
  onEdit,
}) {
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch Skills
  useEffect(() => {
    if (!profileId) return;

    setLoading(true);
    axios
      .get(`${API_URL}/accounts-jobseeker/skill/?profile=${profileId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setSkillList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching skills:", err);
        setLoading(false);
      });
  }, [profileId, setSkillList]);

  if (loading) {
    return (
      <div className="text-gray-500 text-sm italic">Loading skills...</div>
    );
  }

  if (!skillList || skillList.length === 0) {
    return <p className="text-gray-500 mb-3">No skills added yet.</p>;
  }

  // Helper for proficiency level
  const getProficiencyText = (level) => {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      case 4:
        return "Expert";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Skills</h2>
      <ul className="space-y-3">
        {skillList.map((skill) => (
          <li
            key={skill.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p className="font-medium">Skill Name: {skill.name}</p>
              <p className="text-gray-500 text-sm">
                Proficiency: {getProficiencyText(skill.proficiency_level)}
              </p>
            </div>

            {/* Edit Button */}
            <button
              className="text-blue-600 text-sm hover:underline ml-4"
              onClick={() => onEdit(skill)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
