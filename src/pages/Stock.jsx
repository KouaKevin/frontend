import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Search, 
  Filter, 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const Stock = () => {
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

  const { data: stockSummary } = useQuery(
    'stock-summary',
    () => axios.get('/stocks/summary').then(res => res.data)
  );

  const { data: lowStockAlerts } = useQuery(
    'stock-alerts',
    () => axios.get('/stocks/alerts').then(res => res.data)
  );

  const updateStockMutation = useMutation(
    ({ productId, quantity, reason }) => 
      axios.post(`/products/${productId}/stock`, { quantity, reason }),
    {
      onSuccess: () => {
        toast.success('Stock updated successfully');
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries('stock-summary');
        queryClient.invalidateQueries('stock-alerts');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock');
      },
    }
  );

  const handleStockUpdate = (productId, quantity, reason) => {
    updateStockMutation.mutate({ productId, quantity, reason });
  };

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {};

  const stats = [
    {
      name: 'Total Products',
      value: stockSummary?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      name: 'Low Stock Alerts',
      value: stockSummary?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      name: 'Out of Stock',
      value: stockSummary?.outOfStockProducts || 0,
      icon: TrendingDown,
      color: 'text-red-600'
    },
    {
      name: 'Total Value',
      value: `€${stockSummary?.totalStockValue?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and manage your inventory levels
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 text-green-400`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-200">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts?.alerts?.lowStockCount > 0 && (
        <div className="card p-6 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have {lowStockAlerts.alerts.lowStockCount} products with low stock levels.
                  Consider restocking these items soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <option value="stockQuantity">Stock Level</option>
              <option value="price">Price</option>
              <option value="createdAt">Date Added</option>
            </select>
          </div>
          
          <div className="flex items=end">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
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
                    <th>Current Stock</th>
                    <th>Min Level</th>
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
                              €{product.price.toFixed(2)}
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
                      <td>
                        <div className="flex items-center">
                          <span className={clsx(
                            'text-sm font-medium',
                            product.stockQuantity <= product.minStockLevel
                              ? 'text-red-600'
                              : 'text-gray-400'
                          )}>
                            {product.stockQuantity}
                          </span>
                          {product.stockQuantity <= product.minStockLevel && (
                            <AlertTriangle className="ml-1 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="text-sm text-gray-400">
                        {product.minStockLevel}
                      </td>
                      <td>
                        <span className={clsx(
                          'badge',
                          product.stockQuantity === 0
                            ? 'badge-error'
                            : product.stockQuantity <= product.minStockLevel
                            ? 'badge-warning'
                            : 'badge-success'
                        )}>
                          {product.stockQuantity === 0
                            ? 'Out of Stock'
                            : product.stockQuantity <= product.minStockLevel
                            ? 'Low Stock'
                            : 'In Stock'
                          }
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStockUpdate(product._id, 1, 'Manual adjustment')}
                            className="text-green-600 hover:text-green-800"
                            disabled={updateStockMutation.isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStockUpdate(product._id, -1, 'Manual adjustment')}
                            className="text-red-600 hover:text-red-800"
                            disabled={updateStockMutation.isLoading}
                          >
                            <Minus className="h-4 w-4" />
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

export default Stock;


