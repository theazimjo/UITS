import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/auth/login', credentials);

export const getStudents = () => api.get('/students');
export const getStudentById = (id) => api.get(`/students/${id}`);
export const getStudentAttendance = (id, date) => api.get(`/students/${id}/attendance`, { params: { date } });
export const syncStudents = () => api.post('/students/sync');
export const createStudent = (student) => api.post('/students', student);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getDashboardAttendanceStats = () => api.get('/dashboard/attendance-stats');
export const deleteAllStudents = () => api.delete('/students/all/clear');

export const getStaff = () => api.get('/staff');
export const getStaffById = (id) => api.get(`/staff/${id}`);
export const getStaffSalary = (id, month) => api.get(`/staff/${id}/salary/${month}`);
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.patch(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

export const getRoles = () => api.get('/roles');
export const createRole = (role) => api.post('/roles', role);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

// Groups, Fields, Courses, Rooms
export const getGroups = () => api.get('/groups');
export const getGroupById = (id) => api.get(`/groups/${id}`);
export const createGroup = (group) => api.post('/groups', group);
export const updateGroup = (id, group) => api.patch(`/groups/${id}`, group);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
export const enrollStudent = (groupId, studentId, data) => api.post(`/groups/${groupId}/enroll/${studentId}`, data);
export const enrollMultipleStudents = (groupId, data) => api.post(`/groups/${groupId}/enroll-multiple`, data);
export const unenrollStudent = (groupId, studentId) => api.delete(`/groups/${groupId}/unenroll/${studentId}`);
export const updateEnrollmentStatus = (groupId, studentId, status) => api.patch(`/groups/${groupId}/enrollment/${studentId}/status`, { status });
export const completeGroup = (id, data) => api.post(`/groups/${id}/complete`, data);
export const transferGroup = (id, data) => api.post(`/groups/${id}/action/transfer`, data);
export const clearAllData = () => api.post('/groups/action/clear-all-data');

// Payments
export const getPayments = () => api.get('/payments');
export const getPaymentsByGroup = (groupId) => api.get(`/payments/group/${groupId}`);
export const getPaymentsByStudentAndGroup = (studentId, groupId) => api.get(`/payments/student/${studentId}/group/${groupId}`);
export const getPaymentsByStudent = (studentId) => api.get(`/payments/student/${studentId}`);
export const createPayment = (data) => api.post('/payments', data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);

export const getFields = () => api.get('/groups/fields');
export const createField = (field) => api.post('/groups/fields', field);
export const updateField = (id, field) => api.patch(`/groups/fields/${id}`, field);
export const deleteField = (id) => api.delete(`/groups/fields/${id}`);

export const getCourses = () => api.get('/groups/courses');
export const createCourse = (course) => api.post('/groups/courses', course);
export const updateCourse = (id, course) => api.patch(`/groups/courses/${id}`, course);
export const deleteCourse = (id) => api.delete(`/groups/courses/${id}`);

export const getRooms = () => api.get('/groups/rooms');
export const createRoom = (room) => api.post('/groups/rooms', room);
export const updateRoom = (id, room) => api.patch(`/groups/rooms/${id}`, room);
export const deleteRoom = (id) => api.delete(`/groups/rooms/${id}`);
export const getGroupActivities = (id) => api.get(`/groups/${id}/activities`);

export default api;
