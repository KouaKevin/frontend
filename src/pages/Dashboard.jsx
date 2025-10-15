import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: salesStats, isLoading: salesLoading } = useQuery(
    'dashboard-sales',
    () => axios.get('/sales/stats/daily').then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: stockStats, isLoading: stockLoading } = useQuery(
    'dashboard-stock',
    () => axios.get('/stocks/summary').then(res => res.data)
  );

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery(
    'dashboard-low-stock',
    () => axios.get('/stocks/low-stock').then(res => res.data)
  );
   const { logout } = useAuth();
   const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    {
      name: 'Today\'s Sales',
      value: salesStats?.totalSales ? `${salesStats.totalSales.toFixed(2)} CFA` : '€0.00',
      change: '',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Transactions',
      value: salesStats?.totalTransactions || 0,
      change: '',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      name: 'Total Products',
      value: stockStats?.totalProducts || 0,
      change: '',
      changeType: 'positive',
      icon: Package,
    },
    {
      name: 'Low Stock Alerts',
      value: stockStats?.lowStockProducts || 0,
      change: stockStats?.lowStockProducts > 0 ? 'Attention needed' : 'All good',
      changeType: stockStats?.lowStockProducts > 0 ? 'negative' : 'positive',
      icon: AlertTriangle,
    },
  ];

  if (salesLoading || stockLoading || lowStockLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening in your store today.
          </p>
        </div>
        {/* <div className="ml-4">
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-200 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-100">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/sales/new')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            New Sale
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/products/new')}>
            <Package className="h-4 w-4 mr-2" />
            Add Product
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/reports')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/users')}>
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </button>
        </div>
      </div>

      {/* Footer
      <div className="text-center text-sm text-gray-500">
        Last updated: {format(new Date(), 'PPpp')}
      </div> */}
    </div>
  );
};

export default Dashboard;
