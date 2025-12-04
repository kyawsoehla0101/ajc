import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  fetchNotifications,
  markAsRead,
  markAsUnread,
  deleteNotification,
  deleteAllNotifications,
} from "../utils/api/notificationAPI";
import { toast } from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({ total: 0, read: 0, unread: 0 });
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.all_list);
      setCounts(data.counts);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (err) {
      toast.error("Failed to mark notification as read.");
    }
  };

  const handleMarkUnread = async (id) => {
    try {
      await markAsUnread(id);
      loadNotifications();
    } catch (err) {
      toast.error("Failed to mark notification as unread.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const notif = notifications.find((n) => n.id === id);
      const notifName = notif?.message || "Notification";

      await deleteNotification(id);

      toast.success(`"${notifName}" deleted.`);
      loadNotifications();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete notification.");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await deleteAllNotifications();
      const deletedCount = res?.deleted_count || 0;
      const deletedItems = res?.deleted_items || [];

      if (deletedCount > 0) {
        const names = deletedItems
          .map((item) => `• ${item.message}`)
          .join("\n");
        toast.success(`Deleted ${deletedCount} notifications:\n${names}`);
      } else {
        toast.info("ℹ️ No read notifications to clear.");
      }

      loadNotifications();
    } catch (err) {
      if (err.response) {
        const errorMsg =
          err.response.data?.error ||
          err.response.data?.message ||
          err.response.data?.detail ||
          "You must read all notifications before clearing.";
        toast.error(errorMsg);
      } else {
        console.error("Delete All failed:", err);
        toast.error("Failed to clear notification.");
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        counts,
        loading,
        loadNotifications,
        handleMarkRead,
        handleMarkUnread,
        handleDelete,
        handleDeleteAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
