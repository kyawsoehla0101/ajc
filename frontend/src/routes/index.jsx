import React from "react";
import { Routes } from "react-router-dom";

import { MainRoutes } from "./MainRoutes";
import { JobSeekerRoutes } from "./JobSeekerRoutes";
import { AuthRoutes } from "./AuthRoutes";
import { EmployerRoutes } from "./EmployerRoutes";
import { NotFoundRoute } from "./NotFoundRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {MainRoutes}
      {JobSeekerRoutes}
      {AuthRoutes}
      {EmployerRoutes}
      {NotFoundRoute}
    </Routes>
  );
}
