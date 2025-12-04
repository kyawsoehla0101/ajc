import axios from "axios";
import { NOTIFICATION_ENDPOINTS } from "../constants/notificationConstants";

// CSRF token function
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrfToken = () => getCookie("csrftoken");

// Notifications List
export const fetchNotifications = async () => {
  const res = await axios.get(NOTIFICATION_ENDPOINTS.LIST, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": csrfToken(),
    },
  });
  return res.data;
};

// Mark as Read
export const markAsRead = async (id) => {
  const res = await axios.post(
    NOTIFICATION_ENDPOINTS.MARK_READ(id),
    {},
    {
      withCredentials: true,
      headers: {
        "X-CSRFToken": csrfToken(),
      },
    }
  );
  return res.data;
};

// Mark as Unread
export const markAsUnread = async (id) => {
  const res = await axios.post(
    NOTIFICATION_ENDPOINTS.MARK_UNREAD(id),
    {},
    {
      withCredentials: true,
      headers: {
        "X-CSRFToken": csrfToken(),
      },
    }
  );
  return res.data;
};

// Delete One
export const deleteNotification = async (id) => {
  const res = await axios.delete(NOTIFICATION_ENDPOINTS.DELETE_ONE(id), {
    withCredentials: true,
    headers: {
      "X-CSRFToken": csrfToken(),
    },
  });
  return res.data;
};

// Delete All
export const deleteAllNotifications = async () => {
  const res = await axios.delete(NOTIFICATION_ENDPOINTS.DELETE_ALL, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": csrfToken(),
    },
  });
  return res.data;
};
