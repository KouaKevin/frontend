import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery(
    ['products', { searchTerm, categoryFilter, lowStockFilter, sortBy, sortOrder, page }],
    () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (lowStockFilter) params.append('lowStock', 'true');
      
      return axios.get(`/products?${params}`).then(res => res.data);
    }
  );

  const { data: categories } = useQuery(
    'product-categories',
    () => axios.get('/products/categories/list').then(res => res.data)
  );

  const deleteProductMutation = useMutation(
    (productId) => axios.delete(`/products/${productId}`),
    {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        queryClient.invalidateQueries('products');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      },
    }
  );

  const handleDelete = (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product inventory
          </p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="      Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.categories?.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stockQuantity">Stock</option>
              <option value="createdAt">Date Added</option>
            </select>
          </div>
          
          <div className="flex items=end">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-200 text-red-600 focus:ring-red-500"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-300">Low Stock Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.image ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={(product.image.startsWith('/') ? (import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + ':5000')) + product.image : product.image)}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-200">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-gray-200 font-mono">
                        {product.sku}
                      </td>
                      <td>
                        <span className={clsx(
                          'badge',
                          'badge-info'
                        )}>
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </span>
                      </td>
                      <td className="text-sm text-gray-200">
                        €{product.price.toFixed(2)}
                      </td>
                      <td>
                        <div className="flex items-center">
                          <span className={clsx(
                            'text-sm font-medium',
                            product.stockQuantity <= product.minStockLevel
                              ? 'text-red-600'
                              : 'text-gray-200'
                          )}>
                            {product.stockQuantity}
                          </span>
                          {product.stockQuantity <= product.minStockLevel && (
                            <AlertTriangle className="ml-1 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={clsx(
                          'badge',
                          product.isActive ? 'badge-success' : 'badge-error'
                        )}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/products/${product._id}/edit`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="text-gray-400 hover:text-red-600"
                            disabled={deleteProductMutation.isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(page - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.total}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="btn btn-outline btn-sm rounded-l-md"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.pages}
                        className="btn btn-outline btn-sm rounded-r-md"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;


