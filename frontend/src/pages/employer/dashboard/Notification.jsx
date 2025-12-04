import { useState, useRef, useEffect } from "react";
import { Bell, Trash2 } from "lucide-react";
import { useNotificationAuth } from "../../../hooks/useNotificationAuth";
import { toast } from "react-hot-toast";

export default function Notification() {
  // Get notifications and actions from Notification context
  const { notifications, loading, markRead, markUnread, deleteOne, deleteAll } =
    useNotificationAuth();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const notifRef = useRef(null);

  // unread count
  const unreadCount = notifications?.filter((n) => !n.is_read)?.length || 0;

  // Outside click → close popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;

  // Toggle read/unread status
  const toggleReadStatus = (id, isRead) => {
    if (isRead) {
      markUnread(id);
    } else {
      markRead(id);
    }
  };

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  return (
    <div className="relative" ref={notifRef}>
      {/* Bell icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-20 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                className="text-red-600 text-sm hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b text-sm">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-2 ${
                filter === "all"
                  ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`flex-1 py-2 ${
                filter === "unread"
                  ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`flex-1 py-2 ${
                filter === "read"
                  ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Read
            </button>
          </div>

{/* Notification list */}
          {filteredNotifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No notifications
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50 ${
                  !n.is_read ? "bg-blue-50" : ""
                }`}
              >
                {/* Message + toggle read and unread */}
                <div
                  onClick={() => toggleReadStatus(n.id, n.is_read)}
                  className="flex-1 cursor-pointer"
                >
                  <p className="text-sm text-gray-700">
                    {n?.message || n?.text || "New notification"}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => {
                    if (!n.is_read) {
                      toast.error("You haven't read this yet.");
                      return;
                    }
                    deleteOne(n.id);
                  }}
                  className="ml-3 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
