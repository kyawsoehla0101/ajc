import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, User, Bookmark, FileText, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/images/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [dropdownOpen, setDropdownOpen] = useState(false); // User dropdown state
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Optional: console.log("Navbar user:", user);
    }
  }, [user, loading]);

  // Nav Links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/job-search" },
    { name: "Companies", path: "/companies" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <>
      {/* Navbar header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold custom-blue-text">
            <img
              src={logo}
              alt="JobSeeker Logo"
              className="h-13 object-contain"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) =>
                  isActive
                    ? "custom-blue-text border-b-2 font-semibold"
                    : "gray-text-custom nav-hover-blue"
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Desktop */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {!user && !loading ? (
              <>
                {/* Sign In & Employer links */}
                <NavLink
                  to="/sign-in"
                  className={({ isActive }) =>
                    isActive
                      ? "custom-blue-text border-b-2 font-semibold"
                      : "custom-blue-text border rounded-md py-[2px] px-2 hover-blue"
                  }
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/employer/sign-in"
                  className={({ isActive }) =>
                    isActive
                      ? "custom-blue-text border-b-2 font-semibold"
                      : "custom-blue-text hover-blue"
                  }
                >
                  Employer SignUp
                </NavLink>
              </>
            ) : (
              <>
                {/* Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="custom-blue-text font-semibold flex items-center gap-1 focus:outline-none"
                  >
                    {loading
                      ? "Loading..."
                      : user?.name ||
                        user?.username ||
                        (user?.email
                          ? user.email.split("@")[0]
                          : "Account")}{" "}
                    ▼
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 gray-text-custom hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} /> Profile
                      </NavLink>

                      <NavLink
                        to="/job-search/saved"
                        className="flex items-center gap-2 px-4 py-2 gray-text-custom hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Bookmark size={16} /> Saved Jobs
                      </NavLink>

                      <NavLink
                        to="/job-search/applications"
                        className="flex items-center gap-2 px-4 py-2 gray-text-custom hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FileText size={16} /> Job Applications
                      </NavLink>

                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 text-left px-4 py-2 gray-text-custom hover:bg-gray-100"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
                {/* Employer site link */}
                <NavLink
                  to="/employer/sign-in"
                  className={({ isActive }) =>
                    isActive
                      ? "custom-blue-text border-b-2 blue-border-color font-semibold"
                      : "gray-text-custom nav-hover-blue"
                  }
                >
                  Employer Site
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="gray-text-custom nav-hover-blue focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden bg-white shadow-md">
            <div className="container mx-auto px-4 py-2">
              <ul className="flex flex-col space-y-2">
                {navLinks.map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        isActive
                          ? "block custom-blue-text font-semibold"
                          : "block gray-text-custom nav-hover-blue"
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </NavLink>
                  </li>
                ))}

                <li className="border-t my-2"></li>

                {!user && !loading ? (
                  <>
                    <li>
                      <NavLink
                        to="/sign-in"
                        className="custom-blue-text border rounded-md py-[4px] px-1 hover-blue"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/employer/sign-in"
                        className="block custom-blue-text hover-blue"
                        onClick={() => setIsOpen(false)}
                      >
                        Employer Site
                      </NavLink>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <span
                        className="block custom-blue-text font-semibold cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        {loading
                          ? "Loading..."
                          : user?.name || user?.username || "Account"}{" "}
                        ▼
                      </span>
                      {dropdownOpen && (
                        <ul className="ml-4 space-y-2">
                          <li>
                            <NavLink
                              to="/profile"
                              className="flex items-center gap-2 gray-text-custom nav-hover-blue"
                              onClick={() => setIsOpen(false)}
                            >
                              <User size={16} /> Profile
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/job-search/saved"
                              className="flex items-center gap-2 gray-text-custom nav-hover-blue"
                              onClick={() => setIsOpen(false)}
                            >
                              <Bookmark size={16} /> Saved Jobs
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/job-search/applications"
                              className="flex items-center gap-2 gray-text-custom nav-hover-blue"
                              onClick={() => setIsOpen(false)}
                            >
                              <FileText size={16} /> Job Applications
                            </NavLink>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                logout();
                                setIsOpen(false);
                              }}
                              className="flex items-center gap-2 gray-text-custom nav-hover-blue"
                            >
                              <LogOut size={16} /> Logout
                            </button>
                          </li>
                        </ul>
                      )}
                    </li>
                    <li>
                      <NavLink
                        to="/employer/sign-in"
                        className={({ isActive }) =>
                          isActive
                            ? "block custom-blue-text font-semibold"
                            : "block gray-text-custom nav-hover-blue"
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        Employer Site
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        )}
      </header>

      {/* spacing for fixed navbar */}
      <div className="h-14"></div>
    </>
  );
}
