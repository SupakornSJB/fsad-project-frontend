import apiClient from './client.ts';

export async function voteForReport(payload) {
  const response = await apiClient.post('/api/votes', payload);
  return response.data;
}

export async function removeVote(reportId) {
  await apiClient.delete(`/api/votes/report/${reportId}`);
}

export async function fetchVotesByReport(reportId) {
  const response = await apiClient.get(`/api/votes/report/${reportId}`);
  return response.data;
}

export async function fetchVoteCount(reportId) {
  const response = await apiClient.get(`/api/votes/report/${reportId}/count`);
  return response.data;
}

export async function fetchMyVotes() {
  const response = await apiClient.get('/api/votes/user/me');
  return response.data;
}
