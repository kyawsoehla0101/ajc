// src/pages/employer/jobs-page/EditJob.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobDetail,
  updateJob,
  getCategories,
} from "../../../utils/api/jobAPI";
import { toast } from "react-hot-toast";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import usePageTitle from "../../../hooks/usePageTitle";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // job-type arrays
  const JOB_TYPE_CHOICES = [
    { value: "FULL", label: "Full-time" },
    { value: "PART", label: "Part-time" },
    { value: "INTERN", label: "Internship" },
    { value: "REMOTE", label: "Remote" },
  ];

  // Location arrays
  const LOCATION_CHOICES = [
    { value: "MRAUK-U", label: "MRAUK-U" },
    { value: "MINBRAR", label: "MINBRAR" },
    { value: "SITTWE", label: "SITTWE" },
    { value: "RETHEEDAUNG", label: "RETHEEDAUNG" },
    { value: "MAUNGDAW", label: "MAUNGDAW" },
    { value: "KYAWTPYHU", label: "KYAWTPYHU" },
    { value: "THANDWE", label: "THANDWE" },
    { value: "TOUNGUP", label: "TOUNGUP" },
    { value: "ANN", label: "ANN" },
    { value: "PONNAGYUN", label: "PONNAGYUN" },
    { value: "KYAUKTAW", label: "KYAUKTAW" },
    { value: "RAMREE", label: "RAMREE" },
    { value: "MANAUNG", label: "MANAUNG" },
    { value: "GWA", label: "GWA" },
    { value: "PAUKTAW", label: "PAUKTAW" },
    { value: "BUTHIDAUNG", label: "BUTHIDAUNG" },
    { value: "MYEBON", label: "MYEBON" },
  ];

  const PRIORITY_CHOICES = [
    { value: "NORMAL", label: "Normal" },
    { value: "FEATURED", label: "Featured" },
    { value: "URGENT", label: "Urgent" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, catRes] = await Promise.all([
          getJobDetail(id),
          getCategories(),
        ]);
        setJob(jobRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load job or categories");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  usePageTitle(`${job?.title} | Edit`);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJob({
      ...job,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJob(id, job);
      toast.success("Job updated successfully");
      navigate("/employer/dashboard/my-jobs");
    } catch (err) {
      console.error("Error updating job:", err.response?.data || err);
      toast.error("Failed to update job");
    }
  };

  // description quillModuls
  // Full toolbar configuration
  const quillModules = {
    toolbar: [
      [{ font: [] }, { size: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  if (loading) return <p>Loading...</p>;
  if (!job) return <p>Job not found</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            name="title"
            value={job.title || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Job Type (looped) */}
        <div>
          <label className="block mb-1 font-medium">Job Type</label>
          <select
            name="job_type"
            value={job.job_type || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Job Type</option>
            {JOB_TYPE_CHOICES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location (looped) */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <select
            name="location"
            value={job.location || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Location</option>
            {LOCATION_CHOICES.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>

        {/* Salary */}
        <div>
          <label className="block mb-1 font-medium">Salary</label>
          <input
            name="salary"
            type="number"
            step="0.01"
            value={job.salary || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block mb-1 font-medium">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={job.deadline ? job.deadline.split("T")[0] : ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            name="category"
            value={job.category || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Max Applicants */}
        <div>
          <label className="block mb-1 font-medium">Max Applicants</label>
          <input
            type="number"
            name="max_applicants"
            value={job.max_applicants || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Priority (looped) */}
        <div>
          <label className="block mb-1 font-medium">Priority</label>
          <select
            name="priority"
            value={job.priority || "NORMAL"}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {PRIORITY_CHOICES.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={job.is_active || false}
            onChange={handleChange}
          />
          <label className="font-medium">Active</label>
        </div>

        {/* Employer (read-only) */}
        <div>
          <label className="block mb-1 font-medium">Employer</label>
          <input
            name="employer"
            value={job.employer || ""}
            readOnly
            className="w-full border p-2 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <ReactQuill
            theme="snow"
            value={job.description || ""}
            onChange={(value) =>
              setJob((prev) => ({
                ...prev,
                description: value,
              }))
            }
            modules={quillModules}
            formats={quillFormats}
            placeholder="Write a detailed job description..."
            className="bg-white rounded-lg border border-gray-300 min-h-[200px] mb-10"
          />
        </div>

        {/* save change button */}
        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
