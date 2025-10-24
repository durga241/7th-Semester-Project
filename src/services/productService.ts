/**
 * Product Service
 * Handles all product-related API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('fc_jwt');
  } catch {
    return null;
  }
};

// Product interface matching backend
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  farmerId: string | { _id: string; name: string; email: string }; // Can be ObjectId or populated object
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Frontend product interface (for compatibility)
export interface FrontendProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  farmer: string;
  location: string;
  image: string;
  stock: number;
  rating: number;
  description: string;
}

// Convert backend product to frontend format
const convertToFrontendProduct = (product: Product): FrontendProduct => {
  // Handle image URL - prepend API base URL for local uploads
  let imageUrl = product.imageUrl || '📦';
  if (imageUrl && imageUrl.startsWith('/uploads/')) {
    imageUrl = `${API_BASE_URL}${imageUrl}`;
  }
  
  // Extract farmer name
  const farmerName = typeof product.farmerId === 'object' && product.farmerId?.name 
    ? product.farmerId.name 
    : 'Unknown Farmer';
  
  return {
    id: product._id,
    name: product.title,
    category: product.category,
    price: product.price,
    unit: 'kg', // Default unit
    farmer: farmerName,
    location: 'India', // Default location
    image: imageUrl,
    stock: product.quantity,
    rating: 4.5, // Default rating
    description: product.description
  };
};

// Fetch all products
export const fetchProducts = async (category?: string): Promise<FrontendProduct[]> => {
  try {
    const url = category && category !== 'All' 
      ? `${API_BASE_URL}/api/products?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/api/products`;
    
    console.log(`[PRODUCTS] Fetching products from: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error('[PRODUCTS] Failed to fetch products:', data);
      return [];
    }
    
    console.log(`[PRODUCTS] Fetched ${data.products?.length || 0} products`);
    return (data.products || []).map(convertToFrontendProduct);
  } catch (error: any) {
    console.error('[PRODUCTS] Error fetching products:', error);
    return [];
  }
};

// Fetch products for a specific farmer
export const fetchFarmerProducts = async (farmerId: string): Promise<FrontendProduct[]> => {
  try {
    const url = `${API_BASE_URL}/api/products/farmer/${farmerId}`;
    console.log(`[PRODUCTS] Fetching farmer products from: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error('[PRODUCTS] Failed to fetch farmer products:', data);
      return [];
    }
    
    console.log(`[PRODUCTS] Fetched ${data.products?.length || 0} farmer products`);
    return (data.products || []).map(convertToFrontendProduct);
  } catch (error: any) {
    console.error('[PRODUCTS] Error fetching farmer products:', error);
    return [];
  }
};

// Create a new product (farmer only)
export const createProduct = async (productData: {
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image?: File;
}): Promise<{ success: boolean; product?: Product; error?: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'Not authenticated. Please log in.' };
    }
    
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('quantity', productData.quantity.toString());
    formData.append('category', productData.category);
    if (productData.image) {
      formData.append('image', productData.image);
    }
    
    console.log('[PRODUCTS] Creating product...');
    
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error('[PRODUCTS] Failed to create product:', data);
      return { success: false, error: data.error || 'Failed to create product' };
    }
    
    console.log('[PRODUCTS] Product created successfully');
    return { success: true, product: data.product };
  } catch (error: any) {
    console.error('[PRODUCTS] Error creating product:', error);
    return { success: false, error: error.message || 'Failed to create product' };
  }
};

// Update a product (farmer only)
export const updateProduct = async (
  productId: string,
  updates: Partial<Product>
): Promise<{ success: boolean; product?: Product; error?: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'Not authenticated. Please log in.' };
    }
    
    console.log(`[PRODUCTS] Updating product ${productId}...`);
    
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error('[PRODUCTS] Failed to update product:', data);
      return { success: false, error: data.error || 'Failed to update product' };
    }
    
    console.log('[PRODUCTS] Product updated successfully');
    return { success: true, product: data.product };
  } catch (error: any) {
    console.error('[PRODUCTS] Error updating product:', error);
    return { success: false, error: error.message || 'Failed to update product' };
  }
};

// Delete a product (farmer only)
export const deleteProduct = async (
  productId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'Not authenticated. Please log in.' };
    }
    
    console.log(`[PRODUCTS] Deleting product ${productId}...`);
    
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error('[PRODUCTS] Failed to delete product:', data);
      return { success: false, error: data.error || 'Failed to delete product' };
    }
    
    console.log('[PRODUCTS] Product deleted successfully');
    return { success: true };
  } catch (error: any) {
    console.error('[PRODUCTS] Error deleting product:', error);
    return { success: false, error: error.message || 'Failed to delete product' };
  }
};
