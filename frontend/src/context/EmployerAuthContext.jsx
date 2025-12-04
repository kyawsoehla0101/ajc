import { createContext, useState, useEffect } from "react";
import {
  registerEmployer,
  registerEmployerDetail,
  signinEmployer,
  fetchCurrentEmployer,
  employerLogout,
  resendVerificationEmail,
} from "../utils/api/employerAPI";
import { toast } from "react-hot-toast";

export const EmployerAuthContext = createContext();

export const EmployerAuthProvider = ({ children }) => {
  const [employer, setEmployer] = useState(() => {
    const saved = localStorage.getItem("employerUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Sync employer with localStorage
  useEffect(() => {
    if (employer) {
      localStorage.setItem("employerUser", JSON.stringify(employer));
    } else {
      localStorage.removeItem("employerUser");
    }
  }, [employer]);

  // Fetch latest user data from backend
  useEffect(() => {
    const loadEmployer = async () => {
      const saved = localStorage.getItem("employerUser");

      if (!saved) {
        setAuthLoading(false);
        return;
      }

      try {
        const data = await fetchCurrentEmployer();
        setEmployer(data);
      } catch (err) {
        console.error("Failed to fetch employer:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    loadEmployer();
  }, []);

  // Register
  const register = async (email, password) => {
    try {
      const data = await registerEmployer(email, password);

      const newUser = {
        email: data.email,
        is_verified: false,
      };

      // save to localStorage even before login
      localStorage.setItem("employer_preregister_email", data.email);

      return newUser;
    } catch (err) {
      throw err;
    }
  };

  // Submit company detail
  const submitCompanyDetail = async (formData) => {
    const data = await registerEmployerDetail(formData);
    const updatedEmployer = { ...employer, ...formData };
    setEmployer(updatedEmployer);
    return updatedEmployer;
  };

  // Signin with token + CSRF
  const signin = async ({ email, password }) => {
    const data = await signinEmployer({ email, password });
    const userWithToken = {
      id: data.id,
      email: data.email,
      username: data.username,
      is_verified: data.is_verified,
      access: data.access,
      refresh: data.refresh,
    };
    setEmployer(userWithToken);
    localStorage.setItem("employerUser", JSON.stringify(userWithToken));
    try {
      const refreshed = await fetchCurrentEmployer();
      setEmployer(refreshed);
      localStorage.setItem("employerUser", JSON.stringify(refreshed));
    } catch (err) {
      console.error("Failed to refresh employer after login:", err);
    }
    return userWithToken;
  };

  // Logout with CSRF + refresh token
  const logout = async () => {
    try {
      if (employer?.refresh) {
        await employerLogout(employer.refresh);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setEmployer(null);
      localStorage.removeItem("employerUser");
    }
  };

  // Resend verification email
  const resendEmail = async () => {
    try {
      let email = employer?.email;
      if (!email) {
        email = localStorage.getItem("employer_preregister_email");
      }

      if (!email) {
        toast.error("Email not found in system.");
        return;
      }

      const res = await resendVerificationEmail(email);

      toast.success(res?.message || "Verification email sent!");
    } catch (err) {
      toast.error("Failed to resend email.");
    }
  };

  return (
    <EmployerAuthContext.Provider
      value={{
        employer,
        authLoading,
        register,
        submitCompanyDetail,
        signin,
        logout,
        resendEmail,
      }}
    >
      {children}
    </EmployerAuthContext.Provider>
  );
};
