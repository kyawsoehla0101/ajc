import React, { useEffect, useState } from "react";
import axios from "axios";
import JobCategoryForm from "../../../components/employer/job-category/JobCategoryForm";
import JobCategoryList from "../../../components/employer/job-category/JobCategoryList";
import JobCategoryDeleteModal from "../../../components/employer/job-category/JobCategoryDeleteModal";
import { toast } from "react-hot-toast";

export default function JobCategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  // Vite API_URL
  const API_URL = import.meta.env.VITE_API_URL;

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

  // Fetch all job categories from the API
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/job/job-categories/`);
      console.log(res.data);
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Delete a job category by ID
  const handleDelete = async (id) => {
    if (!id) return;

    // variables csrfToken
    const csrfToken = getCookie("csrftoken");

    try {
      await axios.delete(`${API_URL}/job/job-categories/delete/${id}/`, {
        headers: { "X-CSRFToken": csrfToken },
        withCredentials: true,
      });
      toast.success("✅ Category deleted!");
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("❌ Error deleting category");
    }
  };

  // Fetch categories when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      {/* JobCategoryForm */}
      <JobCategoryForm onSuccess={fetchCategories} />
      {/* JobCategoryList */}
      <JobCategoryList
        categories={categories}
        onDelete={(id) => setDeleteId(id)}
      />
      {/* JobCategoryDeleteModal */}
      <JobCategoryDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
      />
    </div>
  );
}
