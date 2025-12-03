import apiClient from './client.ts';

export async function fetchAuditLogs({ skip = 0, limit = 100, method, userEmail, statusCode } = {}) {
  const params = { skip, limit };

  if (method && method !== 'ALL') {
    params.method = method;
  }

  if (userEmail) {
    params.user_email = userEmail;
  }

  if (statusCode) {
    params.status_code = statusCode;
  }

  const response = await apiClient.get('/api/audit-logs', { params });
  return response.data;
}
