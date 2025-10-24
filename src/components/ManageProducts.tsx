import { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Upload, X, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Product {
  _id: string;
  id?: string;
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

interface ManageProductsProps {
  products: Product[];
  onProductUpdate: () => void;
  onStatusMessage: (message: string) => void;
  onOrderProduct?: (product: Product) => void;
}

const ManageProducts = ({ products, onProductUpdate, onStatusMessage, onOrderProduct }: ManageProductsProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (editingProduct) {
      setEditForm({
        title: editingProduct.title,
        description: editingProduct.description,
        price: String(editingProduct.price),
        quantity: String(editingProduct.quantity),
        category: editingProduct.category,
        imageUrl: editingProduct.imageUrl
      });
      setImagePreview(editingProduct.imageUrl);
    }
  }, [editingProduct]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = 'dybxnktyv';
    const uploadPreset = 'ml_default'; // Cloudinary unsigned preset
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'farmconnect/products');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setLoading(true);
      toast.loading('Updating product...');
      
      let imageUrl = editForm.imageUrl;
      
      // Upload image to Cloudinary if a new file is selected
      if (imageFile) {
        toast.dismiss();
        toast.loading('Uploading image...');
        try {
          imageUrl = await uploadToCloudinary(imageFile);
          toast.dismiss();
          toast.loading('Saving product...');
        } catch (uploadError) {
          toast.dismiss();
          toast.warning('Image upload failed, saving without new image');
          console.error('Upload error:', uploadError);
        }
      }

      // Update product via API
      const response = await fetch(`/api/products/${editingProduct._id || editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: Number(editForm.price),
          quantity: Number(editForm.quantity),
          category: editForm.category,
          imageUrl: imageUrl,
          status: editingProduct.status,
          visibility: editingProduct.visibility
        })
      });

      if (response.ok) {
        toast.dismiss();
        toast.success('✅ Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        setImageFile(null);
        setImagePreview('');
        onProductUpdate();
      } else {
        const error = await response.json();
        toast.dismiss();
        toast.error(error.error || 'Update failed');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);
      toast.loading('Deleting product...');
      
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        }
      });

      toast.dismiss();

      if (response.ok) {
        toast.success('🗑️ Product deleted successfully!');
        onProductUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Delete failed');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.message || 'Delete failed');
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'available' ? 'out_of_stock' : 'available';
    
    // Optimistic UI update - update immediately
    const statusText = newStatus === 'available' ? 'In Stock ✓' : 'Out of Stock';
    toast.success(`Stock status updated: ${statusText}`);
    onProductUpdate(); // Trigger immediate refresh
    
    try {
      const response = await fetch(`/api/products/${product._id || product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Status update failed - reverting');
        onProductUpdate(); // Revert by refreshing
      }
    } catch (err: any) {
      toast.error('Status update failed - reverting');
      onProductUpdate(); // Revert by refreshing
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    const newVisibility = product.visibility === 'visible' ? 'hidden' : 'visible';
    
    // Optimistic UI update
    toast.success(`${newVisibility === 'visible' ? '👁️ Product shown to' : '🚫 Product hidden from'} customers`);
    onProductUpdate(); // Trigger immediate refresh
    
    try {
      const response = await fetch(`/api/products/${product._id || product.id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fc_jwt')}`
        },
        body: JSON.stringify({ visibility: newVisibility })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Visibility update failed - reverting');
        onProductUpdate(); // Revert by refreshing
      }
    } catch (err: any) {
      toast.error('Visibility update failed - reverting');
      onProductUpdate(); // Revert by refreshing
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product._id || product.id} className="bg-white border border-border/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Product Image */}
              <div className="text-center mb-4">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted/20 rounded-lg flex items-center justify-center text-6xl mb-2">
                    🌾
                  </div>
                )}
                <h3 className="font-semibold text-lg text-foreground">{product.title}</h3>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>

              {/* Status Badges */}
              <div className="flex justify-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status === 'available' ? '✓ Available' : '✗ Out of Stock'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.visibility === 'visible' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.visibility === 'visible' ? '👁 Visible' : '🚫 Hidden'}
                </span>
              </div>

              {/* Product Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold text-primary">₹{product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-semibold">{product.quantity} units</span>
                </div>
              </div>
              
              {product.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Status Toggle */}
                <Button 
                  onClick={() => handleToggleStatus(product)}
                  variant={product.status === 'available' ? 'default' : 'outline'}
                  size="sm" 
                  className="w-full"
                >
                  {product.status === 'available' ? (
                    <><ToggleRight className="w-4 h-4 mr-2" />Mark Out of Stock</>
                  ) : (
                    <><ToggleLeft className="w-4 h-4 mr-2" />Mark Available</>
                  )}
                </Button>

                {/* Visibility Toggle */}
                <Button 
                  onClick={() => handleToggleVisibility(product)}
                  variant={product.visibility === 'visible' ? 'default' : 'outline'}
                  size="sm" 
                  className="w-full"
                >
                  {product.visibility === 'visible' ? (
                    <><EyeOff className="w-4 h-4 mr-2" />Hide from Customers</>
                  ) : (
                    <><Eye className="w-4 h-4 mr-2" />Show to Customers</>
                  )}
                </Button>

                {/* Order Button (if handler provided) */}
                {onOrderProduct && (
                  <Button 
                    onClick={() => onOrderProduct(product)}
                    variant="secondary"
                    size="sm" 
                    className="w-full"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order This Product
                  </Button>
                )}

                {/* Edit and Delete */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEditClick(product)}
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />Edit
                  </Button>
                  <Button 
                    onClick={() => setProductToDelete(product._id || product.id)}
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Product</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setImageFile(null);
                  setImagePreview('');
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="image">Product Image</Label>
                  <div className="mt-2 space-y-2">
                    {imagePreview && (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(editingProduct.imageUrl);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Or enter image URL below
                    </p>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={editForm.imageUrl}
                    onChange={(e) => {
                      setEditForm({ ...editForm, imageUrl: e.target.value });
                      if (e.target.value && !imageFile) {
                        setImagePreview(e.target.value);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <Label htmlFor="title">Product Name *</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="e.g., Organic Tomatoes"
                    className="mt-1"
                    required
                  />
                  {editForm.title && editForm.title.length < 3 && (
                    <p className="text-xs text-red-500 mt-1">Product name must be at least 3 characters</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={editForm.category} 
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
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

                {/* Price and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      placeholder="40"
                      className="mt-1"
                      required
                    />
                    {editForm.price && Number(editForm.price) <= 0 && (
                      <p className="text-xs text-red-500 mt-1">Price must be greater than 0</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                      placeholder="500"
                      className="mt-1"
                      required
                    />
                    {editForm.quantity && Number(editForm.quantity) < 0 && (
                      <p className="text-xs text-red-500 mt-1">Quantity cannot be negative</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Describe your product..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" />Update Product</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
              ) : (
                'Delete Product'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageProducts;
