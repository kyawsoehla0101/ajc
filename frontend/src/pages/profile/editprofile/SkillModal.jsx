import React, { useState, useEffect } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";

export default function SkillModal({
  isOpen,
  onClose,
  profileId,
  profileName,
  editData,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: "",
    proficiency_level: 1,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Cookie getter (for CSRF)
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // If editData exists, fill form
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        proficiency_level: editData.proficiency_level || 1,
      });
    } else {
      setFormData({
        name: "",
        proficiency_level: 1,
      });
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const csrftoken = getCookie("csrftoken");
    if (!profileId) return toast.error("Profile not found.");

    try {
      let response;
      if (editData) {
        // Update existing skill
        response = await axios.put(
          `${API_URL}/accounts-jobseeker/skill/${editData.id}/`,
          { ...formData, profile: profileId },
          {
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken,
            },
            withCredentials: true,
          }
        );
      } else {
        // Create new skill
        response = await axios.post(
          `${API_URL}/accounts-jobseeker/skill/`,
          { ...formData, profile: profileId },
          {
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken,
            },
            withCredentials: true,
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(editData ? "Skill updated successfully" : "Skill saved successfully");
        onSuccess?.(response.data);
        onClose();
      }
    } catch (err) {
      console.error("Error saving skill:", err);
      toast.error("Failed to save skill. Check your form data.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mt-14 max-h-[90vh] overflow-y-auto animate-slideDown p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {editData ? "Edit Skill" : "Add Skill"}
          </h2>
          <button onClick={onClose} className="text-gray-600 text-lg">
            ✕
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Profile Name */}
          <div>
            <label className="block font-medium mb-1">Profile</label>
            <input
              type="text"
              value={profileName || "No Profile Name"}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Skill Name */}
          <div>
            <label className="block font-medium mb-1">Skill Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. React.js"
            />
          </div>

          {/* Proficiency Level */}
          <div>
            <label className="block font-medium mb-1">Proficiency Level</label>
            <select
              name="proficiency_level"
              value={formData.proficiency_level}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={1}>Beginner</option>
              <option value={2}>Intermediate</option>
              <option value={3}>Advanced</option>
              <option value={4}>Expert</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              {editData ? "Update" : "Save"}
            </button>
            <button
              type="button"
              className="bg-blue-100 text-blue-600 px-6 py-2 rounded-lg"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
