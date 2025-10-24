import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, Archive, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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
  farmerId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    imageUrl: '',
    status: 'available' as 'available' | 'out_of_stock',
    visibility: 'visible' as 'visible' | 'hidden'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setStatusMessage('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          quantity: Number(formData.quantity)
        })
      });

      if (response.ok) {
        setStatusMessage('✅ Product updated successfully!');
        setShowEditModal(false);
        setSelectedProduct(null);
        loadProducts();
      } else {
        const error = await response.json();
        setStatusMessage(error.error || 'Failed to update product');
      }
    } catch (error) {
      setStatusMessage('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        }
      });

      if (response.ok) {
        setStatusMessage('✅ Product deleted successfully!');
        loadProducts();
      } else {
        const error = await response.json();
        setStatusMessage(error.error || 'Failed to delete product');
      }
    } catch (error) {
      setStatusMessage('Failed to delete product');
    }
  };

  const handleToggleVisibility = async (productId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'visible' ? 'hidden' : 'visible';

    try {
      const response = await fetch(`/api/admin/products/${productId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        },
        body: JSON.stringify({ visibility: newVisibility })
      });

      if (response.ok) {
        setStatusMessage(`✅ Product ${newVisibility === 'visible' ? 'shown' : 'hidden'}`);
        loadProducts();
      } else {
        const error = await response.json();
        setStatusMessage(error.error || 'Failed to update visibility');
      }
    } catch (error) {
      setStatusMessage('Failed to update visibility');
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: String(product.price),
      quantity: String(product.quantity),
      category: product.category,
      imageUrl: product.imageUrl,
      status: product.status,
      visibility: product.visibility
    });
    setShowEditModal(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground">Manage all products across the platform</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-gradient">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Grains/Pulses">Grains/Pulses</SelectItem>
                <SelectItem value="Leafy Greens">Leafy Greens</SelectItem>
                <SelectItem value="Herbs">Herbs</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="card-gradient">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="card-gradient hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="mb-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-6xl">
                      🌾
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                  <div className="flex items-center gap-2">
                    <Badge className={product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {product.status === 'available' ? 'Available' : 'Out of Stock'}
                    </Badge>
                    <Badge className={product.visibility === 'visible' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                      {product.visibility === 'visible' ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-bold text-primary">₹{product.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock</p>
                      <p className="font-bold">{product.quantity}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Farmer: {product.farmerId?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(product)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVisibility(product._id, product.visibility)}
                  >
                    {product.visibility === 'visible' ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Product</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <Label htmlFor="title">Product Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Grains/Pulses">Grains/Pulses</SelectItem>
                      <SelectItem value="Leafy Greens">Leafy Greens</SelectItem>
                      <SelectItem value="Herbs">Herbs</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={formData.visibility} onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visible">Visible</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Update Product</Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
