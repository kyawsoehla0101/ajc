import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Helper to get CSRF token from cookies
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

const API_URL = import.meta.env.VITE_API_URL;

export default function EditProfile({
  apiUrl = `${API_URL}/accounts-jobseeker/jobseekerprofile/`,
  onSave,
}) {
  const { user } = useAuth(); // Session auth only needs user
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(apiUrl, { withCredentials: true });
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          setProfile(data[0]);
        } else {
          setProfile({
            email: user.email || "",
            full_name: "",
            phone: "",
            address: "",
            bio: "",
            profile_picture: null,
            website: "",
            linkedin: "",
            github: "",
          });
        }
      } catch (err) {
        console.error("❌ Fetch profile error:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, apiUrl]);

  // Handle input changes
  const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (files && files.length > 0) {
    setProfile({ ...profile, [name]: files[0] }); // Real File
  } else {
    setProfile({ ...profile, [name]: value }); // Text field
  }
};


  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();

    Object.entries(profile).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (key === "profile_picture") {
        // Only include if it's a File (from <input type="file">)
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else {
        formData.append(key, value);
      }
    });


    const csrftoken = getCookie("csrftoken");

    try {
      const url = profile.id ? `${apiUrl}${profile.id}/` : apiUrl;
      const method = profile.id ? axios.put : axios.post;

      const res = await method(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true, // Important for session auth
      });

      setProfile(res.data);
      onSave?.(res.data);
      toast.success("Profile saved successfully!");
      navigate("/profile/me", { replace: true });
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // UI states
  if (!user) return <p>Loading user info...</p>;
  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-600">{JSON.stringify(error)}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email || user.email || ""}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block mb-1 font-semibold">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 font-semibold">Phone</label>
          <input
            type="text"
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 font-semibold">Address</label>
          <input
            type="text"
            name="address"
            value={profile.address || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block mb-1 font-semibold">Bio</label>
          <textarea
            name="bio"
            value={profile.bio || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows="4"
          />
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block mb-1 font-semibold">Profile Picture</label>
          <input
            type="file"
            name="profile_picture"
            onChange={handleChange}
            accept="image/*"
            className="w-full"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block mb-1 font-semibold">Website</label>
          <input
            type="url"
            name="website"
            value={profile.website || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block mb-1 font-semibold">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={profile.linkedin || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Github */}
        <div>
          <label className="block mb-1 font-semibold">Github</label>
          <input
            type="url"
            name="github"
            value={profile.github || ""}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
