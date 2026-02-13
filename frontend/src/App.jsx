import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/common/Dashboard';
import Orders from './pages/cashier/Orders';
import POSDetail from './pages/cashier/POSDetail';
import Services from './pages/admin/Services';
import UserManagement from './pages/admin/UserManagement';
import Tracking from './pages/public/Tracking';
import Driver from './pages/driver/Driver';
import CustomerPortal from './pages/customer/CustomerPortal';
import NewOrder from './pages/customer/NewOrder';
import Checkout from './pages/customer/Checkout';
import OrderDetail from './pages/customer/OrderDetail';
import Maintenance from './pages/public/Maintenance';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/app/dashboard" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/track" element={<Tracking />} />
                    
                    <Route path="/app" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/app/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="orders/:orderId" element={
                            <ProtectedRoute roles={['admin', 'cashier']}>
                                <POSDetail />
                            </ProtectedRoute>
                        } />
                        <Route path="services" element={<Services />} />
                        <Route path="users" element={
                            <ProtectedRoute roles={['admin']}>
                                <UserManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="logistics" element={<Driver />} />
                        <Route path="my-orders" element={<CustomerPortal />} />
                        <Route path="my-orders/:orderId" element={<OrderDetail />} />
                        <Route path="new-order" element={<NewOrder />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="settings" element={<Maintenance />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;