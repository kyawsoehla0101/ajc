import React, { useEffect, useState } from "react";
import axios from "axios";
import { CiMail, CiPhone, CiGlobe } from "react-icons/ci";
import { FaLocationDot, FaLinkedin, FaGithub } from "react-icons/fa6";
import { Menu } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EditSummaryModal from "./editprofile/EditSummaryModal";
import EducationModal from "./editprofile/EducationModal";
import ExperienceModal from "./editprofile/ExperienceModal";
import SkillModal from "./editprofile/SkillModal";
import LanguageModal from "./editprofile/LanguageModal";
import ResumeModal from "./editprofile/ResumeModal";
import EducationList from "./editprofile/ProfileListDetail/EducationList";
import ExperienceList from "./editprofile/ProfileListDetail/ExperienceList";
import LanguageList from "./editprofile/ProfileListDetail/LanguageList";
import SkillList from "./editprofile/ProfileListDetail/SkillList";
import ResumeList from "./editprofile/ProfileListDetail/ResumeList";
import usePageTitle from "../../hooks/usePageTitle";

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

export default function ProfileMe() {
  // Page Title
  usePageTitle("Profile");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: "",
    address: "",
    phone: "",
    bio: "",
    profile_picture: "",
    website: "",
    linkedin: "",
    github: "",
    email: "",
  });

  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [resumeList, setResumeList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Vite API_URL
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch education list
  const fetchEducations = async () => {
    if (!profile.id) return;
    try {
      const res = await axios.get(
        `${API_URL}/accounts-jobseeker/education/?profile=${profile.id}`,
        { withCredentials: true }
      );
      setEducationList(res.data);
    } catch (err) {
      console.error("Error fetching education:", err);
    }
  };

  // Fetch experience list
  const fetchExperiences = async () => {
    if (!profile.id) return;
    try {
      const res = await axios.get(
        `${API_URL}/accounts-jobseeker/experience/?profile=${profile.id}`,
        { withCredentials: true }
      );
      setExperienceList(res.data);
    } catch (err) {
      console.error("Error fetching experience:", err);
    }
  };

  // Fetch language list
  const fetchLanguages = async () => {
    if (!profile.id) return;
    try {
      const res = await axios.get(
        `${API_URL}/accounts-jobseeker/language/?profile=${profile.id}`,
        { withCredentials: true }
      );
      setLanguageList(res.data);
    } catch (err) {
      console.error("Error fetching languages:", err);
    }
  };

  // Fetch skill list
  const fetchSkills = async () => {
    if (!profile.id) return;
    try {
      const res = await axios.get(
        `${API_URL}/accounts-jobseeker/skill/?profile=${profile.id}`,
        { withCredentials: true }
      );
      setSkillList(res.data);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  // Edit handlers
  const handleEditEducation = (edu) => {
    setEditData(edu);
    setIsEducationOpen(true);
  };
  const handleEditExperience = (exp) => {
    setEditData(exp);
    setIsExperienceModalOpen(true);
  };
  const handleEditLanguage = (lang) => {
    setEditData(lang);
    setIsLanguageModalOpen(true);
  };
  const handleEditSkill = (skill) => {
    setEditData(skill);
    setIsSkillModalOpen(true);
  };

  // Load profile on mount
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/sign-in", { replace: true });
    } else {
      axios
        .get(`${API_URL}/accounts-jobseeker/jobseekerprofile/`, {
          withCredentials: true,
        })
        .then((res) => {
          const profileData =
            Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : {};
          setProfile({
            ...profileData,
            email: user.email || "",
          });
        })
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [user, loading, navigate]);

  // Load all info when profile is ready
  useEffect(() => {
    if (profile.id) {
      fetchEducations();
      fetchExperiences();
      fetchLanguages();
      fetchSkills();
    }
  }, [profile]);

  // Upload profile picture
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const csrfToken = getCookie("csrftoken");
      const res = await axios.put(
        `${API_URL}/accounts-jobseeker/jobseekerprofile/${
          profile.id
        }/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      setProfile((prev) => ({
        ...prev,
        profile_picture: res.data.profile_picture,
      }));
    } catch (err) {
      console.error("Error uploading picture:", err);
    }
  };

  // Check profile completeness
  const checkProfileCompleteness = () => {
    const missingFields = [];

    if (!profile.full_name) missingFields.push("Full Name");
    if (!profile.address) missingFields.push("Address");
    if (!profile.phone) missingFields.push("Phone");
    if (!profile.bio) missingFields.push("Bio");
    if (!profile.profile_picture) missingFields.push("Profile Picture");

    if (educationList.length === 0) missingFields.push("Education");
    if (experienceList.length === 0) missingFields.push("Experience");
    if (languageList.length === 0) missingFields.push("Language");
    if (skillList.length === 0) missingFields.push("Skill");
    if (resumeList.length === 0) missingFields.push("Resume");

    return missingFields;
  };

  // Update profile status message
  const handleProfileUpdateMessage = () => {
    const missing = checkProfileCompleteness();

    if (missing.length === 0) {
      setProfileMessage({
        type: "success",
        text: "🎉 Your profile is complete!",
      });
    } else {
      setProfileMessage({
        type: "error",
        text: `⚠️ Please fill the following: ${missing.join(", ")}`,
      });
    }
  };

  // Auto-check when data changes
  useEffect(() => {
    if (profile.id) handleProfileUpdateMessage();
  }, [
    profile,
    educationList,
    experienceList,
    languageList,
    skillList,
    resumeList,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#002366] to-[#003AB3] text-white py-10 rounded-b-2xl shadow-lg overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-center md:h-[300px]">
          {/* Social Links (Left Side) */}
          <div className="space-y-3 items-start order-1 md:order-1">
            <h1 className="text-3xl md:text-4xl font-bold">
              {profile.full_name || "Full Name"}
            </h1>
            <p className="text-[#ffffffcc]">
              {profile.bio || "Write something about yourself..."}
            </p>

            <div className="flex flex-col gap-1 text-[#ffffffb0]">
              <div className="flex items-center gap-2">
                <FaLocationDot />
                <span>{profile.address || "Your Address"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CiPhone />
                <span>{profile.phone || "Your Phone"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CiMail />
                <span>{profile.email || "Your Email"}</span>
              </div>
            </div>
          </div>

          {/* Profile Info (Now Left-Aligned / Normal) */}
          <div className="flex flex-col text-[#ffffffb0] order-2 md:order-2">
            <div className="flex items-start gap-2 w-full">
              <CiGlobe />
              <a
                href={profile.website || "#"}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {profile.website || "Website"}
              </a>
            </div>
            <div className="flex items-start gap-2 w-full">
              <FaLinkedin />
              <a
                href={profile.linkedin || "#"}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {profile.linkedin || "LinkedIn"}
              </a>
            </div>
            <div className="flex items-start gap-2 w-full">
              <FaGithub />
              <a
                href={profile.github || "#"}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {profile.github || "GitHub"}
              </a>
            </div>
          </div>

          {/* Profile Picture (Right Side) */}
          <div className="flex justify-center md:justify-end relative group order-3 md:order-3">
            <Menu as="div" className="relative inline-block">
              {({ open }) => (
                <>
                  <Menu.Button className="focus:outline-none">
                    <img
                      src={
                        profile.profile_picture
                          ? `${import.meta.env.VITE_API_URL}${
                              profile.profile_picture
                            }`
                          : "/default-avatar.png"
                      }
                      alt={profile.full_name || "Profile Picture"}
                      className={`w-36 h-36 rounded-full object-cover border-4 border-white shadow-md cursor-pointer transition ${
                        open ? "ring-4 ring-blue-400" : ""
                      }`}
                    />
                  </Menu.Button>

                  <Menu.Items className="md:absolute z-10 md:mt-2 w-32 right-0 bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              document.getElementById("uploadInput").click()
                            }
                            className={`${
                              active ? "bg-blue-50" : ""
                            } w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            Upload
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              window.open(
                                profile.profile_picture
                                  ? `${import.meta.env.VITE_API_URL}${
                                      profile.profile_picture
                                    }`
                                  : "/default-avatar.png",
                                "_blank"
                              )
                            }
                            className={`${
                              active ? "bg-blue-50" : ""
                            } w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            View
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </>
              )}
            </Menu>

            {/* Hidden File Input */}
            <input
              type="file"
              id="uploadInput"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e)}
            />
          </div>
        </div>

        <button
          onClick={() => navigate("/profile/me/edit")}
          className="absolute top-8 right-8 bg-white text-blue-700 font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-200 transition"
        >
          ✎
        </button>
      </section>

      {profileMessage.text && (
        <div
          className={`container mx-auto px-4 py-3 mt-4 rounded ${
            profileMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {profileMessage.text}
        </div>
      )}

      {/* Main Section */}
      <section className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-8">
          {/* Summary */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              Summary (Job Purpose)
            </label>
            <div className="relative" onClick={() => setIsModalOpen(true)}>
              <input
                type="text"
                value={profile.bio || ""}
                readOnly
                placeholder="Write your job purpose..."
                className="w-full border border-[#0D74CE] rounded-lg px-4 py-2 bg-white cursor-pointer"
              />
              <span className="absolute right-3 top-2 text-gray-500">✎</span>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Education</h2>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => {
                  setEditData(null);
                  setIsEducationOpen(true);
                }}
              >
                + Add
              </button>
            </div>
            <EducationList
              profileId={profile.id}
              educationList={educationList}
              setEducationList={setEducationList}
              onEdit={handleEditEducation}
            />
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Experience</h2>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => {
                  setEditData(null);
                  setIsExperienceModalOpen(true);
                }}
              >
                + Add
              </button>
            </div>
            <ExperienceList
              profileId={profile.id}
              experienceList={experienceList}
              setExperienceList={setExperienceList}
              onEdit={handleEditExperience}
            />
          </div>

          {/* Language */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Languages</h2>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => {
                  setEditData(null);
                  setIsLanguageModalOpen(true);
                }}
              >
                + Add
              </button>
            </div>
            <LanguageList
              profileId={profile.id}
              languageList={languageList}
              setLanguageList={setLanguageList}
              onEdit={handleEditLanguage}
            />
          </div>

          {/* Skill Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Skills</h2>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => {
                  setEditData(null);
                  setIsSkillModalOpen(true);
                }}
              >
                + Add
              </button>
            </div>
            <SkillList
              profileId={profile.id}
              skillList={skillList}
              setSkillList={setSkillList}
              onEdit={handleEditSkill}
            />
          </div>
        </div>

        {/* Resume Panel */}
        <div className="w-full lg:w-2/5 bg-blue-50 rounded-lg p-6 shadow-inner">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-blue-900">Resume</h2>
            <button
              className="border border-blue-400 text-blue-600 px-4 py-1 rounded-lg hover:bg-blue-100 transition"
              onClick={() => {
                setEditData(null);
                setIsResumeModalOpen(true);
              }}
            >
              + Add
            </button>
          </div>

          <ResumeList
            profileId={profile.id}
            resumeList={resumeList}
            setResumeList={setResumeList}
            onEdit={(resume) => {
              setEditData(resume);
              setIsResumeModalOpen(true);
            }}
          />
        </div>
      </section>

      {/* Modals */}
      <EditSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EducationModal
        isOpen={isEducationOpen}
        onClose={() => setIsEducationOpen(false)}
        profileId={profile.id}
        profileName={profile.full_name}
        editData={editData}
        onSuccess={(edu) => {
          if (editData) {
            setEducationList((prev) =>
              prev.map((e) => (e.id === edu.id ? edu : e))
            );
          } else {
            setEducationList((prev) => [...prev, edu]);
          }
          handleProfileUpdateMessage();
        }}
      />

      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        profileId={profile.id}
        profileName={profile.full_name}
        editData={editData}
        onSuccess={(exp) => {
          if (editData) {
            setExperienceList((prev) =>
              prev.map((e) => (e.id === exp.id ? exp : e))
            );
          } else {
            setExperienceList((prev) => [...prev, exp]);
          }
          handleProfileUpdateMessage();
        }}
      />

      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        profileId={profile.id}
        profileName={profile.full_name}
        editData={editData}
        onSuccess={(lang) => {
          if (editData) {
            setLanguageList((prev) =>
              prev.map((l) => (l.id === lang.id ? lang : l))
            );
          } else {
            setLanguageList((prev) => [...prev, lang]);
          }
          handleProfileUpdateMessage();
        }}
      />

      <SkillModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        profileId={profile.id}
        profileName={profile.full_name}
        editData={editData}
        onSuccess={(skill) => {
          if (editData) {
            setSkillList((prev) =>
              prev.map((s) => (s.id === skill.id ? skill : s))
            );
          } else {
            setSkillList((prev) => [...prev, skill]);
          }
          handleProfileUpdateMessage();
        }}
      />

      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profileId={profile.id}
        profileName={profile.full_name}
        editData={editData}
        onSuccess={(newResume) => {
          if (editData) {
            setResumeList((prev) =>
              prev.map((r) => (r.id === newResume.id ? newResume : r))
            );
          } else {
            setResumeList((prev) => [...prev, newResume]);
          }
          handleProfileUpdateMessage();
        }}
      />
    </div>
  );
}
