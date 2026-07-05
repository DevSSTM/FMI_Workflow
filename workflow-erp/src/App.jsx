import React, { useEffect } from 'react';
import AppRouter from './app/router/AppRouter';
import { useAuthStore } from './app/store/authStore';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <AppRouter />;
}

export default App;
