import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import OrderEnquiry from './pages/admin/OrderEnquiry';
import OrderRealisation from './pages/admin/OrderRealisation';
import DeliveryOrder from './pages/admin/DeliveryOrder';
import VehiclePlaced from './pages/admin/VehiclePlaced';
import FollowUp from "./pages/admin/Follow-Up";  // Fixed: Changed from "FollowUp" to "Follow-Up"
import Receiving from './pages/admin/Reciving';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
          ) : (
            <Login />
          )
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="order-enquiry" element={<OrderEnquiry />} />
        <Route path="order-realisation" element={<OrderRealisation />} />
        <Route path="delivery-order" element={<DeliveryOrder />} />
        <Route path="vehicle-placed" element={<VehiclePlaced />} />
        <Route path="follow-up" element={<FollowUp />} />
        <Route path="receiving" element={<Receiving />} />
      </Route>
      
      {/* Root route - Redirect based on auth status */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard') : '/login'} 
            replace 
          />
        } 
      />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Authentication guard component
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If role is specified and doesn't match, redirect to appropriate dashboard
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }
  
  // If authenticated and role matches (or no role required), render children
  return children;
}

export default App;