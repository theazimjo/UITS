import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const getStudents = () => api.get('/students');
export const createStudent = (student) => api.post('/students', student);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

export default api;
