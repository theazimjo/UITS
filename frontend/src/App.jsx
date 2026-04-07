import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Services
import { 
  getStudents, syncStudents, 
  getStaff, getRoles, 
  getGroups, getFields, getCourses, getRooms 
} from './services/api';

// Components
import Layout from './components/layout/Layout';
import TeacherLayout from './components/layout/TeacherLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Payments from './pages/Payments';
import StaffDetail from './pages/StaffDetail';
import StudentDetail from './pages/StudentDetail';
import Finance from './pages/Finance';
import Settings from './pages/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherGroups from './pages/teacher/TeacherGroups';
import TeacherFinance from './pages/teacher/TeacherFinance';
import TeacherSettings from './pages/teacher/TeacherSettings';

// Icons
import { Wallet } from 'lucide-react';

import useStore from './store/useStore';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const { hydrate } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      // Initial redirect if at root
      if (location.pathname === '/' || location.pathname === '/login') {
        if (user.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      
      if (user.role !== 'teacher') {
        fetchInitialData();
      }
    } else if (location.pathname !== '/login') {
      navigate('/login');
    }
    setLoading(false);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [st, sf, rl, gr, fl, cr, rm] = await Promise.all([
        getStudents(), getStaff(), getRoles(), getGroups(), getFields(), getCourses(), getRooms()
      ]);
      
      hydrate({
        students: st?.data || [],
        staff: sf?.data || [],
        roles: rl?.data || [],
        groups: gr?.data || [],
        fields: fl?.data || [],
        courses: cr?.data || [],
        rooms: rm?.data || []
      });
    } catch (e) {
      console.error('Initial fetch error:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token'); 
    localStorage.removeItem('user');
    setCurrentUser(null); 
    navigate('/login');
  };

  // Global loading is handled by Layout/ProtectedRoute or per-page via the loading prop

  return (
    <>
      <Routes>
        <Route path="/login" element={
          <Login onLoginSuccess={(user) => { 
            setCurrentUser(user); 
            if (user.role === 'teacher') {
              navigate('/teacher/dashboard');
            } else {
              fetchInitialData(); 
              navigate('/dashboard'); 
            }
          }} />
        } />
        
        {/* Admin Routes */}
        <Route element={
          <ProtectedRoute>
            <Layout currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/students" element={<Students />} />
          
          <Route path="/students/:id" element={<StudentDetail />} />
          
          <Route path="/staff" element={<Staff />} />
          
          <Route path="/staff/:id" element={<StaffDetail />} />
          
          <Route path="/groups" element={<Groups />} />

          <Route path="/groups/:id" element={<GroupDetail />} />
          
          <Route path="/payments" element={<Payments />} />
          
          <Route path="/finance" element={<Finance />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute>
            <TeacherLayout currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="groups" element={<TeacherGroups />} />
          <Route path="finance" element={<TeacherFinance />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>
        
        <Route path="/" element={<Navigate to={currentUser?.role === 'teacher' ? "/teacher/dashboard" : "/dashboard"} replace />} />
        <Route path="*" element={<Navigate to={currentUser?.role === 'teacher' ? "/teacher/dashboard" : "/dashboard"} replace />} />
      </Routes>
    </>
  );
}

export default App;
