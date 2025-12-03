export function getBackendUrl() {
  return import.meta.env["VITE_BACKEND_URL"] || "http://localhost:5001";
}

export function getIdentityServerUrl(): string {
  return import.meta.env["VITE_IDENTITY_SERVER_URL"] || "https://localhost:5000";
}

export function getFrontendUrl(): string {
  return import.meta.env["VITE_FRONTEND_URL"] || "http://localhost:5173";
}
