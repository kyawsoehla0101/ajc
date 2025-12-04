import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EnterSearch from "../EnterSearch";
import JobDetailView from "./JobDetailView";
import { useAuth } from "../../hooks/useAuth";
import ApplyModal from "../../components/Navbar/ApplyModal";
import { getLocationLabel } from "../../utils/locationHelpers";
import usePageTitle from "../../hooks/usePageTitle";

export default function JobSearch() {
  usePageTitle("Jobs");
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, loading } = useAuth();

  const query = new URLSearchParams(location.search);
  const initialMaximized = query.get("maximized") === "true";
  const [isMaximized, setIsMaximized] = useState(initialMaximized);

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const jobRefs = useRef({});

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (selectedJobId && jobRefs.current[selectedJobId]) {
      jobRefs.current[selectedJobId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedJobId]);

  useEffect(() => {
    if (selectedJobId) {
      if (window.innerWidth < 768) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }, [selectedJobId]);

  // Fetch Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(`${API_URL}/job/jobs/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const jobList = Array.isArray(res.data.jobs)
          ? res.data.jobs
          : res.data.results
          ? res.data.results
          : [];

        setJobs(jobList);
        setLoadingJobs(false);

        if (id) {
          const job = jobList.find((j) => String(j.id) === String(id));
          setSelectedJob(job || null);
          setSelectedJobId(job ? job.id : null);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [id]);

  // Apply button handler
  const handleApplyNow = () => {
    if (loading) return;
    if (user) {
      setIsApplyModalOpen(true);
    } else {
      navigate("/sign-in");
    }
  };

  const handleMaximizeToggle = () => {
    const newState = !isMaximized;
    setIsMaximized(newState);

    const params = new URLSearchParams(location.search);
    if (newState) params.set("maximized", "true");
    else params.delete("maximized");

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <>
      {/* Hero Search */}
      <EnterSearch />

      {/* Job Count */}
      {!isMaximized && (
        <div className="container mx-auto pt-8 px-4 grid md:grid-cols-3 gap-6">
          <div className="col-span-1 flex justify-between items-center">
            <span className="border px-3 py-1 rounded-full text-sm">
              {jobs.length} jobs
            </span>
            <button>
              <span className="text-2xl font-bold">⇵</span>
            </button>
          </div>
        </div>
      )}

      {/* Job List + Detail */}
      <div className="container mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Job List */}
        {!isMaximized && (
          <div
            className={`
    md:col-span-1 space-y-4 h-[700px] max-2xl:h-[550px] max-xl:h-[500px] max-lg:h-[450px] 
    overflow-y-auto pr-3
    ${selectedJobId ? "max-md:hidden" : ""}
  `}
          >
            {loadingJobs ? (
              <p className="text-gray-500 text-center">Loading jobs...</p>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div
                  key={job.id}
                  ref={(el) => (jobRefs.current[job.id] = el)}
                  onClick={() => {
                    setSelectedJob(job);
                    setSelectedJobId(job.id);
                    navigate(`/job-search/${job.id}`);
                  }}
                  className={`company-bg-custom rounded-lg p-4 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                    selectedJobId === job.id
                      ? "active-job-color shadow-lg"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h1 className="font-semibold">
                        {job.title?.length > 20
                          ? job.title.substring(0, 20) + "..."
                          : job.title}
                      </h1>
                      <p className="text-sm text-gray-500">
                        {job.employer_business_name?.length > 20
                          ? job.employer_business_name.substring(0, 20) + "..."
                          : job.employer_business_name || "Unknown Company"}
                      </p>
                      <p className="text-sm mt-1.5">
                        {getLocationLabel(job.location)}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {job.deadline
                          ? `Deadline: ${job.deadline}`
                          : "No deadline"}
                      </p>
                    </div>

                    {/* TEMP LOGO (you will replace this later) */}
                    <img
                      src={job.employer_logo || "/logo.png"}
                      alt="logo"
                      className="w-10 h-10"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No jobs available</p>
            )}

            <div className="container mx-auto flex justify-end mt-4 mb-8 space-x-2">
              <button
                onClick={() => navigate("/job-search/all")}
                className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                See More →
              </button>
            </div>
          </div>
        )}

        {/* Detail View */}
        <div
          className={`
    p-4 overflow-auto
    ${selectedJobId ? "max-md:h-full max-md:w-full" : ""}
    h-[750px] max-2xl:h-[600px] max-xl:h-[500px] max-lg:h-[450px]
    ${isMaximized ? "md:col-span-3" : "md:col-span-2"}
  `}
        >
          <JobDetailView
            job={selectedJob}
            isMaximized={isMaximized}
            onToggleMaximize={handleMaximizeToggle}
            onApplyNow={handleApplyNow}
          />
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          job={selectedJob}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </>
  );
}
