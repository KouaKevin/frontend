import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  Upload, 
  Package,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'alimentaire',
    price: '',
    costPrice: '',
    sku: '',
    barcode: '',
    stockQuantity: '',
    minStockLevel: '5',
    maxStockLevel: '',
    unit: 'piece',
    supplier: '',
    tags: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => axios.get(`/products/${id}`).then(res => res.data.product),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          category: data.category || 'alimentaire',
          price: data.price?.toString() || '',
          costPrice: data.costPrice?.toString() || '',
          sku: data.sku || '',
          barcode: data.barcode || '',
          stockQuantity: data.stockQuantity?.toString() || '',
          minStockLevel: data.minStockLevel?.toString() || '5',
          maxStockLevel: data.maxStockLevel?.toString() || '',
          unit: data.unit || 'piece',
          supplier: data.supplier || '',
          tags: data.tags?.join(', ') || '',
          isActive: data.isActive ?? true
        });
        if (data.image) {
          const backendOrigin = import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + ':5000');
          setImagePreview(data.image.startsWith('/') ? backendOrigin + data.image : data.image);
        }
      }
    }
  );

  const saveProductMutation = useMutation(
    (data) => {
      const formDataToSend = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, data[key].split(',').map(tag => tag.trim()).filter(tag => tag));
        } else if (data[key] !== '') {
          formDataToSend.append(key, data[key]);
        }
      });

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (isEditing) {
        return axios.put(`/products/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        return axios.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    {
      onSuccess: () => {
        toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
        queryClient.invalidateQueries('products');
        navigate('/products');
      },
      onError: (error) => {
        const message = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product`;
        toast.error(message);
        
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Valid stock quantity is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveProductMutation.mutate(formData);
  };

  const categories = [
    { value: 'alimentaire', label: 'Alimentaire' },
    { value: 'boisson', label: 'Boisson' },
    { value: 'hygiene', label: 'Hygiène' },
    { value: 'menage', label: 'Ménage' },
    { value: 'electronique', label: 'Électronique' },
    { value: 'autre', label: 'Autre' }
  ];

  const units = [
    { value: 'piece', label: 'Pièce' },
    { value: 'kg', label: 'Kilogramme' },
    { value: 'litre', label: 'Litre' },
    { value: 'metre', label: 'Mètre' },
    { value: 'paquet', label: 'Paquet' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? 'Update product information' : 'Create a new product in your inventory'}
          </p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="btn btn-outline"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                {/* <div className="sm:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="form-input"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                  />
                </div> */}

                <div>
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Unit</label>
                  <select
                    name="unit"
                    className="form-select"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">Selling Price (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="form-error">{errors.price}</p>}
                </div>

                <div>
                  <label className="form-label">Cost Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="costPrice"
                    className="form-input"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Inventory</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    className={`form-input ${errors.sku ? 'border-red-500' : ''}`}
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && <p className="form-error">{errors.sku}</p>}
                </div>

                {/* <div>
                  <label className="form-label">Barcode</label>
                  <input
                    type="text"
                    name="barcode"s
                    className="form-input"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Enter barcode"
                  />
                </div> */}

                <div>
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    name="stockQuantity"
                    className={`form-input ${errors.stockQuantity ? 'border-red-500' : ''}`}
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  {errors.stockQuantity && <p className="form-error">{errors.stockQuantity}</p>}
                </div>

                <div>
                  <label className="form-label">Minimum Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    name="minStockLevel"
                    className="form-input"
                    value={formData.minStockLevel}
                    onChange={handleChange}
                    placeholder="5"
                  />
                </div>

                {/* <div>
                  <label className="form-label">Maximum Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    name="maxStockLevel"
                    className="form-input"
                    value={formData.maxStockLevel}
                    onChange={handleChange}
                    placeholder="100"
                  />
                </div> */}

                <div>
                  <label className="form-label">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    className="form-input"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-input"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple tags with commas
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Product is active
                  </label>
                </div>
              </div>
            </div> */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Product Image</h3>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No image selected</p>
                  </div>
                )}

                <div>
                  <label className="btn btn-outline w-full cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="card p-6">
              <button
                type="submit"
                disabled={saveProductMutation.isLoading}
                className="btn btn-primary w-full btn-lg"
              >
                {saveProductMutation.isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;


