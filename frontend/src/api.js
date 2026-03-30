import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Request interceptor to add bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const getStudents = () => api.get('/students');
export const syncStudents = () => api.post('/students/sync');
export const createStudent = (student) => api.post('/students', student);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

export default api;
