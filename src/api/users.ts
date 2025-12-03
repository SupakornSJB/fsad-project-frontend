import apiClient from './client.ts';

export async function fetchUsers({ skip = 0, limit = 100 } = {}) {
  const response = await apiClient.get('/api/users', {
    params: { skip, limit }
  });
  return response.data;
}

export async function fetchUserById(userId) {
  const response = await apiClient.get(`/api/users/${userId}`);
  return response.data;
}

export async function deleteUser(userId) {
  await apiClient.delete(`/api/users/${userId}`);
}
