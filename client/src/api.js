const BASE = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request gagal (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getConfig: () => request("/config"),
  listFabrikasi: () => request("/reports/fabrikasi"),
  addFabrikasi: (entry) => request("/reports/fabrikasi", { method: "POST", body: JSON.stringify(entry) }),
  deleteFabrikasi: (id) => request(`/reports/fabrikasi/${id}`, { method: "DELETE" }),
  listInstalasi: () => request("/reports/instalasi"),
  addInstalasi: (entry) => request("/reports/instalasi", { method: "POST", body: JSON.stringify(entry) }),
  deleteInstalasi: (id) => request(`/reports/instalasi/${id}`, { method: "DELETE" }),
};
