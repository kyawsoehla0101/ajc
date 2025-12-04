import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// CSRF token function
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

export default function EmployerProfileForm() {
  // input formdata
  const [formData, setFormData] = useState({
    image: null,
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    location: "",
    active: true,
  });

  const [employerId, setEmployerId] = useState("");
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch old profile data
  useEffect(() => {
    const fetchOldData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/accounts-employer/employer/profile/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        console.log("Profile Response:", response.data);

        const profile = response.data.employer_profile[0];
        console.log("Profile Data:", profile);

        // check condition
        if (!profile || !profile.id) {
          console.error("No employer profile found!", response.data);
          return;
        }

        setEmployerId(profile.id);
        const storedUser = JSON.parse(localStorage.getItem("employerUser"));

        setFormData({
          image: null,
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: storedUser?.email || profile.email || "",
          businessName: profile.business_name || "",
          location: profile.city || "",
          active: profile.active ?? true,
        });
      } catch (err) {
        console.error("Error loading old profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOldData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  // Submit updated profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    // employer ID is loaded
    if (!employerId) {
      toast.error("Employer ID not loaded yet. Please wait.");
      return;
    }

    try {
      // Prepare form data
      const form = new FormData();
      form.append("first_name", formData.firstName);
      form.append("last_name", formData.lastName);
      form.append("email", formData.email);
      form.append("business_name", formData.businessName);
      form.append("city", formData.location);
      form.append("active", formData.active);
      if (formData.image) {
        form.append("logo", formData.image);
      }

      // variables csrfToken
      const csrfToken = getCookie("csrftoken");

      // update profile
      const response = await axios.put(
        `${API_URL}/accounts-employer/employer/profile-update/${employerId}/`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRFToken": csrfToken,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log("Success:", response.data);
      toast.success("Employer Profile Updated");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error("Something went wrong");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-8 flex justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm mb-1">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
            <span>Active</span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={!employerId}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
