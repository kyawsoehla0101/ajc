import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EducationList({
  profileId,
  educationList,
  setEducationList,
  onEdit,
}) {
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch Education Data
  useEffect(() => {
    if (!profileId) return;

    setLoading(true);
    axios
      .get(
        `${API_URL}/accounts-jobseeker/education/?profile=${profileId}`,
        { withCredentials: true }
      )
      .then((res) => {
        setEducationList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching education:", err);
        setLoading(false);
      });
  }, [profileId, setEducationList]);

  if (loading) {
    return (
      <div className="text-gray-500 text-sm italic">Loading education...</div>
    );
  }

  if (!educationList || educationList.length === 0) {
    return <p className="text-gray-500 mb-3">No education added yet.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Education</h2>
      <ul className="space-y-3">
        {educationList.map((edu) => (
          <li
            key={edu.id}
            className="flex justify-between items-start border-b pb-2"
          >
            <div>
              <p className="font-medium">School Name: {edu.school_name}</p>
              <p className="text-gray-500 text-sm">
                Degree: {edu.degree} - {edu.field_of_study}
              </p>
              <p className="text-gray-500 text-sm">
                Field Of Study: {edu.field_of_study}
              </p>
              <p className="text-gray-400 text-sm">
                Work Time: {edu.start_year} - {edu.is_current ? "Present" : edu.end_year}
              </p>
              {edu.gpa && (
                <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
              )}
              {edu.location && (
                <p className="text-sm text-gray-500">{edu.location}</p>
              )}
              {edu.description && (
                <p className="text-sm text-gray-500 italic mt-1">
                  Description: {edu.description}
                </p>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(edu)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ✎ Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
