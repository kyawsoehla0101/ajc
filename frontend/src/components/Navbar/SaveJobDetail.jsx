import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getLocationLabel } from "../../utils/locationHelpers";
import usePageTitle from "../../hooks/usePageTitle";

export default function SavedJobDetail() {
  const { id } = useParams();
  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Page Title
  usePageTitle(
    jobDetail?.job?.title ? `${jobDetail.job.title} | Saved` : "Saved Job"
  );

  useEffect(() => {
    // Saved Job Detail
    async function fetchJobDetail() {
      try {
        // Send GET request to fetch saved job detail by ID
        const response = await axios.get(
          `${API_URL}/application/saved/job/detail/${id}/`,
          { withCredentials: true }
        );
        setJobDetail(response.data.saved_job);
      } catch (error) {
        console.error("Failed to load job detail:", error);
      } finally {
        setLoading(false);
      }
    }
    // Call the async function
    fetchJobDetail();
  }, [id]);

  if (loading) return <p className="p-8 text-center">Loading job detail...</p>;
  if (!jobDetail) return <p className="p-8 text-center">Job not found.</p>;

  const { job } = jobDetail;

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 underline text-sm"
      >
        ← Back
      </button>

      {/* title, employer name, location, job type, category, salary, deadline, description */}
      <h1 className="text-2xl font-semibold mb-2">{job.title}</h1>
      <p className="text-gray-600">{job.employer_business_name}</p>
      <p className="text-gray-500 text-sm mb-3">
        {getLocationLabel(job.location)} • {job.job_type}
      </p>

      <div className="bg-gray-50 p-5 rounded-lg border">
        <p className="text-gray-700 mb-2">
          <strong>Category:</strong> {job.category_name}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Salary:</strong> ${job.salary}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Deadline:</strong> {job.deadline}
        </p>
        <p
          className="text-gray-700 mt-4"
          dangerouslySetInnerHTML={{
            __html: job.description || "No description available",
          }}
        ></p>
      </div>

      {/* <button className="mt-6 bg-[#D2691E] hover:bg-[#b45717] text-white py-2 px-6 rounded-md">
        Apply Now
      </button> */}
    </div>
  );
}
