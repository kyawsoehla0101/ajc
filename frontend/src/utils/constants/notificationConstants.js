
export const NOTIFICATION_ENDPOINTS = {
  LIST: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_NOTIFICATIONS_BASE_URL}`,
  MARK_READ: (id) =>
    `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_NOTIFICATIONS_BASE_URL}${id}/mark-read/`,
  MARK_UNREAD: (id) =>
    `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_NOTIFICATIONS_BASE_URL}${id}/mark-unread/`,
  DELETE_ONE: (id) =>
    `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_NOTIFICATIONS_BASE_URL}delete/${id}/`,
  DELETE_ALL: `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_NOTIFICATIONS_BASE_URL}all-delete/`,
};