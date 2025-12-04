import React from "react";
import { useParams } from "react-router-dom";
import JobCategoryForm from "../../../components/employer/job-category/JobCategoryForm";

export default function JobCategoryEditPage() {
  const { id } = useParams();
  return (
    <div className="p-6">
      <JobCategoryForm categoryId={id} />
    </div>
  );
}
