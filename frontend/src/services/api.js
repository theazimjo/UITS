import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/auth/login', credentials);

// Student services
export const getStudents = () => api.get('/students');
export const getStudentById = (id) => api.get(`/students/${id}`);
export const updateStudent = (id, data) => api.post(`/students/${id}`, data);
export const getStudentAttendance = (id, date) => api.get(`/students/${id}/attendance`, { params: { date } });
export const syncStudents = () => api.post('/students/sync');
export const createStudent = (student) => api.post('/students', student);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getDashboardAttendanceStats = (date) => api.get('/dashboard/attendance-stats', { params: { date } });
export const getDashboardGeneralStats = (date) => api.get('/dashboard/general-stats', { params: { date } });
export const getActivities = () => api.get('/activity-log');
export const deleteAllStudents = () => api.delete('/students/all/clear');
export const getStudentExams = (id) => api.get(`/students/${id}/exams`);

export const getStaff = () => api.get('/staff');
export const getStaffById = (id) => api.get(`/staff/${id}`);
export const getStaffSalary = (id, month) => api.get(`/staff/${id}/salary?month=${month}`);
export const addStaffPayment = (id, data) => api.post(`/staff/${id}/payments`, data);
export const updateStaffPayment = (paymentId, data) => api.patch(`/staff/payments/${paymentId}`, data);
export const deleteStaffPayment = (paymentId) => api.delete(`/staff/payments/${paymentId}`);

// Finance
export const getFinanceStats = (month) => api.get('/finance/stats', { params: { month } });
export const getFinanceTransactions = (month) => api.get('/finance/transactions', { params: { month } });
export const getFinanceChart = () => api.get('/finance/chart');

// Expenses
export const getExpenses = () => api.get('/expenses');
export const addExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Incomes
export const getIncomes = () => api.get('/incomes');
export const addIncome = (data) => api.post('/incomes', data);
export const updateIncome = (id, data) => api.patch(`/incomes/${id}`, data);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`);

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
export const updatePayment = (id, data) => api.patch(`/payments/${id}`, data);
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

// User Profile
export const getMe = () => api.get('/users/me');
export const updateProfile = (data) => api.patch('/users/profile', data);
export const updatePassword = (data) => api.patch('/users/password', data);

// Teacher Portal
export const getTeacherDashboard = (month) => api.get('/teacher/dashboard', { params: { month } });
export const getTeacherGroups = () => api.get('/teacher/my-groups');
export const getTeacherStudents = () => api.get('/teacher/my-students');
export const getTeacherAttendance = (date, sync = false) => api.get('/teacher/my-attendance', { params: { date, sync } });
export const getTeacherFinance = (month) => api.get('/teacher/my-finance', { params: { month } });
export const getGroupPayments = (id, month) => api.get(`/teacher/group-payments/${id}`, { params: { month } });
export const saveGrade = (data) => api.post('/teacher/grade', data);

// Monthly Reports (Admin-side)
export const createMonthlyReport = (teacherId, data) => api.post(`/staff/${teacherId}/monthly-report`, data);
export const getMonthlyReports = (teacherId, month) => api.get(`/staff/${teacherId}/monthly-reports`, { params: { month } });
export const getAllMonthlyReports = (month) => api.get('/staff/reports/all', { params: { month } });

// Monthly Reports (Teacher-side)
export const sendTeacherReport = (data) => api.post('/teacher/send-report', data);
export const getMyTeacherReports = (month) => api.get('/teacher/my-reports', { params: { month } });
export const deleteTeacherReport = (id) => api.delete(`/teacher/reports/${id}`);

// Parent Portal
export const getParentChildren = () => api.get('/parent/children');
export const getChildAttendance = (id, date = '') => api.get(`/parent/child/${id}/attendance?date=${date}`);
export const getChildExams = (id) => api.get(`/parent/child/${id}/exams`);
export const getChildPayments = (id) => api.get(`/parent/child/${id}/payments`);
export const getParentNotifications = () => api.get('/notifications/parent');
export const sendNotifications = (data) => api.post('/notifications/send', data);
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

export default api;
