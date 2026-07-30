import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Rooms from './pages/Rooms';
import Students from './pages/Students';
import Complaints from './pages/Complaints';
import Leaves from './pages/Leaves';
import Menus from './pages/Menus';
import Profile from './pages/Profile';

export const ThemeContext = createContext();

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/app" />;
  
  return children;
};

const RoleBasedHome = () => {
  const role = localStorage.getItem('role');
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'student') return <StudentDashboard />;
  return <Navigate to="/login" />;
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            {/* Common Routes */}
            <Route index element={<RoleBasedHome />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="leaves" element={<Leaves />} />
            
            {/* Student Only Routes */}
            <Route path="profile" element={<PrivateRoute allowedRoles={['student']}><Profile /></PrivateRoute>} />
            
            {/* Admin Only Routes */}
            <Route path="rooms" element={<PrivateRoute allowedRoles={['admin']}><Rooms /></PrivateRoute>} />
            <Route path="students" element={<PrivateRoute allowedRoles={['admin']}><Students /></PrivateRoute>} />
            <Route path="menus" element={<PrivateRoute allowedRoles={['admin']}><Menus /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;
