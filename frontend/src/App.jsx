import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';


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
import AdminReports from './pages/AdminReports';
import CertificatesPage from './pages/CertificatesPage';
import Messages from './pages/Messages';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherGroups from './pages/teacher/TeacherGroups';
import TeacherFinance from './pages/teacher/TeacherFinance';
import TeacherSettings from './pages/teacher/TeacherSettings';
import TeacherReport from './pages/teacher/TeacherReport';
import TeacherCertificates from './pages/teacher/TeacherCertificates';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';

// Notifications
import { Toaster } from 'react-hot-toast';

import useStore from './store/useStore';

function App() {
  const { user, setUser, refreshAllRows } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Bitta tasodifiy/vaqtinchalik uzilish overlay chiqarmasligi uchun,
    // faqat ketma-ket 2 marta muvaffaqiyatsiz bo'lgandagina offline deb belgilanadi.
    let consecutiveFailures = 0;

    const checkStatus = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '/api';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${baseUrl}/system/status`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          // Server javob qaytardi, lekin xatolik statusi bilan — bu tizim
          // yangilanishi emas, serverga yetib bo'lmayotganini bildiradi.
          consecutiveFailures += 1;
          setIsMaintenance(false);
          if (consecutiveFailures >= 2) setIsOffline(true);
          return;
        }
        consecutiveFailures = 0;
        const data = await res.json();
        setIsMaintenance(!!data.maintenance);
        setIsOffline(false);
      } catch (err) {
        // fetch network xatosi (internet yo'q, uzilgan, timeout) — server
        // yangilanishi bilan aralashtirmaslik uchun alohida holat sifatida belgilanadi.
        consecutiveFailures += 1;
        setIsMaintenance(false);
        if (consecutiveFailures >= 2) setIsOffline(true);
      }
    };

    // Run immediately and then poll every 4 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, []);

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
      const u = JSON.parse(userStr);
      setUser(u);
      
      // Initial redirect if at root or login pages
      if (location.pathname === '/' || location.pathname === '/login') {
        if (u.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (u.role === 'parent') {
          navigate('/parent/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      
      refreshAllRows();
    } else if (location.pathname !== '/login') {
      navigate('/login');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token'); 
    localStorage.removeItem('user');
    setUser(null); 
    navigate('/login');
  };

  // Global loading is handled by Layout/ProtectedRoute or per-page via the loading prop
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Maintenance Overlay */}
      {isMaintenance && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md px-4 text-center select-none animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 flex flex-col items-center animate-scale-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <svg 
                className="w-20 h-20 text-blue-600 animate-spin" 
                style={{ animationDuration: '3s' }}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Tizim yangilanmoqda
            </h1>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Hozirda tizimni yaxshilash maqsadida texnik ishlar olib borilmoqda. 
              Yangilanish yakunlangach, dastur <strong>avtomatik ravishda</strong> ishga tushadi. 
              Iltimos, sahifani yopmang...
            </p>

            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Server holati tekshirilmoqda...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Connection Problem Overlay */}
      {!isMaintenance && isOffline && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md px-4 text-center select-none animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 flex flex-col items-center animate-scale-up">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <svg
                className="w-20 h-20 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Internetga ulanishda muammo
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Serverga ulanib bo'lmadi. Iltimos, internet aloqangizni tekshiring.
              Aloqa tiklangach, dastur <strong>avtomatik ravishda</strong> davom etadi.
            </p>

            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Qayta ulanishga urinilmoqda...
              </span>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/login" element={
          <Login onLoginSuccess={(u) => { 
            setUser(u); 
            refreshAllRows();
            if (u.role === 'teacher') {
              navigate('/teacher/dashboard');
            } else if (u.role === 'parent') {
              navigate('/parent/dashboard');
            } else {
              navigate('/dashboard'); 
            }
          }} />
        } />


        
        {/* Admin Routes */}
        <Route element={
          <ProtectedRoute>
            <Layout currentUser={user} onLogout={handleLogout} />
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
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<AdminReports />} />
          <Route path="/messages" element={<Messages />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute>
            <TeacherLayout currentUser={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="groups" element={<TeacherGroups />} />
          <Route path="finance" element={<TeacherFinance />} />
          <Route path="report" element={<TeacherReport />} />
          <Route path="certificates" element={<TeacherCertificates />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>

        {/* Parent Routes */}
        <Route path="/parent">
          <Route path="dashboard" element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          } />
        </Route>
        
        
        <Route path="/" element={<Navigate to={user?.role === 'teacher' ? "/teacher/dashboard" : user?.role === 'parent' ? "/parent/dashboard" : "/dashboard"} replace />} />
        <Route path="*" element={<Navigate to={user?.role === 'teacher' ? "/teacher/dashboard" : user?.role === 'parent' ? "/parent/dashboard" : "/dashboard"} replace />} />
      </Routes>
    </>
  );
}

export default App;
