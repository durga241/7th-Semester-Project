import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveFarmerDashboard from '@/components/ComprehensiveFarmerDashboard';

const FarmerDashboardPage = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in and is a farmer
    const userRole = localStorage.getItem('farmconnect_userRole');
    const userName = localStorage.getItem('farmconnect_userName');
    const userEmail = localStorage.getItem('farmconnect_userEmail');
    const jwt = localStorage.getItem('fc_jwt');

    if (!jwt || userRole !== 'farmer') {
      // Redirect to login if not authenticated or not a farmer
      navigate('/login');
      return;
    }

    // Set farmer data from localStorage
    setFarmer({
      name: userName || 'Farmer',
      email: userEmail || '',
      role: 'farmer'
    });

    // Load farmer's products
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const { fetchFarmerProducts } = await import('@/services/productService');
      const userEmail = localStorage.getItem('farmconnect_userEmail');
      if (userEmail) {
        const farmerProducts = await fetchFarmerProducts(userEmail);
        setProducts(farmerProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('fc_jwt');
    localStorage.removeItem('farmconnect_userName');
    localStorage.removeItem('farmconnect_userEmail');
    localStorage.removeItem('farmconnect_userRole');
    
    // Redirect to home
    navigate('/');
  };

  if (!farmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ComprehensiveFarmerDashboard 
      userName={farmer.name}
      products={products}
      setProducts={setProducts}
      onLogout={handleLogout}
    />
  );
};

export default FarmerDashboardPage;
