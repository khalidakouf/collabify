import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';

// Component لحماية الصفحات: يلا ماكانش Token، يرجع للمستخدم للـ Login
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" replace />;
};

// Component لحماية صفحات Admin فقط
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    if (!token) return <Navigate to="/" replace />;
    if (role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* صفحة الـ Login هي المسار الرئيسي */}
                <Route path="/" element={<Login />} />

                {/* صفحة الـ Dashboard محمية، ما يمكنش تدخل ليها بلا Token */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* صفحة إدارة المستخدمين — Admin فقط */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    }
                />

                {/* أي مسار خطأ كيرجع المستخدم لصفحة الـ Login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
