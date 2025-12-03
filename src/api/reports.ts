import apiClient from './client.ts';

export async function fetchReports({ skip = 0, limit = 50, status } = {}) {
  const params = { skip, limit };
  if (status) params.status_filter = status;
  const response = await apiClient.get('/api/reports', { params });
  return response.data;
}

export async function fetchReportById(reportId: string) {
  const response = await apiClient.get(`/api/reports/${reportId}`);
  return response.data;
}

export async function fetchMyReports() {
  const response = await apiClient.get('/api/reports/user/me');
  return response.data;
}

export async function createReport(payload) {
  const response = await apiClient.post('/api/reports', payload);
  return response.data;
}

export async function updateReport(reportId, payload) {
  const response = await apiClient.put(`/api/reports/${reportId}`, payload);
  return response.data;
}

export async function deleteReport(reportId) {
  await apiClient.delete(`/api/reports/${reportId}`);
}
