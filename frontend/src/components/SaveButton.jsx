import { Save, BookmarkCheck } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function SaveButton({ jobId }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [isSaved, setIsSaved] = useState(false);
  const [savedJobId, setSavedJobId] = useState(null);

  const csrftoken = getCookie("csrftoken");
  const token = localStorage.getItem("token");

  // Load saved state
  useEffect(() => {
    if (!token || !jobId) return;

    async function load() {
      try {
        const res = await axios.get(`${API_URL}/application/saved/jobs/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const found = res.data.s_savejobs.find(
          (item) => item.job.id === jobId
        );

        if (found) {
          setIsSaved(true);
          setSavedJobId(found.id);
        } else {
          setIsSaved(false);
          setSavedJobId(null);
        }
      } catch (err) {
        console.log("Load saved job error:", err);
      }
    }

    load();
  }, [jobId]);

  // Toggle Save / Unsave 
  async function toggleSave(e) {
    e.stopPropagation();

    if (!token) {
      toast.error("Please sign in to save jobs.");
      return;
    }

    try {
      if (!isSaved) {
        // SAVE
        const res = await axios.post(
          `${API_URL}/application/save/job/${jobId}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRFToken": csrftoken,
            },
            withCredentials: true,
          }
        );

        toast.success("Job saved!");
        setIsSaved(true);
        setSavedJobId(res.data.id);
      } else {
        // UNSAVE
        await axios.delete(
          `${API_URL}/application/saved/job/remove/${savedJobId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRFToken": csrftoken,
            },
            withCredentials: true,
          }
        );

        toast.success("Removed from saved jobs.");
        setIsSaved(false);
        setSavedJobId(null);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to save job.");
    }
  }

  return (
    // Clickable icon to toggle saved state for a job
    <div onClick={toggleSave} className="cursor-pointer">
      {isSaved ? (
        // If saved (green)
        <BookmarkCheck className="text-green-600" size={22} />
      ) : (
        // If not saved (blue)
        <Save className="text-blue-500" size={22} />
      )}
    </div>
  );
}
