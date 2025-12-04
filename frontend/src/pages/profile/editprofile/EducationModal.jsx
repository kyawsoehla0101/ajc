import React, { useState, useEffect } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";

export default function EducationModal({
  isOpen,
  onClose,
  profileId,
  profileName,
  editData,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    school_name: "",
    degree: "",
    field_of_study: "",
    start_year: "",
    end_year: "",
    gpa: "",
    description: "",
    location: "",
    is_current: false,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Cookie getter
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

  // editData
  useEffect(() => {
    if (editData) {
      setFormData({
        school_name: editData.school_name || "",
        degree: editData.degree || "",
        field_of_study: editData.field_of_study || "",
        start_year: editData.start_year || "",
        end_year: editData.end_year || "",
        gpa: editData.gpa || "",
        description: editData.description || "",
        location: editData.location || "",
        is_current: editData.is_current || false,
      });
    } else {
      // clear form for new entry
      setFormData({
        school_name: "",
        degree: "",
        field_of_study: "",
        start_year: "",
        end_year: "",
        gpa: "",
        description: "",
        location: "",
        is_current: false,
      });
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (formData) => {
    try {
      const res = await axios.post(
        `${API_URL}/accounts-jobseeker/education/`,
        formData,
        { withCredentials: true }
      );

      // Success callback
      if (onSuccess) {
        
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const csrftoken = getCookie("csrftoken");
    if (!profileId) return toast.error("Profile not found.");

    try {
      let response;
      if (editData) {
        response = await axios.put(
          `${API_URL}/accounts-jobseeker/education/${editData.id}/`,
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
        response = await axios.post(
          `${API_URL}/accounts-jobseeker/education/`,
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
        toast.success(editData ? "Education updated successfully" : "Education saved successfully");
        onSuccess?.(response.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save education. Check your form data.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mt-14 max-h-[90vh] overflow-y-auto animate-slideDown p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {editData ? "Edit Education" : "Add Education"}
          </h2>
          <button onClick={onClose} className="text-gray-600 text-lg">
            ✕
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1">Profile</label>
            <input
              type="text"
              value={profileName || "No Profile Name"}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* School Name */}
          <div>
            <label className="block font-medium mb-1">School Name</label>
            <input
              type="text"
              name="school_name"
              value={formData.school_name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Degree */}
          <div>
            <label className="block font-medium mb-1">Degree</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Field of Study */}
          <div>
            <label className="block font-medium mb-1">Field of Study</label>
            <input
              type="text"
              name="field_of_study"
              value={formData.field_of_study}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Start Year */}
          <div>
            <label className="block font-medium mb-1">Start Year</label>
            <select
              name="start_year"
              value={formData.start_year}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Start Year</option>
              {Array.from({ length: 30 }, (_, i) => {
                const year = 2025 - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* End Year */}
          <div>
            <label className="block font-medium mb-1">End Year</label>
            <select
              name="end_year"
              value={formData.end_year}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select End Year</option>
              {Array.from({ length: 30 }, (_, i) => {
                const year = 2025 - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* GPA */}
          <div>
            <label className="block font-medium mb-1">GPA</label>
            <input
              type="number"
              step="0.01"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Current */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_current"
              checked={formData.is_current}
              onChange={handleChange}
            />
            <label>Currently Studying</label>
          </div>

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
