// Apply Jobs API
export const JOB_APPLY_LIST_URL = "/application/application/apply/jobs/list/";

export const JOB_APPLY_REMOVE_URL = (id) =>
  `/application/application/apply/job/remove/${id}/`;

export const JOB_APPLY_ENDPOINT = (jobId) =>
  `/application/application/${jobId}/apply/`;

export const JOB_APPLY_DETAIL_URL = (id) =>
  `/application/application/apply/job/detail/${id}/`;

// Save Jobs API
export const SAVE_JOB_LIST_URL = "/application/saved/jobs/";

export const SAVE_JOB_ADD_URL = (jobId) =>
  `/application/saved/job/add/${jobId}/`;

export const SAVE_JOB_REMOVE_URL = (savedJobId) =>
  `/application/saved/job/remove/${savedJobId}/`;

// Apply Jobs Message
export const JOB_APPLY_MESSAGES = {
  SUCCESS: "Successfully applied for the job!",
  ALREADY_APPLIED: "You’ve already applied to this job.",
  JOB_CLOSED: "This job is no longer accepting applications.",
  FAILED: "Failed to apply. Please check your data or login again.",
};

// Save Jobs Message
export const SAVE_JOB_MESSAGES = {
  SAVED: "💾 Job saved successfully!",
  REMOVED: "🗑️ Job removed from saved list.",
  ALREADY_SAVED: "⚠️ You’ve already saved this job.",
  FAILED: "❌ Failed to save this job. Please try again.",
};
