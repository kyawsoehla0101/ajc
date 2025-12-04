import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Briefcase, DollarSign, CalendarDays } from "lucide-react";
import { CiMaximize1 } from "react-icons/ci";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ApplyModal from "../../components/Navbar/ApplyModal";
import { toast } from "react-hot-toast";
import { getLocationLabel } from "../../utils/locationHelpers";
import usePageTitle from "../../hooks/usePageTitle";

export default function JobDetailView({ job, onToggleMaximize }) {
  usePageTitle(job?.title || "JobDetail");
  // ==================== STATES ====================
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedJobId, setSavedJobId] = useState(null); // ✅ SavedJob ID

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Profile Data
  const [profile, setProfile] = useState(null);
  const [skillList, setSkillList] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [resumeList, setResumeList] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const { token, user } = useAuth();
  const navigate = useNavigate();

  // CSRF token function
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
  // variables csrfToken
  const csrftoken = getCookie("csrftoken");

  // CHECK IF APPLIED
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!token || !job?.id) return;
      try {
        const res = await axios.get(
          `${API_URL}/application/application/apply/jobs/list/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        const found = res.data.apply_jobs.some(
          (item) => item.job.id === job.id
        );
        setIsApplied(found);
      } catch (err) {
        console.error("❌ Check applied failed:", err);
        setIsApplied(false);
      }
    };
    fetchAppliedJobs();
  }, [job?.id, token]);

  // CHECK IF SAVED
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!token || !job?.id) {
        setIsSaved(false);
        setSavedJobId(null);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/application/saved/jobs/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const savedList = res?.data?.s_savejobs || [];
        if (!Array.isArray(savedList)) return;

        const foundItem = savedList.find((item) => item.job?.id === job.id);
        if (foundItem) {
          setIsSaved(true);
          setSavedJobId(foundItem.id);
        } else {
          setIsSaved(false);
          setSavedJobId(null);
        }
      } catch (err) {
        console.error("Fetch saved jobs failed:", err);
        setIsSaved(false);
        setSavedJobId(null);
      }
    };
    fetchSavedJobs();
  }, [job?.id, token]);

  // FETCH PROFILE DATA
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setProfile(null);
        setSkillList([]);
        setLanguageList([]);
        setEducationList([]);
        setExperienceList([]);
        setResumeList([]);
        return;
      }

      try {
        const profileRes = await axios.get(
          `${API_URL}/accounts-jobseeker/jobseekerprofile/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const prof =
          Array.isArray(profileRes.data) && profileRes.data.length > 0
            ? profileRes.data[0]
            : null;

        setProfile(prof);

        if (prof?.id) {
          const [skills, langs, edu, exp, resume] = await Promise.all([
            // skill api
            axios.get(
              `${API_URL}/accounts-jobseeker/skill/?profile=${prof.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            // language api
            axios.get(
              `${API_URL}/accounts-jobseeker/language/?profile=${prof.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            // education api
            axios.get(
              `${API_URL}/accounts-jobseeker/education/?profile=${prof.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            // experience api
            axios.get(
              `${API_URL}/accounts-jobseeker/experience/?profile=${prof.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            // resume api
            axios.get(
              `${API_URL}/accounts-jobseeker/resume/?profile=${prof.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
          ]);

          setSkillList(skills.data);
          setLanguageList(langs.data);
          setEducationList(edu.data);
          setExperienceList(exp.data);
          setResumeList(resume.data);
        }
      } catch (err) {
        console.error(" Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [token, user]);

  // APPLY MODAL HANDLER
  const handleOpenModal = () => {
    if (!token) {
      toast.error("Please sign in to apply for jobs.");
      navigate("/sign-in");
      return;
    }

    if (!job?.is_active || isApplied || !token) return;

    const missingProfileData =
      !profile?.id ||
      skillList.length === 0 ||
      languageList.length === 0 ||
      educationList.length === 0 ||
      experienceList.length === 0 ||
      resumeList.length === 0;

    if (missingProfileData) {
      toast.error(
        "Your profile is incomplete. Please finish it to continue applying."
      );
      navigate("/profile/me");
      return;
    }

    setIsModalOpen(true);
  };

  // SAVE / UNSAVE TOGGLE
  async function handleToggleSave(e) {
    e.stopPropagation();
    if (!token) {
      toast.error("Please sign in to save jobs.");
      navigate("/sign-in");
      return;
    }

    try {
      if (!isSaved) {
        // SAVE JOB
        const res = await axios.post(
          `${API_URL}/application/save/job/${job.id}/`,
          {},
          {
            headers: {
              "X-CSRFToken": csrftoken,
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        toast.success("Job saved successfully!");
        setIsSaved(true);

        // refresh saved list to get savedJobId
        const refresh = await axios.get(`${API_URL}/application/saved/jobs/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedList = refresh.data.s_savejobs || [];
        const foundItem = savedList.find((i) => i.job?.id === job.id);
        if (foundItem) setSavedJobId(foundItem.id);

        console.log("✅ Save Response:", res.data);
      } else {
        // UNSAVE JOB (use savedJobId)
        if (!savedJobId) {
          toast.error("Saved job ID not found!");
          return;
        }

        const res = await axios.delete(
          `${API_URL}/application/saved/job/remove/${savedJobId}/`,
          {
            headers: {
              "X-CSRFToken": csrftoken,
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        toast.success("Job unsaved successfully!");
        setIsSaved(false);
        setSavedJobId(null);
        console.log("🗑️ Unsave Response:", res.data);
      }
    } catch (error) {
      console.error("Save toggle failed:", error);
      toast.error(
        "Your profile is incomplete. Please finish it to continue saving jobs"
      );
      navigate("/profile/me");
    }
  }

  // NO JOB SELECTED
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h4 className="font-semibold text-lg">Choose a job you like</h4>
        <p className="text-sm text-gray-500 mt-2">Detail will appear here</p>
      </div>
    );
  }

  // RENDER
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{job.title}</h2>
          <p className="text-gray-600">{job.employer_business_name || "Unknown Company"}</p>
        </div>
        <button onClick={onToggleMaximize}>
          <CiMaximize1 size={20} className="text-gray-600 cursor-pointer" />
        </button>
      </div>

      {/* Meta Info */}
      <div className="mt-4 space-y-2 text-gray-600 text-sm">
        <p className="flex items-center gap-2"></p>
        <p className="flex items-center gap-2">
          <MapPin size={16} /> {getLocationLabel(job.location || "Not Location")}
        </p>
        <p className="flex items-center gap-2">
          <Briefcase size={16} /> {job.category_name || "Not specified"}
        </p>
        <p className="flex items-center gap-2">
          <DollarSign size={16} /> ${job.salary || "Negotiable"}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays size={16} />{" "}
          {job.deadline ? `Deadline: ${job.deadline}` : "No deadline"}
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleOpenModal}
          disabled={!job?.is_active || isApplying || isApplied}
          className={`px-6 py-2 rounded-md text-white font-semibold transition-colors duration-200 cursor-pointer ${
            isApplied
              ? "bg-green-600 cursor-not-allowed opacity-70"
              : isApplying
              ? "bg-blue-400 cursor-wait"
              : job?.is_active
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }`}
        >
          {isApplied ? "✅ Applied" : isApplying ? "Applying..." : "Apply Now"}
        </button>

        <button
          onClick={handleToggleSave}
          className={`px-6 py-2 rounded-md border font-semibold text-gray-700 cursor-pointer transition-all duration-200 ${
            isSaved
              ? "border-red-400 bg-red-50 hover:bg-red-100 text-red-600"
              : "border-gray-400 hover:bg-gray-100"
          }`}
        >
          {isSaved ? "Unsave" : "Save"}
        </button>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={job}
        onSuccess={() => setIsApplied(true)}
      />

      {/* Description */}
      <div className="mt-8">
        <div
          className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words overflow-hidden"
          dangerouslySetInnerHTML={{
            __html: job.description || "No description available",
          }}
        ></div>
      </div>
    </>
  );
}
