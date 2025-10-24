import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  status: 'available' | 'out_of_stock';
  visibility: 'visible' | 'hidden';
  farmerId: string;
}

// Fetch all products
export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const url = category 
        ? `${API_BASE_URL}/api/products?category=${category}`
        : `${API_BASE_URL}/api/products`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      return data.products || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Fetch products by farmer
export const useFarmerProducts = (farmerId: string) => {
  return useQuery({
    queryKey: ['products', 'farmer', farmerId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/products/farmer/${farmerId}`);
      if (!response.ok) throw new Error('Failed to fetch farmer products');
      
      const data = await response.json();
      return data.products || [];
    },
    enabled: !!farmerId,
    staleTime: 3 * 60 * 1000,
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: FormData) => {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: productData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('✅ Product created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    }
  });
};

// Update product mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('✅ Product updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    }
  });
};

// Delete product mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('🗑️ Product deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    }
  });
};

// Toggle product status
export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'available' | 'out_of_stock' }) => {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`✅ Product marked as ${variables.status === 'available' ? 'Available' : 'Out of Stock'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    }
  });
};

// Toggle product visibility
export const useToggleProductVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, visibility }: { id: string; visibility: 'visible' | 'hidden' }) => {
      const token = localStorage.getItem('fc_jwt');
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ visibility })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update visibility');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`${variables.visibility === 'visible' ? '👁️ Product shown to' : '🚫 Product hidden from'} customers`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update visibility');
    }
  });
};
