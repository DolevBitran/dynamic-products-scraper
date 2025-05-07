import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectToken, selectIsLoading } from '@store/selectors';
import Loading from '@components/Loading/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = useSelector(selectToken);
  const isLoading = useSelector(selectIsLoading);
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
