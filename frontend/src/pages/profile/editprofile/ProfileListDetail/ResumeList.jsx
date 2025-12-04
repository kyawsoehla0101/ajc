import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Edit, Star, Trash2, Image as ImageIcon, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ResumeList({
  profileId,
  resumeList,
  setResumeList,
  onEdit,
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch resume list (initial load)
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    axios
      .get(`${API_URL}/accounts-jobseeker/resume/?profile=${profileId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setResumeList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching resumes:", err);
        setLoading(false);
      });
  }, [profileId, setResumeList]);

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

  // Set Default Resume
  const handleSetDefault = async (id) => {
    try {
      await axios.put(
        `${API_URL}/accounts-jobseeker/resume/${id}/`,
        { is_default: true },
        { withCredentials: true }
      );
      setResumeList((prev) =>
        prev.map((r) => ({ ...r, is_default: r.id === id }))
      );
    } catch (err) {
      console.error("Failed to set default:", err);
      toast.error("Failed to set default resume.");
    }
  };

  // Delete Resume
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    const token = localStorage.getItem("access");
    const csrftoken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];

    try {
      await axios.delete(`${API_URL}/accounts-jobseeker/resume/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true,
      });

      setResumeList((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed: Unauthorized or missing token.");
    }
  };

  if (loading) return <p className="text-gray-500">Loading resumes...</p>;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
        My Resumes
      </h2>

      {!resumeList || resumeList.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-5xl mb-3">📂</p>
          <p>No resumes uploaded yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {resumeList.map((resume) => {
            const isImage =
              resume.file &&
              (resume.file.endsWith(".png") ||
                resume.file.endsWith(".jpg") ||
                resume.file.endsWith(".jpeg"));

            return (
              <li
                key={resume.id}
                className={`flex justify-between items-start border p-4 rounded-lg transition-all duration-200 gap-2 ${
                  resume.is_default
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Left side: preview + info */}
                <div className="flex items-start gap-4">
                  {isImage ? (
                    <img
                      src={resume.file}
                      alt={resume.title}
                      className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                      onClick={() => setPreview(resume.file)}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 flex items-center justify-center border rounded-lg bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200 transition"
                      onClick={() => window.open(resume.file, "_blank")}
                    >
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 w-full">
                    <div className="min-w-0 w-full">
                      {/* TITLE */}
                      <span
                        className="font-medium text-gray-800 text-base break-words whitespace-pre-wrap min-w-0 w-full block
      "
                        style={{ wordBreak: "break-word" }}
                      >
                        {resume.title}
                      </span>

                      {/* DEFAULT BADGE */}
                      {resume.is_default && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                          Default
                        </span>
                      )}
                    </div>

                    {/* VIEW FILE */}
                    {!isImage && (
                      <a
                        href={resume.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm underline mt-1"
                      >
                        <Eye className="w-4 h-4" />
                        View File
                      </a>
                    )}
                  </div>
                </div>

                {/* Right side: actions with icons */}
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => onEdit(resume)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {!resume.is_default && (
                    <button
                      onClick={() => handleSetDefault(resume.id)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      <Star className="w-4 h-4" />
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Image Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg p-3">
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={preview}
              alt="Preview"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
