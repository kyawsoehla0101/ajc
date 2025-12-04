import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Mail, Phone, Clock, MapPin } from "lucide-react";
import usePageTitle from "../../../hooks/usePageTitle";

export default function JobApplicationProfileDetail() {
  const { id } = useParams(); // app_id
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [jobseeker, setJobseeker] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vite API_URL
  const API_URL = import.meta.env.VITE_API_URL;

  const seekerName = jobseeker?.full_name || "Job Application Profile";
  usePageTitle(`${seekerName} | JobSeeker`);

  // Fetch All Data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Application detail
        const appRes = await axios.get(
          `${API_URL}/application/employer/application/detail/${id}/`
        );
        const appData = appRes.data.s_app;
        setApplication(appData);

        // Jobseeker profile
        if (appData.job_seeker_profile) {
          const seekerId = appData.job_seeker_profile;

          const [profileRes, eduRes, expRes, skillRes, langRes] =
            await Promise.all([
              // profile API
              axios.get(
                `${API_URL}/accounts-jobseeker/jobseekerprofile/${seekerId}/`
              ),
              // education API
              axios.get(
                `${API_URL}/accounts-jobseeker/education/?profile=${seekerId}`
              ),
              // experience API
              axios.get(
                `${API_URL}/accounts-jobseeker/experience/?profile=${seekerId}`
              ),
              // skill API
              axios.get(
                `${API_URL}/accounts-jobseeker/skill/?profile=${seekerId}`
              ),
              // language API
              axios.get(
                `${API_URL}/accounts-jobseeker/language/?profile=${seekerId}`
              ),
            ]);

          setJobseeker(profileRes.data);
          setEducation(eduRes.data);
          setExperience(expRes.data);
          setSkills(skillRes.data);
          setLanguages(langRes.data);
        }
      } catch (error) {
        console.error("❌ Error fetching job application detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;

  if (!application || !jobseeker)
    return <p className="text-center py-10 text-gray-500">No data found.</p>;

  const job = application.job || {};
  const seeker = jobseeker || {};

  return (
    <div className="bg-[#e9f3fb] min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={20} className="mr-2" />
          Job Application Profile
        </button>
        <div className="space-x-2">
          <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg">
            Reject
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Accept
          </button>
        </div>
      </div>

      {/* Top Info */}
      <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 text-center">
          {/* jobseeker img */}
          <img
            src={
              seeker.profile_picture ||
              "https://via.placeholder.com/120?text=Profile"
            }
            alt="profile"
            className="w-32 h-32 rounded-full mx-auto mb-2 object-cover"
          />
          <h2 className="text-lg font-semibold">{seeker.full_name}</h2>
          <p className="text-sm text-gray-500">
            Jobseeker Id: {seeker.id?.slice(0, 6).toUpperCase() || "—"}
          </p>
        </div>

            {/* job info (title, description, salary, location) */}
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
          <ul className="list-disc ml-6 text-gray-700 text-sm mt-2">
            <li
              dangerouslySetInnerHTML={{
                __html: job.description || "<i>No description</i>",
              }}
            />
            <li>{job.salary ? `${job.salary} Ks` : "Salary not specified"}</li>
            <li>{job.location || "No location"}</li>
          </ul>

              {/* jobseeker grid (email, phone, applied_at, location) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail size={16} /> {seeker.email || "—"}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} /> {seeker.phone || "—"}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />{" "}
              {new Date(application.applied_at).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} /> {seeker.address || "No location"}
            </div>
          </div>
        </div>
      </div>

      {/* Education + Skills + Language + Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Education */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Education</h4>
          {education.length > 0 ? (
            education.map((edu) => (
              <div key={edu.id} className="mb-3 text-sm text-gray-600">
                <p>
                  🎓 <strong>{edu.degree}</strong> — {edu.school_name}
                </p>
                <p>{edu.field_of_study && `Field: ${edu.field_of_study}`}</p>
                <p>
                  Year: {edu.start_year} - {edu.end_year || "Present"}
                </p>
                <p>{edu.description}</p>
                <p className="text-xs text-gray-500">
                  Location: {edu.location || "—"} | GPA: {edu.gpa || "N/A"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No education data found</p>
          )}
        </div>

        {/* Skills */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Skills</h4>
          {skills.length > 0 ? (
            skills.map((skill) => {
              const levelMap = {
                1: "Beginner",
                2: "Intermediate",
                3: "Advanced",
                4: "Expert",
              };
              const percentMap = {
                1: "25%",
                2: "50%",
                3: "75%",
                4: "100%",
              };
              return (
                <div key={skill.id} className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    {skill.name} ({levelMap[skill.proficiency_level]})
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: percentMap[skill.proficiency_level] }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-sm">No skill data found</p>
          )}
        </div>

        {/* Experience */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Experience</h4>
          {experience.length > 0 ? (
            experience.map((exp) => (
              <div key={exp.id} className="mb-3 text-sm text-gray-600">
                <p className="font-medium text-gray-700">
                  {exp.job_title || exp.position}
                </p>
                <p>{exp.company_name}</p>
                <p className="text-xs text-gray-500">
                  {exp.start_date} - {exp.end_date || "Present"}
                </p>
                <p className="mt-1">{exp.description}</p>
                <p className="text-xs text-gray-400">
                  Location: {exp.location || "—"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No experience found</p>
          )}
        </div>

        {/* Languages */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Languages</h4>
          {languages.length > 0 ? (
            languages.map((lang) => (
              <p key={lang.id} className="text-sm text-gray-600">
                {lang.name} — {lang.proficiency}
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No languages found</p>
          )}
        </div>
      </div>
    </div>
  );
}
