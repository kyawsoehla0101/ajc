import React from "react";
import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/homepage/Home";

export const MainRoutes = (
  <Route path="/" element={<MainLayout />}>
    <Route index element={<Home />} />
  </Route>
);
