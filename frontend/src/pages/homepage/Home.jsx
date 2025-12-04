import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import EnterSearch from "../EnterSearch";
import FeaturedCompanies from "./FeatureCompanies";
import JobCard from "./JobCard";
import QuickSearchSection from "./QuickSearchSection";
import usePageTitle from "../../hooks/usePageTitle";

export default function Home() {
  usePageTitle("Home");
  const navigateCompany = useNavigate();
  const navigateJobs = useNavigate();
  const [jobs, setJobs] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/job/jobs/`)
      .then((res) => {
        const data = res.data.jobs || [];
        setJobs(data);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
      });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Job Search Section */}
      <EnterSearch />

      {/* Featured Companies */}
      <section className="container mx-auto text-center py-8 px-4">
        <div className="py-4">
          <h2 className="text-2xl font-bold gray-text-custom">Featured Of Companies</h2>
          <p className="gray-text-custom">Work for the best companies on the website</p>
        </div>

        <FeaturedCompanies />

        <div className="py-4 max-[483px]:pt-10 text-start">
          <button
            onClick={() => navigateCompany("/companies")}
            className="px-2 py-1 border rounded-md cursor-pointer transition custom-blue-text custom-blue-border hover-blue hover:bg-gray-200"
          >
            View All 🡆
          </button>
        </div>
      </section>

      {/* Job Offers */}
      <section className="bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center gray-text-custom">Job Offers</h2>
          <p className="gray-text-custom text-center">Search your career opportunity Jobs</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 12).map((job, i) => (
              <JobCard key={i} job={job} />
            ))}
          </div>
          <div className="py-4 text-start">
            <button
              onClick={() => navigateJobs("/job-search/all")}
              className="px-2 py-1 border rounded-md cursor-pointer transition custom-blue-text custom-blue-border hover-blue hover:bg-gray-200"
            >
              View All 🡆
            </button>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <QuickSearchSection />
    </div>
  );
}
