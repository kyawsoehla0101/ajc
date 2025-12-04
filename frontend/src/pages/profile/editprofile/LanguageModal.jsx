import React, { useState, useEffect } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";

export default function LanguageModal({
  isOpen,
  onClose,
  profileId,
  profileName,
  editData,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: "",
    proficiency: "Beginner",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // CSRF Helper
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

  // When editing, prefill data
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        proficiency: editData.proficiency || "Beginner",
      });
    } else {
      setFormData({
        name: "",
        proficiency: "Beginner",
      });
    }
  }, [editData]);

  if (!isOpen) return null;

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const csrftoken = getCookie("csrftoken");

    if (!profileId) {
      toast.error("Profile not found. Cannot save language.");
      return;
    }

    try {
      let response;
      if (editData) {
        // Update existing
        response = await axios.put(
          `${API_URL}/accounts-jobseeker/language/${editData.id}/`,
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
        // Create new
        response = await axios.post(
          `${API_URL}/accounts-jobseeker/language/`,
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

      onSuccess(response.data);
      toast.success(editData ? "Language updated successfully" : "Language saved successfully");
      onClose();
    } catch (error) {
      console.error("Failed to save language:", error.response?.data || error);
      toast.error(
        `Failed to save language.\n${
          error.response?.data?.detail || "Check your token or form data."
        }`
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mt-14 max-h-[90vh] overflow-y-auto animate-slideDown p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {editData ? "Edit Language" : "Add Language"}
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
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-600"
            />
          </div>

          {/* Language Name */}
          <div>
            <label className="block font-medium mb-1">Language Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
              placeholder="e.g. English"
              required
            />
          </div>

          {/* Proficiency */}
          <div>
            <label className="block font-medium mb-1">Proficiency</label>
            <select
              name="proficiency"
              value={formData.proficiency}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Fluent">Fluent</option>
              <option value="Native">Native</option>
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
