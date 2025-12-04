import React from "react";
import { Route } from "react-router-dom";
import RedirectIfAuthenticated from "../components/RedirectIfAuthenticated";

// imp Jobseeker Auth
import SignIn from "../pages/jobseeker/SignIn";
import VerifyOTP from "../pages/jobseeker/VerifyOTP";

// imp Employer Auth
import EmployerSignIn from "../pages/employer/EmployerSignIn";
import EmployerRegister from "../pages/employer/EmployerRegister";
import EmployerCompanyDetail from "../pages/employer/EmployerCompanyDetail";

export const AuthRoutes = (
  <>
    {/* Jobseeker Auth */}
    <Route element={<RedirectIfAuthenticated />}>
      <Route path="sign-in" element={<SignIn />} />
      <Route path="verify" element={<VerifyOTP />} />
    </Route>

    {/* Employer Auth */}
    <Route path="employer/sign-in" element={<EmployerSignIn />} />
    <Route path="employer/register" element={<EmployerRegister />} />
    <Route
      path="employer/company/detail"
      element={<EmployerCompanyDetail />}
    />
  </>
);
