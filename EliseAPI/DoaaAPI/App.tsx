import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import FunctionList from './components/FunctionList';
import CreateFunction from './components/CreateFunction';
import TestFunction from './components/TestFunction';
import CreateQuery from './components/CreateQuery';
import ProjectReport from './components/ProjectReport';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout><FunctionList /></Layout></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><Layout><CreateFunction /></Layout></ProtectedRoute>} />
        <Route path="/query" element={<ProtectedRoute><Layout><CreateQuery /></Layout></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Layout><ProjectReport /></Layout></ProtectedRoute>} />
        <Route path="/test/:id" element={<ProtectedRoute><Layout><TestFunction /></Layout></ProtectedRoute>} />
      </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;