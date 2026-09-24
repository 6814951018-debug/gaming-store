const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_URL = import.meta.env.DEV
  ? "http://localhost:4000/api"
  : configuredApiUrl || "/api";
