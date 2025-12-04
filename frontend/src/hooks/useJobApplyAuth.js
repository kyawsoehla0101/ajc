// src/hooks/useJobApplyAuth.js
import { useState } from "react";
import { toast } from "react-hot-toast";
import { applyForJob, saveJob, removeSavedJob } from "../utils/api/jobapplyAPI";
import {
  JOB_APPLY_MESSAGES,
  SAVE_JOB_MESSAGES,
} from "../utils/constants/jobapplyConstants";

export function useJobApplyAuth() {
  const [loading, setLoading] = useState(false);

  // ✅ Apply Job Function
  // ======================
  const applyJob = async (job, coverLetter, onSuccess) => {
    if (!job?.id) {
      toast.error("Invalid job. Please try again.");
      return;
    }

    const token = localStorage.getItem("access");
    setLoading(true);

    try {
      const res = await applyForJob(job.id, coverLetter, token);

      if (res.status === 200 || res.status === 201) {
        toast.success(JOB_APPLY_MESSAGES.SUCCESS);
        onSuccess?.();
      }
    } catch (err) {
      const data = err.response?.data;
      console.error("Apply error: ", data);

      if (data?.code === "ALREADY_APPLIED")
        toast.error(JOB_APPLY_MESSAGES.ALREADY_APPLIED);
      else if (data?.code === "JOB_CLOSED")
        toast.error(JOB_APPLY_MESSAGES.JOB_CLOSED);
      else if (Array.isArray(data?.detail)) toast.error(data.detail.join(", "));
      else toast.error(JOB_APPLY_MESSAGES.FAILED);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save Job Function
  // ======================
  const handleSaveJob = async (jobId, onSuccess) => {
    setLoading(true);
    try {
      const res = await saveJob(jobId);
      toast.success(SAVE_JOB_MESSAGES.SAVED);
      onSuccess?.(res);
    } catch (error) {
      const data = error.response?.data;
      console.error("Save job error:", data);

      if (data?.code === "ALREADY_SAVED")
        toast.error(SAVE_JOB_MESSAGES.ALREADY_SAVED);
      else toast.error(SAVE_JOB_MESSAGES.FAILED);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove Saved Job
  // ======================
  const handleRemoveSavedJob = async (jobId, onSuccess) => {
    setLoading(true);
    try {
      await removeSavedJob(jobId);
      toast.success(SAVE_JOB_MESSAGES.REMOVED);
      onSuccess?.();
    } catch (error) {
      console.error("Remove saved job error:", error);
      toast.error(SAVE_JOB_MESSAGES.FAILED);
    } finally {
      setLoading(false);
    }
  };

  return { applyJob, handleSaveJob, handleRemoveSavedJob, loading };
}
