import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobApply } from "../../context/JobApplyContext";
import { getLocationLabel } from "../../utils/locationHelpers";
import usePageTitle from "../../hooks/usePageTitle";

export default function JobApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getApplicationDetail, applicationDetail, loading } = useJobApply();

  // Page title
  usePageTitle(
    applicationDetail?.job?.title
      ? `${applicationDetail.job.title} | Applied Job Detail`
      : "Job Application Detail"
  );

  // Fetch application detail on component mount
  useEffect(() => {
    if (id) getApplicationDetail(id);
  }, [id]);

  // Loading state
  if (loading)
    return <p className="p-8 text-center">Loading job application detail...</p>;

  // No data found
  if (!applicationDetail)
    return <p className="p-8 text-center">Job application not found.</p>;

  const { applied_at, job } = applicationDetail;

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 underline text-sm"
      >
        ← Back
      </button>
      {/* Job header (Title, Employer Name, Location, Applied date) */}
      <h1 className="text-2xl font-semibold mb-2">{job?.title}</h1>
      <p className="text-gray-600">{job?.employer_business_name}</p>
      <p className="text-gray-500 text-sm mb-3">
        {getLocationLabel(job?.location)} • {job?.job_type}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Applied at: {applied_at ? new Date(applied_at).toLocaleString() : "—"}
      </p>

      {/* Job details box (Category Name, Salary, Deadline, Description) */}
      <div className="bg-gray-50 p-5 rounded-lg border mt-4">
        <p className="text-gray-700 mb-2">
          <strong>Category:</strong> {job?.category_name}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Salary:</strong> ${job?.salary}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Deadline:</strong>{" "}
          {job?.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}
        </p>
        <p
          className="text-gray-700 mt-4 whitespace-pre-wrap break-words overflow-hidden"
          dangerouslySetInnerHTML={{
            __html: job.description || "No description available",
          }}
        ></p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate(`/job-search/${job?.id}`)}
          className="bg-[#D2691E] hover:bg-[#b45717] text-white py-2 px-6 rounded-md"
        >
          View Job Post
        </button>
        {/* 
        <button
          onClick={() => window.print()}
          className="bg-gray-200 hover:bg-gray-300 text-black py-2 px-4 rounded-md"
        >
          Print
        </button> */}
      </div>
    </div>
  );
}
