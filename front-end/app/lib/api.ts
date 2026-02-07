export function getApiBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return "";
  return base.replace(/\/$/, "");
}

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;
  return fetch(url, {
    ...init,
    credentials: "include",
  });
}
