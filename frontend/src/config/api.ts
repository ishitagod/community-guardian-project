// Backend API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:8000",

  // Alert endpoints
  ALERTS: {
    LIST: "/alerts",
    GET: (id: number) => `/alerts/${id}`,
    CREATE: "/alerts",
    UPDATE_CLASSIFICATION: (id: number) => `/alerts/${id}/classification`,
    DISMISS: (id: number) => `/alerts/${id}/dismiss`,
  },

  // Profile endpoints
  PROFILES: {
    LIST: "/profiles",
    GET: (id: number) => `/profiles/${id}`,
    CREATE: "/profiles",
    UPDATE: (id: number) => `/profiles/${id}`,
    DELETE: (id: number) => `/profiles/${id}`,
  },
};

// Frontend routes
export const FRONTEND_ROUTES = {
  HOME: "/",
  ALERTS: "/alerts",
  COMMUNITY: "/community",
  PROFILE: "/profile",
};
