import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { store } from '@store/index'
import type { Dispatch } from '@store/index'
import '@styles/index.css'
import '@styles/App.css'
import '@styles/Dashboard.css';
import '@styles/Modal.css';


// Views
import Login from '@views/Login'
import Register from '@views/Register'
import Products from '@views/Products'
import Fields from '@views/Fields'
import Users from '@views/Users'

// Layout
import DashboardLayout from '@components/Layout/DashboardLayout'

// Components
import ProtectedRoute from '@components/ProtectedRoute'
import AuthRedirect from '@components/AuthRedirect'
import Dashboard from '@views/Dashboard'

const AppContent = () => {
  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    // Try to fetch the current user when the app loads
    dispatch.auth.fetchCurrentUser()
  }, [dispatch])

  return (
    <Routes>
      <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
      <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />

      {/* Protected Dashboard Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="fields" element={<Fields />} />
        <Route path="users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  )
}

export default App
