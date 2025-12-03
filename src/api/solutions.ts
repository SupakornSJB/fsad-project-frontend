import apiClient from './client.ts';

export async function fetchSolutionsByReport(reportId) {
  const response = await apiClient.get(`/api/solutions/report/${reportId}`);
  return response.data;
}

export async function createSolution(payload) {
  const response = await apiClient.post('/api/solutions', payload);
  return response.data;
}

export async function updateSolution(solutionId, payload) {
  const response = await apiClient.put(`/api/solutions/${solutionId}`, payload);
  return response.data;
}

export async function deleteSolution(solutionId) {
  await apiClient.delete(`/api/solutions/${solutionId}`);
}
