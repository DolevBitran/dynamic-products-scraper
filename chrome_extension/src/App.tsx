import { useEffect } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '@store/index';
import Header from '@components/Header';
import Dashboard from '@views/dashboard';
import Loading from '@components/Loading';
import { store } from '@store/index';
import {
  selectAnyLoading,
} from '@store/selectors';
import '@styles/App.css'
import Error from '@components/Error';


const AppContent = () => {
  const dispatch = useDispatch<Dispatch>();

  // Get state from Rematch store using selectors
  const isLoading: boolean = useSelector(selectAnyLoading);

  // Initialize app on mount
  useEffect(() => {
    // Initialize the app through the store
    dispatch.ui.initializeApp();
  }, [dispatch]);

  return (
    <div className="w-[400px] min-h-[500px] h-[100vh] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Header />
      <Error />
      {isLoading ? (
        <Loading />
      ) : (
        <Dashboard />
      )}
    </div>
  )
}

// Main App component wrapped with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App
