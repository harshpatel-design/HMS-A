import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function PrivateRoute() {
  const [isAuth, setIsAuth] = useState(
    !!localStorage.getItem('auth_token')
  );

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuth(!!token);
    };

    const interval = setInterval(checkToken, 500);
    return () => clearInterval(interval);
  }, []);

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}