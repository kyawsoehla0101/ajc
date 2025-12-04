import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Clock,
  Eye,
  XCircle,
  CheckCircle,
  Handshake,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Pagination from "../../../components/common/Pagination";

// ✅ Get CSRF Token Helper
export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function JobApplication() {
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({
    P: 0,
    R: 0,
    RJ: 0,
    SL: 0,
    H: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeStatus, setActiveStatus] = useState("All");
  const menuRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Detect click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch All Applications (for default view)
  const fetchApplications = async (endpoint = null) => {
    setLoading(true);
    try {
      const url = endpoint || `${API_URL}/application/employer/applications/`;
      const res = await axios.get(url, { withCredentials: true });

      // API မှာ key မတူနိုင်တာကြောင့် dynamic key handle
      const data = res.data;
      const key = Object.keys(data).find((k) => k.endsWith("_apps"));
      const apps = key ? data[key] : data.applications || [];

      setApplications(apps);

      // ✅ Count ကို API response အပေါ်မူတည်မဟုတ်ဘဲ Local မှတင်တွက်မယ်
      const newCounts = {
        P: apps.filter((a) => a.status === "P").length,
        R: apps.filter((a) => a.status === "R").length,
        RJ: apps.filter((a) => a.status === "RJ").length,
        SL: apps.filter((a) => a.status === "SL").length,
        H: apps.filter((a) => a.status === "H").length,
      };
      setCounts(newCounts);
    } catch (error) {
      console.error("❌ Error fetching applications:", error);
      toast.error("Failed to fetch applications!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ Cards config
  const cards = [
    {
      title: "Pending",
      value: counts.P,
      color: "text-blue-500",
      icon: <Clock size={22} />,
      endpoint: `${API_URL}/application/employer/application/pending/`,
    },
    {
      title: "Review",
      value: counts.R,
      color: "text-yellow-500",
      icon: <Eye size={22} />,
      endpoint: `${API_URL}/application/employer/application/reviewed/`,
    },
    {
      title: "Rejected",
      value: counts.RJ,
      color: "text-red-500",
      icon: <XCircle size={22} />,
      endpoint: `${API_URL}/application/employer/application/rejected/`,
    },
    {
      title: "Shortlist",
      value: counts.SL,
      color: "text-green-500",
      icon: <CheckCircle size={22} />,
      endpoint: `${API_URL}/application/employer/application/shortlist/`,
    },
    {
      title: "Hired",
      value: counts.H,
      color: "text-purple-500",
      icon: <Handshake size={22} />,
      endpoint: `${API_URL}/application/employer/application/hired/`,
    },
  ];

  // ✅ Card click handler (list change only)
  const handleCardClick = async (card) => {
    setActiveStatus(card.title);
    try {
      const res = await axios.get(card.endpoint, { withCredentials: true });
      const data = res.data;
      const key = Object.keys(data).find((k) => k.endsWith("_apps"));
      const apps = key ? data[key] : data.applications || [];
      setApplications(apps);
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error("Failed to load selected applications!");
    }
  };

  // 
  // ✅ Update status (with user-friendly error)
  const handleAction = async (newStatus, appId) => {
    const csrftoken = getCookie("csrftoken");
    setOpenMenuId(null);

    const statusMap = {
      Pending: "P",
      Review: "R",
      Rejected: "RJ",
      Shortlist: "SL",
      Hired: "H",
    };

    const code = statusMap[newStatus];

    try {
      await axios.post(
        `${API_URL}/application/applications/${appId}/update-status/`,
        { new_status: code },
        {
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // SUCCESS MESSAGE
      toast.success(`Status updated to ${newStatus}!`);

      // Update table UI
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: code } : a))
      );

      // Update summary cards
      setCounts((prev) => {
        const oldStatus = applications.find((a) => a.id === appId)?.status;
        if (!oldStatus) return prev;

        const updated = { ...prev };

        // decrease old status
        updated[oldStatus] = Math.max(0, updated[oldStatus] - 1);

        // increase new status
        updated[code] = (updated[code] || 0) + 1;

        return updated;
      });
    } catch (error) {
      console.error("❌ Status update failed:", error);

      //Show human-friendly Django message
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update status.";

      toast.error(msg, {
        icon: "ℹ️",
      });
    }
  };


  // ✅ Delete
  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;
    const csrftoken = getCookie("csrftoken");

    try {
      await axios.delete(
        `${API_URL}/application/employer/application/delete/${appId}/`,
        {
          headers: { "X-CSRFToken": csrftoken },
          withCredentials: true,
        }
      );
      toast.success("Application deleted!");
      setApplications((prev) => prev.filter((a) => a.id !== appId));
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error("Failed to delete application.");
    }
  };

  // ✅ Search + Filter
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.employer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && app.status === "P") ||
      (statusFilter === "Review" && app.status === "R") ||
      (statusFilter === "Rejected" && app.status === "RJ") ||
      (statusFilter === "Shortlist" && app.status === "SL") ||
      (statusFilter === "Hired" && app.status === "H");
    return matchesSearch && matchesStatus;
  });

  // ⭐ Pagination logic
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredApplications.slice(indexFirst, indexLast);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  // ✅ Render UI
  return (
    <div className="bg-[#e9f3fb] min-h-screen p-6 relative">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Job Applications{" "}
        <span className="text-sm text-gray-500">({activeStatus})</span>
      </h2>

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => handleCardClick(card)}
            className={`bg-white shadow-sm p-4 rounded-xl flex flex-col items-center justify-center text-center border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all ${activeStatus === card.title ? "ring-2 ring-blue-300" : ""
              }`}
          >
            <div className={`${card.color} mb-2`}>{card.icon}</div>
            <p className={`${card.color} text-sm font-medium`}>{card.title}</p>
            <p className="text-2xl font-bold text-gray-700">{card.value}</p>
          </button>
        ))}
      </div>

      {/* ===== Search & Filter ===== */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-5">
        <input
          type="text"
          placeholder="🔍 Search"
          className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-40 border border-gray-200 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-600"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Review">Reviewed</option>
          <option value="Rejected">Rejected</option>
          <option value="Shortlist">Shortlist</option>
          <option value="Hired">Hired</option>
        </select>
      </div>

      {/* ===== Table ===== */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 relative overflow-visible">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-gray-700 font-semibold text-base">
            Job Applications Information
          </h3>
        </div>

        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading...</p>
        ) : filteredApplications.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No applications found.
          </p>
        ) : (
          <table className="w-full text-left relative">
            <thead className="bg-[#f9fafc] text-gray-600">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold">No</th>
                <th className="py-3 px-4 text-sm font-semibold">Name</th>
                <th className="py-3 px-4 text-sm font-semibold">Email</th>
                <th className="py-3 px-4 text-sm font-semibold">Job Title</th>
                <th className="py-3 px-4 text-sm font-semibold">Status</th>
                <th className="py-3 px-4 text-sm font-semibold">Date</th>
                <th className="py-3 px-4 text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody ref={menuRef}>
              {currentItems.map((app, i) => (
                <tr
                  key={app.id}
                  className="border-t border-gray-100 text-gray-700 hover:bg-gray-50 transition relative"
                >
                  <td className="py-3 px-4 text-sm">{i + 1}</td>
                  <td className="py-3 px-4 text-sm">
                    {app.jobseeker_name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {app.jobseeker_email || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm">{app.job?.title}</td>
                  <td className="py-3 px-4 text-sm">{app.status_display}</td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-sm relative">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/employer/dashboard/applications/${app.id}`}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 hover:underline"
                      >
                        <Eye size={16} /> View
                      </Link>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 hover:underline"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => toggleMenu(app.id)}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    {/* Dropdown */}
                    {openMenuId === app.id && (
                      <div className="absolute right-10 top-8 bg-white border border-gray-200 rounded-lg shadow-lg w-32 z-50">
                        {[
                          "Pending",
                          "Review",
                          "Rejected",
                          "Shortlist",
                          "Hired",
                        ].map((option) => (
                          <button
                            key={option}
                            onClick={() => handleAction(option, app.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
