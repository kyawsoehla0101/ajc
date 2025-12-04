import { useState, useEffect } from "react";
import { Bookmark, Trash2, Briefcase, Building2, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useJobApply } from "../../context/JobApplyContext";
import ApplyModal from "../../components/Navbar/ApplyModal";
import { toast } from "react-hot-toast";
import usePageTitle from "../../hooks/usePageTitle";

export default function SaveJobs() {
  usePageTitle("Saved Jobs");
  const navigate = useNavigate();
  const { token } = useAuth();
  const { savedJobs, unsaveJob, loading } = useJobApply();

  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("🟢 Saved Jobs Updated:", savedJobs);
  }, [savedJobs]);

  // Open Apply Modal
  const handleApplyNow = (job) => {
    if (!token) {
      toast.error("Please log in to apply for this job.");
      navigate("/signin");
      return;
    }

    if (!job?.is_active) {
      toast.error("This job is no longer active.");
      return;
    }

    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // Unsave job
  const handleDelete = async (jobId) => {
    await unsaveJob(jobId);
  };

  if (loading) return <p className="p-8 text-center">Loading saved jobs...</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-6 py-10 flex-grow">
        <h2 className="text-xl font-semibold mb-3">Jobs Saved</h2>

        {savedJobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500/90 text-white rounded-full p-4 w-16 h-16 flex items-center justify-center">
                <Bookmark size={28} />
              </div>
            </div>
            <p className="text-gray-700 font-medium">No saved jobs yet.</p>
            <p className="text-gray-500 mt-1 text-sm">
              Save jobs you're interested in so you can come back to them later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((item, index) => {
              const job = item.job || {};
              const isLastOdd =
                savedJobs.length % 2 !== 0 && index === savedJobs.length - 1;

              return (
                <div
                  key={item.id}
                  className={`bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative ${
                    isLastOdd ? "md:col-span-2" : ""
                  }`}
                >
                  {/* Unsave Job */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Job Info (title, category name, employer name) */}
                  <h3 className="text-[16px] font-semibold flex items-center gap-2">
                    <Briefcase size={18} className="text-[#D2691E]" />
                    {job.title || "Untitled Job"}
                  </h3>

                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Folder size={16} className="text-gray-500" />
                    {job.category_name || "Uncategorized"}
                  </p>

                  <p className="text-sm font-medium mt-1 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-500" />
                    {job.employer_business_name || "Unknown Company"}
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleApplyNow(job)}
                      disabled={job.isApplied || job.is_applied}
                      className={`mt-2 ${
                        job.isApplied || job.is_applied
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white text-sm font-medium py-2 px-5 rounded-md`}
                    >
                      {job.isApplied || job.is_applied
                        ? "✅ Applied"
                        : "Apply Now"}
                    </button>

                    <button
                      onClick={() => navigate(`/job-search/saved/${item.id}`)}
                      className="mt-2 bg-[#D2691E] hover:bg-[#b45717] text-white text-sm font-medium py-2 px-5 rounded-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={selectedJob}
        />
      )}
    </div>
  );
}
