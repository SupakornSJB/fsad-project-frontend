import apiClient from './client.ts';

export async function fetchCommentsByReport(reportId) {
  const response = await apiClient.get(`/api/comments/report/${reportId}`);
  return response.data;
}

export async function createComment(payload) {
  const response = await apiClient.post('/api/comments', payload);
  return response.data;
}

export async function updateComment(commentId, payload) {
  const response = await apiClient.put(`/api/comments/${commentId}`, payload);
  return response.data;
}

export async function deleteComment(commentId) {
  await apiClient.delete(`/api/comments/${commentId}`);
}
