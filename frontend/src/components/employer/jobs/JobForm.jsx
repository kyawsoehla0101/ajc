import React, { useEffect, useState } from "react";
import { createJob, updateJob, getJobDetail } from "../../../utils/api/jobAPI";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEmployerAuth } from "../../../hooks/useEmployerAuth";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function JobForm({ jobId }) {
  const navigate = useNavigate();
  const { employer } = useEmployerAuth();
  const [categories, setCategories] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // API base URL
  const API_URL = import.meta.env.VITE_API_URL;

  // FormData
  const [formData, setFormData] = useState({
    title: "",
    employer: "",
    job_type: "",
    location: "",
    salary: "",
    deadline: "",
    description: "",
    category: "",
    is_active: true,
    max_applicants: "",
    priority: "NORMAL",
  });

  // JOB_TYPE_CHOICES
  const JOB_TYPE_CHOICES = [
    { value: "FULL", label: "Full-time" },
    { value: "PART", label: "Part-time" },
    { value: "INTERN", label: "Internship" },
    { value: "REMOTE", label: "Remote" },
  ];

  // LOCATION_CHOICES
  const LOCATION_CHOICES = [
    { value: "MO", label: "MRAUK-U" },
    { value: "MB", label: "MINBRAR" },
    { value: "SIT", label: "SITTWE" },
    { value: "RD", label: "RETHEEDAUNG" },
    { value: "MD", label: "MAUNGDAW" },
    { value: "KP", label: "KYAWTPYHU" },
    { value: "TD", label: "THANDWE" },
    { value: "TG", label: "TOUNGUP" },
    { value: "AN", label: "ANN" },
    { value: "PNG", label: "PONNAGYUN" },
    { value: "KT", label: "KYAUKTAW" },
    { value: "RM", label: "RAMREE" },
    { value: "MA", label: "MANAUNG" },
    { value: "GW", label: "GWA" },
    { value: "PT", label: "PAUKTAW" },
    { value: "BTD", label: "BUTHIDAUNG" },
    { value: "MBN", label: "MYEBON" },
  ];

  // PRIORITY_CHOICES
  const PRIORITY_CHOICES = [
    { value: "NORMAL", label: "Normal" },
    { value: "FEATURED", label: "Featured" },
    { value: "URGENT", label: "Urgent" },
  ];

  // Pre-fill employer
  useEffect(() => {
    if (employer) {
      setFormData((prev) => ({ ...prev, employer: employer.id }));
    }
  }, [employer]);

  // Load job detail if editing
  useEffect(() => {
    if (!jobId) return;

    getJobDetail(jobId).then((res) => {
      const data = res.data;

      const loaded = {
        title: data.title || "",
        employer: data.employer?.id || employer?.id || "",
        job_type: data.job_type || "",
        location: data.location || "",
        salary: data.salary || "",
        deadline: data.deadline || "",
        description: data.description || "",
        category: data.category || "",
        is_active: data.is_active ?? true,
        max_applicants: data.max_applicants || "",
        priority: data.priority || "NORMAL",
      };

      setFormData(loaded);
      setInitialData(loaded);
    });
  }, [jobId]);

  // Load categories
  useEffect(() => {
    axios
      .get(`${API_URL}/job/job-categories/`)
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.priority) newErrors.priority = "Please select priority";
    if (!formData.job_type) newErrors.job_type = "Please select job type";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.location) newErrors.location = "Please select location";
    if (!formData.deadline) newErrors.deadline = "Please choose a deadline";
    if (!formData.salary) newErrors.salary = "Salary is required";
    if (!formData.max_applicants) newErrors.max_applicants = "Max Applicants is required";
    if (!formData.description.trim())
      newErrors.description = "Please add a job description";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit job
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (jobId) {
        if (JSON.stringify(formData) === JSON.stringify(initialData)) {
          toast("No changes to update.", { icon: "⚠️" });
          setLoading(false);
          return;
        }

        await updateJob(jobId, formData);
        toast.success("Job updated successfully!");
      } else {
        await createJob(formData);
        toast.success("Job created successfully!");
      }

      navigate("/employer/dashboard/my-jobs");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving.", { icon: "❌" });
    } finally {
      setLoading(false);
    }
  };

  // Quill Editor settings
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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold text-gray-700">
          {jobId ? "Edit Job Post" : "Create Job Post"}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Saving..." : jobId ? "Update Job" : "Add Job Post"}
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-lg space-y-6"
      >
        {/* Title */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Job Title</label>
            <input
              type="text"
              name="title"
              className="w-full border p-3 rounded-md"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Priority</label>
            <select
              name="priority"
              className="w-full border p-3 rounded-md"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="">-- Select Priority --</option>
              {PRIORITY_CHOICES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-red-600 text-sm mt-1">{errors.priority}</p>
            )}
          </div>
        </div>

        {/* Job Type + Category */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Job Type</label>
            <select
              name="job_type"
              className="w-full border p-3 rounded-md"
              value={formData.job_type}
              onChange={handleChange}
            >
              <option value="">-- Select Job Type --</option>
              {JOB_TYPE_CHOICES.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
            {errors.job_type && (
              <p className="text-red-600 text-sm mt-1">{errors.job_type}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Category</label>
            <select
              name="category"
              className="w-full border p-3 rounded-md"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Location + Salary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Location</label>
            <select
              name="location"
              className="w-full border p-3 rounded-md"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="">-- Select Location --</option>
              {LOCATION_CHOICES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Salary</label>
            <input
              type="number"
              name="salary"
              className="w-full border p-3 rounded-md"
              value={formData.salary}
              onChange={handleChange}
            />
            {errors.salary && (
              <p className="text-red-600 text-sm mt-1">{errors.salary}</p>
            )}
          </div>
        </div>

        {/* Max applicants + Deadline */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Maximum Applicants</label>
            <input
              type="number"
              name="max_applicants"
              className="w-full border p-3 rounded-md"
              value={formData.max_applicants}
              onChange={handleChange}
            />
            {errors.max_applicants && (
              <p className="text-red-600 text-sm mt-1">{errors.max_applicants}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Deadline</label>
            <input
              type="date"
              name="deadline"
              className="w-full border p-3 rounded-md"
              value={formData.deadline}
              onChange={handleChange}
            />
            {errors.deadline && (
              <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Job Description</label>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            modules={quillModules}
            formats={quillFormats}
            className="bg-white rounded-md border min-h-[200px]"
          />
          {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md"
          >
            {loading ? "Saving..." : jobId ? "Update Job" : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
