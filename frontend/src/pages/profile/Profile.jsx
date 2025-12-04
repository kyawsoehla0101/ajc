import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import usePageTitle from "../../hooks/usePageTitle";

export default function Profile() {
  usePageTitle("Profile");

  const navigate = useNavigate();
  const { user } = useAuth();

  // If the user exists, redirect.
  useEffect(() => {
    if (user) {
      navigate("/profile/me");
    }
  }, [user, navigate]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#002366] to-[#003AB3] text-white py-8">
        <div className="container mx-auto px-4 h-[300px]">
          <div className="flex flex-col w-full h-full justify-center items-start">
            <h1 className="text-3xl font-bold mb-2 text-[#ffffffcf]">
              Create Your Profile
            </h1>
            <p className="mb-6 text-[#ffffffcf]">
              You can create for jobs from any company you like.
            </p>
            <button
              onClick={() => navigate("/sign-in")}
              className="bg-[#C46210] hover:bg-[#AB4812] text-[#ffffffcf] font-semibold px-6 py-3 rounded inline-block"
            >
              Create Profile
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-10">
          Posting a profile to get good jobs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div className="py-6 px-4">
            <img
              src="/path-to-your-target-icon.png"
              alt="Career opportunities"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">
              Access to career opportunities
            </h3>
            <p className="text-gray-600">
              By posting your profile on career-related platforms, employers can
              see your skills and experience and provide you with job
              opportunities.
            </p>
          </div>

          <div className="py-6 px-4">
            <img
              src="/path-to-your-info-icon.png"
              alt="Information quickly"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">
              Finding information quickly and easily
            </h3>
            <p className="text-gray-600">
              Personal information is organized so that you and those who want
              to contact you can find information easily and quickly.
            </p>
          </div>
        </div>
      </section>

      {/* Employer Site Callout */}
      <section className="container mx-auto my-8 bg-blue-50 py-6 px-4 border-none rounded-xl">
        <div className="flex flex-row items-center justify-center text-center gap-4">
          <p className="text-lg">
            Are you an employer? If you are an employer, you can create jobs.
          </p>
          <Link
            to="/employer"
            className="custom-blue-text custom-blue-border inline-block px-6 py-3 font-semibold border-2 rounded blue-bg-hover hover:text-gray-200 transition duration-500 ease-in-out"
          >
            Employer Site
          </Link>
        </div>
      </section>
    </div>
  );
}
