import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Redirects authenticated users away from public routes (e.g., sign-in, sign-up)
export default function RedirectIfAuthenticated() {
  const { user } = useAuth();
  // If a user is already logged in, redirect them to the homepage
  if (user) {
    return <Navigate to="/" replace />;
  }
  // Otherwise, render the child routes (Outlet) for unauthenticated users
  return <Outlet />;
}
