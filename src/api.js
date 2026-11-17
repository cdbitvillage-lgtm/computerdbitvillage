import { getUser } from "@netlify/identity";
export async function api(path, options = {}) {
  await getUser();
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...options.headers,
  };
  const response = await fetch(`/api${path}`, { ...options, headers });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The service is temporarily unavailable. Please try again later.",
    );
  }
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
export function normalize(rows) {
  return rows.map((r) => ({ ...r.data, ...r, id: r.id }));
}
