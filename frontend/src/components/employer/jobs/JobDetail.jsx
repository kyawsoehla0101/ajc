// src/components/jobs/JobDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJobDetail } from "../../../utils/api/jobAPI";
import { getLocationLabel } from "../../../utils/locationHelpers";
import usePageTitle from "../../../hooks/usePageTitle";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  // Format jobtype
  const formatJobType = (type) => {
    const map = {
      FULL: "Full-time",
      PART: "Part-time",
      INTERN: "Internship",
      REMOTE: "Remote",
    };
    return map[type] || type;
  };

  // Fetch job detail when the ID changes
  useEffect(() => {
    getJobDetail(id)
      .then((res) => setJob(res.data))
      .catch((err) => console.error("Error fetching job detail:", err));
  }, [id]);

  // Page Title
  usePageTitle(job?.title);

  if (!job) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading job details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10 border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>

        <p className="text-orange-600 font-medium text-lg">{job.employer}</p>

        {/* Location & Job Type Badges */}
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
            {getLocationLabel(job.location)}
          </span>

          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
            {formatJobType(job.job_type)}
          </span>
        </div>
      </div>

      {/* Job Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">Category:</span>{" "}
            {job.category_name || "N/A"}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">Priority:</span>{" "}
            {job.priority}
          </p>
        </div>

        <div>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">Salary:</span>{" "}
            {job.salary ? `${job.salary} MMK` : "N/A"}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">Deadline:</span>{" "}
            {job.deadline
              ? new Date(job.deadline).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            job.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {job.is_active ? "Active" : "Inactive"}
        </span>

        <span className="ml-3 text-gray-500 text-sm">
          Max Applicants: {job.max_applicants ?? 0}
        </span>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Job Description
        </h3>
        <div
          className="text-gray-700 leading-relaxed prose max-w-none break-words whitespace-pre-wrap overflow-hidden"
          dangerouslySetInnerHTML={{
            __html: job.description || "<p>No description provided.</p>",
          }}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 border-t pt-4 text-sm text-gray-500 flex justify-between">
        <p>
          <b>Created at:</b>{" "}
          {new Date(job.created_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p>
          <b>Updated at:</b>{" "}
          {new Date(job.updated_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
}
