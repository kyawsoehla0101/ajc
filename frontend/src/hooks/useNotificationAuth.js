import { useNotificationContext } from "../context/NotificationContext";

export const useNotificationAuth = () => {
  const {
    notifications,
    counts,
    loading,
    handleMarkRead,
    handleMarkUnread,
    handleDelete,
    handleDeleteAll,
  } = useNotificationContext();

  return {
    notifications,
    counts,
    loading,
    markRead: handleMarkRead,
    markUnread: handleMarkUnread,
    deleteOne: handleDelete,
    deleteAll: handleDeleteAll,
  };
};
