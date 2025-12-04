import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useEmployerAuth } from "../../hooks/useEmployerAuth";
import logo from "../../assets/images/logo.png";
import usePageTitle from "../../hooks/usePageTitle";

const EmployerSignIn = () => {
  usePageTitle("Employer Sign-In");
  const { signin } = useEmployerAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await signin({ email, password });
      navigate("/employer/dashboard");
    } catch (err) {
      if (err.response?.status === 400) {
        setError("This account is not registered yet. Please register first.");
      } else {
        setError(err.message || "Sign In failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  // auto-hide error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
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

      <main className="flex-grow flex justify-center items-center px-4">
        <div className="bg-blue-50 rounded-2xl shadow-md w-full max-w-md p-8 text-center">
          <p className="text-gray-600 mb-2">
            Are you looking for{" "}
            <Link to="/sign-in" className="text-blue-600">
              a job?
            </Link>
          </p>
          <h2 className="text-2xl font-bold mb-6">Sign In as an employer</h2>

          {/* Error message */}
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <form className="space-y-4 text-left" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="flex justify-end text-sm">
              <Link to="/employer/forgot-password" className="text-blue-600">
                Forget Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-lg font-medium transition ${
                loading
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-700 mt-4">
            Already have your account?{" "}
            <Link to="/employer/register" className="text-blue-600 font-medium">
              Register
            </Link>
          </p>
        </div>
      </main>

      <footer className="absolute bottom-4 text-gray-500 text-sm">
        © 2023 Copyright: Jobstreet .com
      </footer>
    </div>
  );
};

export default EmployerSignIn;
