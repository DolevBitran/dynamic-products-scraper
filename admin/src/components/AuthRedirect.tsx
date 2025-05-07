import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectToken, selectIsLoading } from '@store/selectors';
import Loading from '@components/Loading/Loading';

interface AuthRedirectProps {
  children: React.ReactNode;
}

/**
 * AuthRedirect component - redirects authenticated users to dashboard
 * This is the opposite of ProtectedRoute - it prevents authenticated users
 * from accessing pages they shouldn't need when logged in (like login/register)
 */
const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const token = useSelector(selectToken);
  const isLoading = useSelector(selectIsLoading);
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  // If user is authenticated, redirect to root path
  if (token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Otherwise, render the children (login/register page)
  return <>{children}</>;
};

export default AuthRedirect;
