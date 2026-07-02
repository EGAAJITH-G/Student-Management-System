import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Preloader from '../Preloader/Preloader';
import styles from './ProtectedRoute.module.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show a premium loading screen while verifying session token
  if (isLoading) {
    return <Preloader />;
  }


  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if user role is not permitted for the route
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Render children (the dashboard) if authenticated
  return children;
};


export default ProtectedRoute;
