import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen font-inter">
      {/* Top Navigation Bar */}
      <Navbar />
      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}
