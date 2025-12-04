// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-6">
      <h1 className="text-7xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl mt-4 font-semibold text-gray-700">
        Page Not Found
      </h2>
      <p className="text-gray-500 mt-2 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
