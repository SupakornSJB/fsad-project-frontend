import apiClient from './client.ts';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/api/uploads/image', formData);
  return response.data;
}
