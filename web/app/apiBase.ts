export function apiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window === "undefined") return "http://localhost:3001";
  const url = new URL(window.location.origin);
  url.port = "3001";
  return url.origin;
}
