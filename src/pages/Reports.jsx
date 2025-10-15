import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { format as formatDate, subDays } from 'date-fns';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: formatDate(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: formatDate(new Date(), 'yyyy-MM-dd')
  });
  const [format, setFormat] = useState('json');

  const { data: salesReport, isLoading: salesLoading } = useQuery(
    ['sales-report', dateRange, format],
    () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format
      });
      return axios.get(`/reports/sales?${params}`).then(res => res.data);
    },
    {
      enabled: reportType === 'sales'
    }
  );

  const { data: inventoryReport, isLoading: inventoryLoading } = useQuery(
    ['inventory-report', format],
    () => {
      const params = new URLSearchParams({ format });
      return axios.get(`/reports/inventory?${params}`).then(res => res.data);
    },
    {
      enabled: reportType === 'inventory'
    }
  );

  const { data: stockMovementsReport, isLoading: stockMovementsLoading } = useQuery(
    ['stock-movements-report', dateRange, format],
    () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format
      });
      return axios.get(`/reports/stock-movements?${params}`).then(res => res.data);
    },
    {
      enabled: reportType === 'stock-movements'
    }
  );

  const isLoading = salesLoading || inventoryLoading || stockMovementsLoading;

  const handleDownload = () => {
    if (format === 'csv') {
      const reportData = reportType === 'sales' ? salesReport :
                        reportType === 'inventory' ? inventoryReport :
                        stockMovementsReport;
      
      if (reportData) {
        const blob = new Blob([reportData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    }
  };

  const reportTypes = [
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Sales performance and transaction details',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Current stock levels and product information',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      id: 'stock-movements',
      name: 'Stock Movements',
      description: 'Stock in/out transactions and adjustments',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const renderSalesReport = () => {
    if (!salesReport) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-200">€{salesReport.summary?.totalSales?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Transactions</p>
                <p className="text-2xl font-semibold text-gray-200">{salesReport.summary?.totalTransactions || 0}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Average Transaction</p>
                <p className="text-2xl font-semibold text-gray-200">€{salesReport.summary?.averageTransaction?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!inventoryReport) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Total Products</p>
                <p className="text-2xl font-semibold text-gray-200">{inventoryReport.summary?.totalProducts || 0}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Total Value</p>
                <p className="text-2xl font-semibold text-gray-200">€{inventoryReport.summary?.totalInventoryValue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-200">{inventoryReport.summary?.lowStockProducts || 0}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-200">{inventoryReport.summary?.outOfStockProducts || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStockMovementsReport = () => {
    if (!stockMovementsReport) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Total Movements</p>
                <p className="text-2xl font-semibold text-gray-200">{stockMovementsReport.summary?.totalMovements || 0}</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-400">Movement Types</p>
                <p className="text-2xl font-semibold text-gray-200">{Object.keys(stockMovementsReport.summary?.typeStats || {}).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Generate and download detailed reports</p>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Select Report Type</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-4 text-left border rounded-lg transition-colors ${
                reportType === type.id
                  ? 'border-green-800 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <type.icon className={`h-6 w-6 ${type.color}`} />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-200">{type.name}</h4>
                  <p className="text-sm text-gray-400">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <div>
            <label className="form-label">Format</label>
            <select
              className="form-select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="btn btn-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Generating...' : 'Download Report'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="card p-6">
          {reportType === 'sales' && renderSalesReport()}
          {reportType === 'inventory' && renderInventoryReport()}
          {reportType === 'stock-movements' && renderStockMovementsReport()}
        </div>
      )}
    </div>
  );
};

export default Reports;


