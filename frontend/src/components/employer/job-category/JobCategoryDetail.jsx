import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";

export default function JobCategoryDetail() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);

  // API base URL
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch category detail when ID changes
  useEffect(() => {
    axios
      .get(`${API_URL}/job/job-categories/detail/${id}/`)
      .then((res) => setCategory(res.data))
      .catch((err) => console.error("Error fetching detail:", err));
  }, [id]);

  // Page title
  usePageTitle(category?.name || "Category Detail");

  if (!category) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Category Detail</h2>
      <p>
        <strong>Name:</strong> {category.name}
      </p>
    </div>
  );
}
