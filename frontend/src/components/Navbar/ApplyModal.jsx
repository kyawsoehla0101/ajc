import React, { useState } from "react";
import { useJobApply } from "../../context/JobApplyContext";

export default function ApplyModal({ isOpen, onClose, job, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState("");
  const { applyJob, loading } = useJobApply();

  // Do not render modal if not open
  if (!isOpen) return null;

  // HandleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    applyJob(job, coverLetter, () => {
      onClose();
      onSuccess?.();
    });
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mt-14 max-h-[90vh] overflow-y-auto animate-slideDown p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Apply for {job.title}</h2>
          <button onClick={onClose} className="text-gray-600 text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover Letter */}
          <div>
            <label className="block font-medium mb-1">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Write something about why you want this job..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? "bg-gray-400" : "bg-blue-600"
              } text-white px-6 py-2 rounded-lg`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="bg-blue-100 text-blue-600 px-6 py-2 rounded-lg"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
