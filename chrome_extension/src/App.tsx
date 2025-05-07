import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store, Dispatch } from '@store/index';
import Header from '@components/Header';
import Dashboard from '@views/dashboard';
import Login from '@views/Login';
import Error from '@components/Error';
import Loading from '@components/Loading';
import ProtectedRoute from '@components/Auth/ProtectedRoute';
import AuthRedirect from '@components/Auth/AuthRedirect';
import { selectAnyLoading } from '@store/selectors';
import { selectIsAuthenticated } from '@store/selectors/auth';
import '@styles/App.css'

const AppContent = () => {
  const dispatch = useDispatch<Dispatch>();
  const isLoading: boolean = useSelector(selectAnyLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Initialize app on mount
  useEffect(() => {
    // Initialize the app through the store
    dispatch.ui.initializeApp();

    // Check if user is already authenticated
    dispatch.auth.fetchCurrentUser();
  }, [dispatch]);

  return (
    <div className="w-[400px] min-h-[500px] h-[100vh] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Header />
      <Error />
      {isLoading && !isAuthenticated ? (
        <Loading />
      ) : (
        <Routes>
          <Route path="/login" element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Redirect any unknown routes to the main page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  )
}

// Main App component wrapped with Redux Provider and Router
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App
