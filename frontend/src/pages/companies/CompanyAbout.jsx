import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getLocationLabel } from "../../utils/locationHelpers";
import usePageTitle from "../../hooks/usePageTitle";

export default function CompanyAbout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  usePageTitle(company?.business_name || "Company Name");

  // Company About (API) id
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/accounts-employer/job/company/${id}/`
        );
        const companyData = res.data.company_s[0];
        const jobsData = res.data.jobs_in_com_s;
        setCompany(companyData);
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-lg">
        Loading company details...
      </div>
    );

  if (!company)
    return <div className="text-center py-20 text-lg">Company not found</div>;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Banner */}
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-r from-blue-700 to-indigo-600 flex flex-col justify-center items-center text-white">
        <img
          src={company.logo ? `${API_URL}${company.logo}` : "/logo.png"}
          alt="Company Logo"
          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mb-3"
        />
        <h1 className="text-3xl md:text-4xl font-bold">
          {company.business_name}
        </h1>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-200 hover:text-white mt-1"
        >
          {company.website || "—"}
        </a>
      </div>

      {/* About Section */}
      <section className="container mx-auto px-4 md:px-0 py-10">
        <h2 className="text-2xl font-bold mb-5">About Company</h2>

        <div className="relative">
          {/* Right Info Card */}
          <aside className="float-right w-full md:w-1/3 bg-gray-50 rounded-xl shadow-sm p-6 space-y-4 border border-gray-200 ml-6 mb-4">
            {[
              {
                label: "Full Name",
                value: `${company.first_name} ${company.last_name}`,
              },
              { label: "Email", value: company.contact_email || "N/A" },
              { label: "Address", value: company.city || "N/A" },
              { label: "Phone", value: company.phone || "N/A" },
              { label: "Industry", value: company.industry || "N/A" },
              { label: "Founded Year", value: company.founded_year || "N/A" },
              { label: "Company Size", value: company.size || "N/A" },
            ].map((item, index) => (
              <div key={index}>
                <span className="font-semibold block">{item.label}</span>
                <p>{item.value}</p>
              </div>
            ))}
          </aside>

          {/* Left Description with HTML support */}
          <div className="text-gray-700 leading-relaxed prose max-w-none">
            {company.description ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: company.description,
                }}
              />
            ) : (
              <p className="text-gray-500 italic">No description provided.</p>
            )}
          </div>

          {/* Clear float */}
          <div className="clear-both"></div>
        </div>
      </section>

      {/* Available Jobs */}
      <section className="container mx-auto px-4 md:px-0 mb-20">
        <h2 className="text-2xl font-semibold mb-6">Available Jobs</h2>
        {jobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/job-search/${job.id}`)}
                className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  {job.title?.length > 15
                    ? job.title.substring(0, 15) + "..."
                    : job.title || "No Title"}
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  {getLocationLabel(job.location)}
                </p>
                <p className="text-gray-600 text-sm">
                  $<strong>{job.salary || "Negotiable"}</strong>
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Deadline: {job.deadline || "N/A"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No available jobs at the moment.</p>
        )}
      </section>
    </div>
  );
}
