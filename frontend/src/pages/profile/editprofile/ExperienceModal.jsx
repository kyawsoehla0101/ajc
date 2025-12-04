import React, { useState, useEffect } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";

export default function ExperienceModal({ isOpen, onClose, profileId, profileName, editData, onSuccess }) {
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    position: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // preload edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id || "",
        job_title: editData.job_title || "",
        company_name: editData.company_name || "",
        position: editData.position || "",
        location: editData.location || "",
        start_date: editData.start_date || "",
        end_date: editData.end_date || "",
        is_current: editData.is_current || false,
        description: editData.description || "",
      });
    } else {
      setFormData({
        job_title: "",
        company_name: "",
        position: "",
        location: "",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
      });
    }
  }, [editData]);

  if (!isOpen) return null;

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const csrftoken = getCookie("csrftoken");
    if (!profileId) {
      toast.error("Profile not found!");
      return;
    }

    try {
      const url = formData.id
        ? `${API_URL}/accounts-jobseeker/experience/${formData.id}/`
        : `${API_URL}/accounts-jobseeker/experience/`;
      const method = formData.id ? "put" : "post";

      const res = await axios({
        method,
        url,
        data: { ...formData, profile: profileId },
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true,
      });

      onSuccess(res.data);
      onClose();
      toast.success(editData ? "Education updated successfully" : "Education saved successfully")
    } catch (err) {
      console.error("Error saving experience:", err.response?.data || err);
      toast.error("Failed to update experience.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mt-14 max-h-[90vh] overflow-y-auto p-6 animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {formData.id ? "Edit Experience" : "Add Experience"}
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
              value={profileName || "My Profile"}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Job Title</label>
            <input
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Company Name</label>
            <input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Google"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Position</label>
            <input
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Frontend Developer"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Yangon"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                disabled={formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_current"
              checked={formData.is_current}
              onChange={handleChange}
            />
            <label>Currently Working</label>
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Describe your responsibilities..."
            ></textarea>
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
