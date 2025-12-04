import { useNavigate } from "react-router-dom";
import { getLocationLabel } from "../../utils/locationHelpers";
import SaveButton from "../../components/SaveButton";

export default function JobCard({ job }) {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Relative Time
  function getRelativeTime(dateString) {
    if (!dateString) return "No deadline";

    const target = new Date(dateString); // deadline date
    const now = new Date();

    const diffMs = target - now; // difference in milliseconds
    const diffSec = Math.floor(diffMs / 1000);

    const minutes = Math.floor(Math.abs(diffSec) / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

     // If deadline is in the future
    if (diffMs > 0) {
      if (days > 0) return `${days} days left`;
      if (hours > 0) return `${hours} hours left`;
      if (minutes > 0) return `${minutes} minutes left`;
      return "Ending soon";
    }

    // If deadline is in the past
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;

    return "Just now";
  }

  // RENDER 
  return (
    <div
      className="bg-white py-4 px-6 border border-[#F4F5F7] rounded-3xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col gap-2"
      onClick={() => navigate(`/job-search/${job.id}`)}
    >
      <div className="flex items-start justify-between">
        {/* LEFT — Text Info (title, category name, employer name) */}
        <div className="flex-1 pr-3">
          <h3 className="font-bold text-xl gray-text-custom">
            {job.title?.length > 15
              ? job.title.substring(0, 15) + "..."
              : job.title}
          </h3>

          <p className="text-sm gray-text-custom mt-1">
            {job.category_name?.length > 20
              ? job.category_name.substring(0, 20) + "..."
              : job.category_name || "Not specified"}
          </p>

          <h5
            className="font-semibold gray-text-custom mt-1"
            style={{ fontSize: "15px" }}
          >
            {job.employer_business_name?.length > 15
              ? job.employer_business_name.substring(0, 15) + "..."
              : job.employer_business_name || "Unknown Company"}
          </h5>
        </div>

        {/* RIGHT — Company Logo */}
        <div className="flex-shrink-0 self-center">
          <img
            src={
              job.employer_logo ? `${API_URL}${job.employer_logo}` : "/logo.png"
            }
            alt="Employer Logo"
            className="w-14 h-14 object-cover"
          />
        </div>
      </div>

      {/* Meta Info List with Icons */}
      <ul className="text-sm mt-1 space-y-1 gray-text-custom">
        {/* Location */}
        <li>
          <span>{getLocationLabel(job.location || "No location")}</span>
        </li>

        {/* Salary */}
        <li>
          <span>${job.salary || "Negotiable"}</span>
        </li>

        {/* Short Description */}
        <li className="pt-1">
          <span
            dangerouslySetInnerHTML={{
              __html: job.description
                ? job.description.length > 35
                  ? job.description.slice(0, 35) + "..."
                  : job.description
                : "No description available.",
            }}
          ></span>
        </li>
      </ul>

      <div className="mt-auto flex items-center justify-between pt-3">
        <p className="text-xs gray-text-custom">
          {getRelativeTime(job.deadline)}
        </p>

        <SaveButton jobId={job.id} />
      </div>
    </div>
  );
}
