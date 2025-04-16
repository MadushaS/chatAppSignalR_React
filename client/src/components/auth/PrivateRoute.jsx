import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';

const PrivateRoute = ({ children }) => {
  const { loading, session } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default PrivateRoute;