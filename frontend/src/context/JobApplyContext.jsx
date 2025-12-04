// src/context/JobApplyContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useJobApplyAuth } from "../hooks/useJobApplyAuth";
import {
  fetchApplyJobs,
  deleteApplyJob,
  fetchApplicationDetail,
  fetchSavedJobs,
} from "../utils/api/jobapplyAPI";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";

const JobApplyContext = createContext();

export const JobApplyProvider = ({ children }) => {
  const { user } = useAuth(); 
  const {
    applyJob: applyJobAPI,
    handleSaveJob,
    handleRemoveSavedJob,
    loading: applyLoading,
  } = useJobApplyAuth();

  const [applications, setApplications] = useState([]);
  const [applicationDetail, setApplicationDetail] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  //  FIXED LOAD EFFECT
  useEffect(() => {
    // user still loading → do nothing
    if (user === undefined) return;

    // user is logged out → skip everything
    if (!user) {
      setLoading(false);
      return;
    }

    // Profile exists → load normally
    loadApplications();
    loadSavedJobs();
  }, [user]);

  // Load Applications
  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchApplyJobs();
      setApplications(data);
    } finally {
      setLoading(false);
    }
  };

  // Load Saved Jobs  (FIXED)
  const loadSavedJobs = async () => {
    try {
      const res = await fetchSavedJobs();
      const data = res.s_savejobs || [];
      const normalized = data.map((item) => ({
        ...item,
        job: {
          ...item.job,
          isApplied: item.is_applied,
        },
      }));

      setSavedJobs(normalized);

    } catch (error) {

      //  FIX: Skip 404
      if (error.response?.status === 404) {
        console.log("No profile → skipping saved jobs");
        return;
      }
      console.log("Error loading saved jobs:", error);
    }
  };

  // Get Application Detail
  const getApplicationDetail = async (id) => {
    setLoading(true);
    try {
      const data = await fetchApplicationDetail(id);
      setApplicationDetail(data);
    } catch (error) {
      console.error("❌ Failed to load job application detail:", error);
      toast.error("Failed to load job application detail.");
    } finally {
      setLoading(false);
    }
  };

  // Add New Application
  const addApplication = (app) => {
    setApplications((prev) => [app, ...prev]);
  };

  // Apply Job
  const applyJob = async (job, coverLetter, onSuccess) => {
    await applyJobAPI(job, coverLetter, () => {
      addApplication({
        id: Date.now(),
        job: {
          title: job.title,
          employer: job.employer_name || "Unknown",
        },
        applied_at: new Date().toISOString(),
      });

      // update saved jobs list
      setSavedJobs((prev) =>
        prev.map((item) =>
          item.job?.id === job.id
            ? { ...item, job: { ...item.job, isApplied: true } }
            : item
        )
      );

      onSuccess?.();
    });
  };

  // Remove Application
  const removeApplication = async (id) => {
    await deleteApplyJob(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setMessage("Application removed!");
    setTimeout(() => setMessage(null), 2000);
  };

  // Remove Saved Job
  const unsaveJob = async (savedJobId) => {
    try {
      await handleRemoveSavedJob(savedJobId, () => {
        setSavedJobs((prev) => prev.filter((job) => job.id !== savedJobId));
      });
    } catch (error) {
      console.error("❌ Failed to unsave job:", error);
    }
  };

  return (
    <JobApplyContext.Provider
      value={{
        applications,
        applicationDetail,
        savedJobs,
        loading,
        message,

        applyJob,
        applyLoading,
        unsaveJob,
        addApplication,
        removeApplication,
        getApplicationDetail,
      }}
    >
      {children}
    </JobApplyContext.Provider>
  );
};

export const useJobApply = () => useContext(JobApplyContext);
