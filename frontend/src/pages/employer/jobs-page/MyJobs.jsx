import React, { useState, useEffect } from "react";
import { getJobs, deleteJob } from "../../../utils/api/jobAPI";
import { useNavigate } from "react-router-dom";
import JobDeleteModal from "../../../components/employer/jobs/JobDeleteModal";
import Pagination from "../../../components/common/Pagination";
import usePageTitle from "../../../hooks/usePageTitle";

// Get CSRF Token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie("csrftoken");

export default function MyJobs() {
  usePageTitle("Jobs List");
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [showConfirm, setShowConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getJobs();
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchData();
  }, []);

  // Show delete confirmation modal
  const confirmDelete = (id) => {
    setJobToDelete(id);
    setShowConfirm(true);
  };

  // Delete job and update state
  const handleDelete = async (id) => {
    if (!id) return;

    try {
      await deleteJob(id, csrftoken);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
    } finally {
      setShowConfirm(false);
      setJobToDelete(null);
    }
  };

  // Navigate to job detail page
  const handleDetail = (id) =>
    navigate(`/employer/dashboard/my-jobs/${id}/detail`);
// Navigate to job edit page
  const handleEdit = (job) =>
    navigate(`/employer/dashboard/my-jobs/${job.id}/edit`);

  // Compute job status
  function getJobStatus(job) {
    const today = new Date();

    // Expired (deadline passed)
    if (job.deadline && new Date(job.deadline) < today) {
      return "Expired";
    }

    // Closed (is_active = false)
    if (!job.is_active) {
      return "Closed";
    }

    // Active
    return "Active";
  }

  // Filter jobs BEFORE pagination
  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase();

    // Search by title OR category name
    const matchesSearch =
      job.title?.toLowerCase().includes(search) ||
      job.category_name?.toLowerCase().includes(search);

    const jobStatus = getJobStatus(job);

    const matchesStatus =
      statusFilter === "All Status" ||
      jobStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination logic AFTER filteredJobs exists
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexFirst, indexLast);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  return (
    <div className="px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold text-gray-700">Post Jobs</h1>
        <button
          onClick={() => navigate("/employer/dashboard/job-create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
        >
          + Create a Job
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 bg-white border rounded-md p-3 shadow-sm focus:outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-48 bg-white border rounded-md p-3 shadow-sm"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Closed</option>
          <option>Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-gray-700 font-semibold text-sm">Title</th>
              <th className="p-3 text-gray-700 font-semibold text-sm">
                Job Category
              </th>
              <th className="p-3 text-gray-700 font-semibold text-sm">
                Post Date
              </th>
              <th className="p-3 text-gray-700 font-semibold text-sm">
                Status
              </th>
              <th className="p-3 text-gray-700 font-semibold text-sm">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-800">
                    {job.title?.length > 20
                      ? job.title.substring(0, 20) + "..."
                      : job.title || "N/A"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {job.category_name?.length > 20
                      ? job.category_name.substring(0, 20) + "..."
                      : job.category_name || "N/A"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {job.created_at
                      ? new Date(job.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-3 text-gray-600">{getJobStatus(job)}</td>
                  <td className="p-3 space-x-3">
                    <button
                      onClick={() => handleDetail(job.id)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(job)}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(job.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Delete Modal */}
      <JobDeleteModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => handleDelete(jobToDelete)}
        title="Confirm Delete"
        message="Are you sure you want to delete this job?"
      />
    </div>
  );
}
