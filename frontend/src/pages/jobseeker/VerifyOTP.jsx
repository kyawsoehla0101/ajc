import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/images/logo.png";
import usePageTitle from "../../hooks/usePageTitle";

const VerifyOTP = () => {
  usePageTitle("VerifyOTP");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const { loading, message, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const inputsRef = useRef([]);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const [resendTimer, setResendTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lockTimer, setLockTimer] = useState(0);

  // Restore timers from localStorage on load
  useEffect(() => {
    const savedResendEnd = localStorage.getItem("resend_end");
    const savedLockEnd = localStorage.getItem("lock_end");

    const now = Math.floor(Date.now() / 1000);

    if (savedResendEnd) {
      const remaining = savedResendEnd - now;
      if (remaining > 0) setResendTimer(remaining);
    }

    if (savedLockEnd) {
      const remaining = savedLockEnd - now;
      if (remaining > 0) setLockTimer(remaining);
    }
  }, []);

  // If email missing → redirect
  useEffect(() => {
    if (!email) navigate("/sign-in");
  }, [email, navigate]);

  // Handle typing in each digit
  useEffect(() => {
    const savedResendEnd = Number(localStorage.getItem("resend_end") || 0);
    const now = Math.floor(Date.now() / 1000);

    if (!savedResendEnd || savedResendEnd <= now) {
      // No active timer → start new 60s
      const newEnd = now + 60;
      localStorage.setItem("resend_end", newEnd);
      setResendTimer(60);
    }
  }, []);

  // OTP Input Logic
  const handleChange = (value, index) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) inputsRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(paste)) {
      const pasteArr = paste.split("");

      setCode((prev) => {
        const newCode = [...prev];
        for (let i = 0; i < pasteArr.length; i++) newCode[i] = pasteArr[i];
        return newCode;
      });
    }
  };

  // Verify Button Logic
  const handleVerifyClick = async () => {
    if (lockTimer > 0) {
      setError(`Too many attempts. Try again in ${lockTimer}s`);
      return;
    }

    const otp = code.join("");

    if (otp.length < 6) {
      setError("Enter the 6-digit code");
      setCode(["", "", "", "", "", ""]);
      return;
    }

    try {
      const ok = await verifyOTP(email, otp);

      if (!ok) {
        setAttempts((prev) => prev + 1);

        if (attempts + 1 >= 5) {
          const end = Math.floor(Date.now() / 1000) + 60;
          localStorage.setItem("lock_end", end);
          setLockTimer(60);
          setAttempts(0);
          setError("Too many attempts. Try again in 60 seconds.");
          return;
        }

        setError(`Invalid code. Attempts left: ${4 - attempts}`);
        setCode(["", "", "", "", "", ""]);
        return;
      }
    } catch (err) {
      setAttempts((prev) => prev + 1);

      if (attempts + 1 >= 5) {
        const end = Math.floor(Date.now() / 1000) + 60;
        localStorage.setItem("lock_end", end);
        setLockTimer(60);
        setAttempts(0);
        setError("Too many attempts. Try again in 60 seconds.");
        return;
      }

      setError(`Invalid verification code. Attempts left: ${4 - attempts}`);
      setCode(["", "", "", "", "", ""]);
    }
  };

  // Resend OTP Logic
  const handleResend = async () => {
    if (resendTimer > 0 || lockTimer > 0) return;

    const end = Math.floor(Date.now() / 1000) + 60;
    localStorage.setItem("resend_end", end);

    setResendTimer(60);
    setResendLoading(true);

    const ok = await resendOTP(email);

    if (ok) {
      setResendMsg("A new verification code has been sent to your email.");
      setTimeout(() => setResendMsg(""), 5000);
    }

    setResendLoading(false);
  };

  // RESEND TIMER COUNTDOWN
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  // Save resend timer → localStorage
  useEffect(() => {
    if (resendTimer > 0) {
      const end = Math.floor(Date.now() / 1000) + resendTimer;
      localStorage.setItem("resend_end", end);
    } else {
      localStorage.removeItem("resend_end");
    }
  }, [resendTimer]);

  // LOCK TIMER COUNTDOWN
  useEffect(() => {
    if (lockTimer <= 0) return;

    const timer = setInterval(() => {
      setLockTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [lockTimer]);

  useEffect(() => {
    if (lockTimer > 0) {
      const end = Math.floor(Date.now() / 1000) + lockTimer;
      localStorage.setItem("lock_end", end);
    } else {
      localStorage.removeItem("lock_end");
    }
  }, [lockTimer]);

  // Hide error auto
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-submit
  useEffect(() => {
    if (code.every((d) => d !== "")) handleVerifyClick();
  }, [code]);

  // UI Rendering
  return (
    <div
      className="min-h-screen bg-white flex flex-col font-inter"
    >
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

      {/* Main */}
      <main className="flex-grow flex justify-center items-center px-4">
        <div className="bg-blue-50 rounded-xl p-8 w-full max-w-md shadow-md text-center">
          <p className="mb-4">Check your email for a code</p>
          <p className="mb-6 text-sm">
            Enter the 6-digit code we sent to {email}
          </p>

          {/* OTP INPUTS */}
          <div className="flex justify-center gap-2 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center border rounded-lg text-lg focus:ring-2 focus:ring-blue-600"
                placeholder="-"
              />
            ))}
          </div>

          {/* VERIFY */}
          <button
            onClick={handleVerifyClick}
            disabled={loading || lockTimer > 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
          )}

          {/* RESEND */}
          <div className="mt-4">
            {lockTimer > 0 ? (
              <p className="text-red-600 text-sm font-medium">
                Wait ({lockTimer}s)
              </p>
            ) : resendTimer > 0 ? (
              <p className="text-blue-600 text-sm">Resend in {resendTimer}s</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-blue-600 text-sm hover:underline"
              >
                {resendLoading ? "Resending..." : "Resend Code"}
              </button>
            )}

            {resendMsg && (
              <p className="text-green-600 text-sm mt-2">{resendMsg}</p>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-3 text-gray-500 border-t">
        © 2023 Jobstreet.com
      </footer>
    </div>
  );
};

export default VerifyOTP;
