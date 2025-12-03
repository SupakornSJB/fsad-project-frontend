import apiClient from './client.ts';

export async function login(email: string, password: string) {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await apiClient.post('/api/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data;
}

export async function register(payload) {
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data;
}
