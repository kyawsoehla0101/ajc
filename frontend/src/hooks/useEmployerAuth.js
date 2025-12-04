import { useContext } from "react";
import { EmployerAuthContext } from "../context/EmployerAuthContext";

export const useEmployerAuth = () => useContext(EmployerAuthContext);
