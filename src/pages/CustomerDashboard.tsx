// Customer Dashboard - Uses ModernCustomerDashboard component

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModernCustomerDashboard from '@/components/ModernCustomerDashboard';

const CustomerDashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem('farmconnect_userRole');
    const jwt = localStorage.getItem('fc_jwt');

    if (!jwt || userRole !== 'customer') {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('fc_jwt');
    localStorage.removeItem('farmconnect_userName');
    localStorage.removeItem('farmconnect_userEmail');
    localStorage.removeItem('farmconnect_userRole');
    navigate('/');
  };

  const userName = localStorage.getItem('farmconnect_userName') || 'Customer';
  const userEmail = localStorage.getItem('farmconnect_userEmail') || '';

  return (
    <ModernCustomerDashboard 
      customer={{ name: userName, email: userEmail }}
      onLogout={handleLogout}
    />
  );
};

export default CustomerDashboardPage;
