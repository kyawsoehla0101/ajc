import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEmployerAuth } from "../../hooks/useEmployerAuth";
import { toast } from "react-hot-toast";
import logo from "../../assets/images/logo.png";
import usePageTitle from "../../hooks/usePageTitle";

export default function EmployerCompanyDetail() {
  usePageTitle("Employer Company Register");
  const location = useLocation();
  const navigate = useNavigate();
  const { submitCompanyDetail } = useEmployerAuth();
  const email = location.state?.email || "you@email.com";

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("employerUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profile = {
        first_name: e.target.first_name.value,
        last_name: e.target.last_name.value,
        business_name: e.target.business_name.value,
        city: e.target.city.value,
        phone: e.target.phone.value,
        size: e.target.size.value,
        website: e.target.website.value,
        industry: e.target.industry.value,
        founded_year: e.target.founded_year.valueAsNumber,
        contact_email: e.target.contact_email.value,
      };

      const formData = new FormData();
      formData.append("profile", JSON.stringify(profile));

      // File field
      if (e.target.logo.files[0]) {
        formData.append("logo", e.target.logo.files[0]);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      // Submit formData
      await submitCompanyDetail(formData);

      toast.success("Account created successfully!");
      navigate("/employer/dashboard");
    } catch (err) {
      console.error("Error :", err.response.data);
      console.log("Status:", err.response.status);
      toast.error("Email already exist!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold custom-blue-text">
            <img
              src={logo}
              alt="JobSeeker Logo"
              className="h-13 object-contain"
            />
          </NavLink>
          <div className="text-gray-700 cursor-pointer">
            {user?.username || user?.email || "Employer"} ▼
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex flex-col items-center py-25">
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-2">
            Your employer Account Create
          </h2>
          <p className="text-gray-600 mb-4">
            You're almost done! We need some details about your business to
            verify your account. We won’t share your details with anyone.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="w-full px-3 py-2 bg-gray-100 text-gray-800">
                {email}
              </p>
            </div>

            {/* Full name + Last name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">First name</label>
                <input
                  name="first_name"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last name</label>
                <input
                  name="last_name"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input
                name="business_name"
                type="text"
                placeholder="We need your registered company name to verify your account."
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium">City</label>
              <input
                name="city"
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                name="phone"
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium">Website</label>
              <input
                name="website"
                type="url"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium">Industry</label>
              <input
                name="industry"
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium">Company Size</label>
              <input
                name="size"
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Founded Year */}
            <div>
              <label className="block text-sm font-medium">Founded Year</label>
              <input
                name="founded_year"
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium">Contact Email</label>
              <input
                name="contact_email"
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium">Company Logo</label>
              <input
                name="logo"
                type="file"
                accept="image/*"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              {loading ? "Creating..." : "Create New Account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
