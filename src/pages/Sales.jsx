import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  DollarSign,
  ShoppingCart,
  Calendar,
  User
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import clsx from 'clsx';

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cashierFilter, setCashierFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: salesData, isLoading } = useQuery(
    ['sales', { searchTerm, statusFilter, cashierFilter, dateRange, page }],
    () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (cashierFilter) params.append('cashier', cashierFilter);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      return axios.get(`/sales?${params}`).then(res => res.data);
    }
  );

  const { data: salesStats } = useQuery('sales-daily-stats', () =>
    axios.get('/sales/stats/daily').then(res => res.data),
    { refetchInterval: 30000 }
  );

  const { data: users } = useQuery(
    'users',
    () => axios.get('/users').then(res => res.data),
    {
      select: (data) => data.users.filter(user => user.role === 'cashier' || user.role === 'admin')
    }
  );

  const sales = salesData?.sales || [];
  const pagination = salesData?.pagination || {};

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'badge-success', text: 'Completed' },
      cancelled: { class: 'badge-error', text: 'Cancelled' },
      refunded: { class: 'badge-warning', text: 'Refunded' }
    };
    
    const config = statusConfig[status] || { class: 'badge-info', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'card':
        return <div className="h-4 w-4 bg-blue-500 rounded"></div>;
      case 'mobile':
        return <div className="h-4 w-4 bg-green-500 rounded"></div>;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage sales transactions
          </p>
        </div>
        <Link to="/sales/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Link>
      </div>

      {/* Today's totals card for cashiers/overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-400">Today's Transactions</h3>
          <div className="mt-3 text-2xl font-semibold text-gray-200">{salesStats?.totalTransactions ?? '-'}</div>
          <div className="text-sm text-gray-400">transactions today</div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-400">Today's Sales</h3>
          <div className="mt-3 text-2xl font-semibold text-gray-200">CFA {salesStats?.totalSales?.toFixed(2) ?? '-'}</div>
          <div className="text-sm text-gray-400">total sales amount today</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="      Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Cashier</label>
            <select
              className="form-select"
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
            >
              <option value="">All Cashiers</option>
              {users?.map((user) => (
                <option key={user._id || user.id} value={user._id || user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
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
                    <th>Sale Number</th>
                    <th>Date</th>
                    <th>Cashier</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>
                        <div className="text-sm font-medium text-gray-200 font-mono">
                          {sale.saleNumber}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-400">
                          {format(new Date(sale.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(sale.createdAt), 'HH:mm')}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {sale.cashier?.name?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-200">
                              {sale.cashier?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-200">
                          {sale.items?.length || 0} items
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-200">
                          €{sale.total?.toFixed(2) || '0.00'}
                        </div>
                        {sale.totalDiscount > 0 && (
                          <div className="text-sm text-green-600">
                            -€{sale.totalDiscount.toFixed(2)} discount
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center">
                          {getPaymentMethodIcon(sale.paymentMethod)}
                          <span className="ml-2 text-sm text-gray-200 capitalize">
                            {sale.paymentMethod}
                          </span>
                        </div>
                        {sale.paymentDetails?.change > 0 && (
                          <div className="text-sm text-gray-500">
                            Change: €{sale.paymentDetails.change.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(sale.status)}
                      </td>
                      <td>
                        <Link
                          to={`/sales/${sale._id}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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

export default Sales;


