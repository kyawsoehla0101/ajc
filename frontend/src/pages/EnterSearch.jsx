import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import jobseekerBg from "../assets/images/jobseekerphoto.jpg";
import { LOCATION_CHOICES } from "../utils/locationHelpers";

// Convert Label → Value
function getLocationValue(userInput) {
  if (!userInput) return "";

  // Exact match ("MRAUK-U" → { value: "MO" })
  const match = LOCATION_CHOICES.find(
    (item) => item.label.toLowerCase() === userInput.toLowerCase()
  );

  if (match) return match.value;

  // Partial match ("mrau" → "MRAUK-U" → "MO")
  const partial = LOCATION_CHOICES.find((item) =>
    item.label.toLowerCase().includes(userInput.toLowerCase())
  );

  return partial ? partial.value : "";
}

function EnterSearch({ collapse }) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSearch = async () => {
    if (!keyword.trim() && !location.trim()) {
      toast.error("Please enter keyword or location!");
      return;
    }

    // FRONTEND mapping only (label → value)
    const locValue = getLocationValue(location.trim());

    if (location.trim() && !locValue) {
      toast.error("No jobs found!", { icon: null });

      navigate("/job-search/all", { state: { jobs: [] } });
      return; // Prevent API call
    }

    try {
      const res = await axios.get(`${API_URL}/job/search/`, {
        params: {
          q: keyword.trim(),
          loc: locValue,
        },
      });

      const jobs = res.data?.results || [];
      toast.success(`Found ${res.data.count || 0} job(s)!`, { icon: null });

      // navigate and pass results to JobSearchAll.jsx
      navigate("/job-search/all", { state: { jobs } });
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to fetch jobs. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section
      className={`bg-cover bg-center bg-no-repeat transition-all duration-500 overflow-hidden ${
        collapse
          ? "h-0 py-0 opacity-0"
          : "h-[530px] max-2xl:h-[350px] max-xl:h-[320px] max-lg:h-[300px] py-8 opacity-100"
      }`}
      style={{
        backgroundImage: `url(${jobseekerBg})`,
      }}
    >
      <div className="w-full h-[530px] max-2xl:h-[350px] max-xl:h-[320px] max-lg:h-[300px] flex items-center justify-center px-4">
        {/* Glass Panel */}
        <div className="max-lg:p-7 py-10 px-4 w-full container mt-28 max-md:mt-0">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-md:gap-3 w-full">
            {/* WHAT */}
            <div className="md:col-span-3 relative">
              <p className="text-white text-lg font-semibold max-md:hidden">
                What
              </p>

              <input
                type="text"
                placeholder="Enter keywords"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-4 max-md:h-[40px] max-xl:h-[48px] h-[55px] rounded-xl border border-gray-300 custom-blue-text bg-white max-md:text-base text-lg w-full placeholder-gray-400 focus:outline-none shadow-sm"
              />
            </div>

            {/* WHERE */}
            <div className="md:col-span-2 relative">
              <p className="text-white text-lg font-semibold max-md:hidden">
                Where
              </p>

              <input
                type="text"
                placeholder="Enter locations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyPress}
                className="p-4 max-md:h-[40px] max-xl:h-[48px] h-[55px] rounded-xl border border-gray-300 custom-blue-text bg-white max-md:text-base text-lg w-full placeholder-gray-400 focus:outline-none shadow-sm"
              />
            </div>

            {/* BUTTON */}
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={handleSearch}
                className="max-md:h-[40px] max-xl:h-[48px] h-[55px] w-full px-5 rounded-xl max-md:text-base text-lg search-button custom-blue-text font-semibold hover-search-button hover-blue transition shadow-md cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EnterSearch;
