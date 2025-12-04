import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import QuickSearchSection from "../homepage/QuickSearchSection";
import EnterSearch from "../EnterSearch";
import { getLocationLabel } from "../../utils/locationHelpers";
import SaveButton from "../../components/SaveButton";
import usePageTitle from "../../hooks/usePageTitle";

const JobCard = ({ job }) => {
  // Page Title
  usePageTitle("Job All");
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const logoPath = job.employer_logo || job.employer__logo;

  return (
    <div
      onClick={() => navigate(`/job-search/${job.id}`)}
      className="border border-gray-300 rounded-lg p-4 relative shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer flex flex-col justify-between h-full"
    >
      {/* Employer Logo */}
      <div className="absolute top-4 right-4 text-blue-500">
        <img
          src={logoPath ? `${API_URL}${logoPath}` : "/logo.png"}
          alt="Employer Logo"
          className="w-14 h-14 object-cover"
        />
      </div>
      {/* Job Title */}
      <h3 className="text-lg font-semibold text-gray-800">
        {job.title?.length > 15
          ? job.title.substring(0, 15) + "..."
          : job.title || "Unknown Title"}
      </h3>
      {/* Company Name */}
      <p className="text-sm text-gray-600">
        {job.employer_business_name?.length > 20
          ? job.employer_business_name.substring(0, 20) + "..."
          : job.employer_business_name || "Unknown Company"}
      </p>
      {/* Job Location */}
      <p className="text-sm text-gray-500 mt-1">
        {getLocationLabel(job.location)}
      </p>
      {/* Job Description (truncated, rendered as HTML) */}
      <div
        className="text-sm text-gray-700 mt-3"
        dangerouslySetInnerHTML={{
          __html:
            job.description?.length > 30
              ? job.description.slice(0, 30) + "..."
              : job.description || "No description available",
        }}
      ></div>
      {/* Footer: Deadline & Save Button */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-400">
          {job.deadline ? `Deadline: ${job.deadline}` : "No deadline"}
        </p>
        <SaveButton jobId={job.id} />
      </div>
    </div>
  );
};

const JobSearchAll = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 15;

  const API_URL = import.meta.env.VITE_API_URL;

  // Scroll to top when location state changes (e.g., navigation)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.state]);

  // Fetch all jobs from API
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        const res = await fetch(`${API_URL}/job/jobs/`);
        const data = await res.json();

        let jobList = [];
        if (Array.isArray(data)) jobList = data;
        else if (Array.isArray(data.results)) jobList = data.results;
        else if (Array.isArray(data.jobs)) jobList = data.jobs;

        // Standardize API response format
        setAllJobs(jobList);
        setJobs(jobList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      }
    };
    fetchAllJobs();
  }, []);

  // Update jobs when search results or all jobs change
  useEffect(() => {
    if (location.state?.jobs) {
      setJobs(location.state.jobs);
      setIsSearching(true);
      setCurrentPage(1);
    } else if (!isSearching) {
      setJobs(allJobs);
      setIsSearching(false);
    }
  }, [location.state, allJobs]);

  // Merge search result jobs with full job detail
  useEffect(() => {
    if (location.state?.jobs) {
      const merged = location.state.jobs.map((sJob) => {
        const full = allJobs.find((j) => j.id === sJob.id) || {};
        return { ...full, ...sJob };
      });

      setJobs(merged);
      setIsSearching(true);
      setCurrentPage(1);
    } else if (!isSearching) {
      setJobs(allJobs);
      setIsSearching(false);
    }
  }, [location.state, allJobs]);

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div>
      <EnterSearch collapse={isSearching} />

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isSearching ? "Search Results" : "All Available Jobs"}
          </h2>
          <div className="flex space-x-2">
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm">
              {jobs.length} Jobs
            </button>
            {isSearching && (
              <button
                onClick={() => {
                  setJobs(allJobs);
                  setIsSearching(false);
                  navigate("/job-search/all", { replace: true });
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm hover:bg-red-600"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Job Card UI */}
        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : currentJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => navigate(`/job-search/${job.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No jobs found.</p>
        )}

        {/* Pagination */}
        {jobs.length > 0 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <HiOutlineChevronLeft size={20} className="text-gray-600" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <HiOutlineChevronRight size={20} className="text-gray-600" />
              </button>
            </nav>
          </div>
        )}
      </div>

      <QuickSearchSection />
    </div>
  );
};

export default JobSearchAll;
