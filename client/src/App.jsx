import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login Page - Coming Soon</div>} />
          <Route path="/register" element={<div>Register Page - Coming Soon</div>} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <div>Dashboard - Coming Soon</div>
            </PrivateRoute>
          } />
          <Route path="/clients" element={
            <PrivateRoute>
              <div>Clients - Coming Soon</div>
            </PrivateRoute>
          } />
          <Route path="/invoices" element={
            <PrivateRoute>
              <div>Invoices - Coming Soon</div>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
