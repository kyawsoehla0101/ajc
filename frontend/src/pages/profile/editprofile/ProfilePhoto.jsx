import React, { useState } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";

export default function ProfilePhoto({ profile, setProfile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("profile_picture", selectedFile);

    try {
      const res = await axios.put(
        `${API_URL}/accounts-jobseeker/jobseekerprofile/${profile.id}/`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setProfile(res.data);
      toast.success("Profile picture updated!");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed!");
    }
  };

  return (
    <div className="relative">
      <img
        src={
          profile.profile_picture
            ? `${API_URL}${profile.profile_picture}`
            : "/default-avatar.png"
        }
        alt="Profile"
        className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      />

      {/* Modal */}
      {isModalOpen && (
        <Dialog
          open={isModalOpen} //
          onClose={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Profile Picture</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {/* View Current Photo */}
              <img
                src={
                  profile.profile_picture
                    ? `${import.meta.env.VITE_API_URL}${
                        profile.profile_picture
                      }`
                    : "/default-avatar.png"
                }
                alt="Current"
                className="w-64 h-64 object-cover rounded-lg"
              />

              {/* File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleUpload}
                >
                  Upload
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
