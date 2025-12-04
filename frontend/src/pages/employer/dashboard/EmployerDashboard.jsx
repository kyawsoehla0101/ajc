import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  User,
  Settings,
  LogOut,
  LayoutGrid,
  Mail,
} from "lucide-react";
import { useEmployerAuth } from "../../../hooks/useEmployerAuth";
import Notification from "./Notification";
import usePageTitle from "../../../hooks/usePageTitle";

// Sidebar menu items for employer dashboard
export const sidebarItems = [
  { route: "dashboard", label: "Dashboard", icon: Briefcase },
  { route: "job-category", label: "Job Category", icon: LayoutGrid },
  { route: "my-jobs", label: "Jobs List", icon: FileText },
  { route: "applications", label: "Job Application", icon: User },
  { route: "profile", label: "Profile", icon: User },
  { route: "settings", label: "Settings", icon: Settings },
];

export default function EmployerDashboardLayout() {
  // Page title
  usePageTitle("Overview");
  // Employer authentication and state
  const { employer, authLoading, logout, resendEmail } = useEmployerAuth();
  const navigate = useNavigate();
   // Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Loading state for email verification resend
  const [resendLoading, setResendLoading] = useState(false);
  // Flag to show verification message
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

   // Show verification message if employer exists but not verified
  useEffect(() => {
    if (employer) {
      setShowVerificationMessage(!employer.is_verified);
    }
  }, [employer]);

  console.log("EMPLOYER FROM CONTEXT:", employer);

   // Loading state while authentication data is being fetched
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  // Function to resend verification email
  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await resendEmail();
      setShowVerificationMessage(true);
    } catch (err) {
      console.error(err);
    } finally {
      setResendLoading(false);
    }
  };

   // If employer data not yet available, show loading
  if (!employer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  // Flag to check if email is not verified
  const emailNotVerified = showVerificationMessage;

  return (
    <div className="min-h-screen flex bg-gray-100 font-inter">
      {/* Sidebar (fixed left) */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-md z-20">
        <div className="p-6 text-2xl font-bold text-blue-700">Employer</div>
        <nav className="space-y-2 p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.route}
                to={
                  emailNotVerified
                    ? "#" // Disable navigation
                    : `/employer/dashboard/${
                        item.route === "dashboard" ? "" : item.route
                      }`
                }
                onClick={(e) => {
                  if (emailNotVerified) {
                    e.preventDefault(); // Stop clicking
                  }
                }}
                end={item.route === "dashboard"}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded transition ${
                    emailNotVerified
                      ? "opacity-40 cursor-not-allowed" // 🔒 Disabled UI
                      : isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="mr-2" size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 ml-64">
        {/* Header (fixed top, after sidebar) */}
        <header className="fixed top-0 left-64 right-0 z-10 bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <NavLink to="/" className="text-gray-600 hover:text-blue-600">
            Home
          </NavLink>

          <div className="flex items-center space-x-4">
            <Notification />
            <button className="p-2 rounded-full hover:bg-gray-200">
              <Mail size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"
              >
                <User size={18} />
                <span>
                  {employer?.username || employer?.email || "Employer"}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                  <button
                    onClick={() => navigate("/employer/dashboard")}
                    className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    <Briefcase className="mr-2" size={18} /> Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2" size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="bg-sky-50 min-h-screen pt-25 p-6">
          {/* verification alert */}
          {emailNotVerified && (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mb-4 rounded">
              <div className="flex justify-between items-center">
                <span>Please verify your email to access the dashboard.</span>

                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Email"}
                </button>
              </div>
            </div>
          )}

          {/* Protect dashboard routes */}
          {emailNotVerified ? (
            <div className="text-center text-gray-600 mt-10">
              <p>Please verify your email to continue.</p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
