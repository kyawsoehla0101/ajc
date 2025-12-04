import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEmployerAuth } from "../../hooks/useEmployerAuth";
import logo from "../../assets/images/logo.png";
import usePageTitle from "../../hooks/usePageTitle";

export default function EmployerRegister() {
  usePageTitle("Employer Register");
  const navigate = useNavigate();
  const { register } = useEmployerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI Error Messages
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState(""); // backend error
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset all errors
    setEmailError("");
    setPasswordError("");
    setFormError("");

    // Frontend Validation
    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    // Continue to backend submit
    setLoading(true);

    try {
      const newUser = await register(email, password);

      // Success → go next page
      navigate("/employer/company/detail", {
        state: { email: newUser.email },
      });
    } catch (err) {
      console.error("Register error:", err);
      const data = err?.response?.data;

      // Backend Email Exists
      if (data?.code === "EMAIL_EXISTS") {
        setFormError("Email already exists.");
        setLoading(false);
        return;
      }

      // Backend Profile Exists
      if (data?.code === "PROFILE_EXISTS") {
        setFormError("An employer profile already exists for this email.");
        setLoading(false);
        return;
      }

      // Backend Field Validation
      if (data?.email) {
        setEmailError(data.email[0]);
        setLoading(false);
        return;
      }

      if (data?.password) {
        setPasswordError(data.password[0]);
        setLoading(false);
        return;
      }

      // Generic Backend Error
      if (data?.error) {
        setFormError(data.error);
      } else {
        setFormError("Registration failed. Please try again.");
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-inter">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold custom-blue-text">
            <img
              src={logo}
              alt="JobSeeker Logo"
              className="h-13 object-contain"
            />
          </NavLink>
        </div>
      </header>

      {/* CARD */}
      <div className="bg-blue-50 rounded-2xl shadow-md w-full max-w-md p-8 text-center mt-14">
        <p className="text-gray-600 mb-2">
          Are you looking for{" "}
          <Link to="/sign-in" className="text-blue-600">
            a job?
          </Link>
        </p>

        <h2 className="text-2xl font-bold mb-6">Register as an employer</h2>

        {/* Backend Error */}
        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* EMAIL INPUT */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring 
                ${
                  emailError
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-300"
                }`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring 
                ${
                  passwordError
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-300"
                }`}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* TERMS */}
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <label className="text-sm text-gray-600">
              I accept the Terms & Conditions and Privacy Policy Of Farm Fresh
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white rounded-lg py-2 font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have your account?{" "}
          <Link
            to="/employer/sign-in"
            className="text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>

      <div className="absolute bottom-4 text-gray-500 text-sm">
        © 2023 Copyright: Jobstreet.com
      </div>
    </div>
  );
}
