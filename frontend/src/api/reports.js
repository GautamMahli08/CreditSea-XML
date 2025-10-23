import { api } from "./client";

export function uploadReport(file) {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/api/reports/upload", fd).then(r => r.data);
}

export function listReports(params) {
  return api.get("/api/reports", { params }).then(r => r.data);
}

export function getReport(id) {
  return api.get(`/api/reports/${id}`).then(r => r.data);
}
