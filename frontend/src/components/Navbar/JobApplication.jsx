import { useJobApply } from "../../context/JobApplyContext";
import { FileText, Trash2, Briefcase, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";

export default function JobApplications() {
  usePageTitle("Applied Jobs");
  const { applications, loading, message, removeApplication } = useJobApply();
  const navigate = useNavigate();

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-6 py-10 flex-grow">
        <h2 className="text-xl font-semibold mb-3">Job Applications</h2>

        {/* Success message */}
        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
            {message}
          </div>
        )}

        {/* Show empty state or applications */}
        {applications.length === 0 ? (
          <EmptyState />
        ) : (
          <ApplicationGrid
            applications={applications}
            onDelete={removeApplication}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

// Empty state Function
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-500/90 text-white rounded-full p-4 w-16 h-16 flex items-center justify-center">
          <FileText size={28} />
        </div>
      </div>
      <p className="text-gray-700 font-medium">No job applications yet.</p>
      <p className="text-gray-500 mt-1 text-sm">
        Apply to jobs to see them listed here.
      </p>
    </div>
  );
}

// ApplicationGrid Function
function ApplicationGrid({ applications, onDelete, navigate }) {
  return (
    <div
      className={`grid gap-5 ${
        applications.length % 2 === 1
          ? "grid-cols-1 sm:grid-cols-2 auto-rows-auto"
          : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {applications.map((app, index) => (
        <ApplicationCard
          key={app.id}
          app={app}
          index={index}
          total={applications.length}
          onDelete={onDelete}
          navigate={navigate}
        />
      ))}
    </div>
  );
}

// ApplicationCard Function
function ApplicationCard({ app, index, total, onDelete, navigate }) {
  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative ${
        total % 2 === 1 && index === total - 1 ? "sm:col-span-2" : ""
      }`}
    >
      {/* Delete button */}
      <button
        onClick={() => onDelete(app.id)}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
      >
        <Trash2 size={16} />
      </button>

      {/* Job title */}
      <h3 className="text-[16px] font-semibold flex items-center gap-2">
        <Briefcase size={18} className="text-[#D2691E]" />
        {app.job?.title || "Untitled Job"}
      </h3>

      {/* Employer */}
      <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
        <Building2 size={16} className="text-gray-500" />
        {app.job?.employer_business_name?.length > 15
          ? app.job?.employer_business_name.substring(0, 15) + "..."
          : app.job?.employer_business_name || "Unknown Company"}
      </p>

      {/* Applied date */}
      <p className="text-sm text-gray-600 mt-1">
        Applied at: {new Date(app.applied_at).toLocaleString()}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          className="mt-2 bg-[#D2691E] hover:bg-[#b45717] text-white text-sm font-medium py-2 px-5 rounded-md"
          onClick={() => navigate(`/job-search/${app.job}`)}
        >
          View Job
        </button>
        <button
          className="mt-2 bg-[#1E90FF] hover:bg-[#187bcd] text-white text-sm font-medium py-2 px-5 rounded-md"
          onClick={() => navigate(`/job-search/applications/${app.id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
