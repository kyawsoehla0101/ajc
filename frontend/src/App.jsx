import React from "react";

// Providers
import { AuthProvider } from "./context/AuthContext";
import { EmployerAuthProvider } from "./context/EmployerAuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { JobApplyProvider } from "./context/JobApplyContext";

// Routes (combined)
import AppRoutes from "./routes";

// Toast
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <EmployerAuthProvider>
        <NotificationProvider>
          <JobApplyProvider>
            <>
              {/* All application routes */}
              <AppRoutes />

              {/* Toast notifications */}
              <Toaster position="top-right" reverseOrder={false} />
            </>
          </JobApplyProvider>
        </NotificationProvider>
      </EmployerAuthProvider>
    </AuthProvider>
  );
}

export default App;
