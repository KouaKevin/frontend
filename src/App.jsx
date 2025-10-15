import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Sales from './pages/Sales';
import SaleForm from './pages/SaleForm';
import SaleDetails from './pages/SaleDetails';
import Stock from './pages/Stock';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  // Enforce that navigation came through the layout (prevent manual URL access)
  const navAllowed = sessionStorage.getItem('nav_allowed');
  if (!navAllowed) {
    return <Navigate to="/login" replace />;
  }

  // If user is a cashier, restrict routes to Sales only
  if (user.role === 'cashier') {
    return (
      <Layout>
        <Routes>
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<SaleForm />} />
          <Route path="/sales/:id" element={<SaleDetails />} />
          <Route path="*" element={<Navigate to="/sales" replace />} />
        </Routes>
      </Layout>
    );
  }

  // If user is a stock manager, restrict to Products, Stock and Settings
  if (user.role === 'stock_manager') {
    return (
      <Layout>
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
  <Route path="/sales" element={<Sales />} />
  <Route path="/sales/new" element={<SaleForm />} />
  <Route path="/sales/:id" element={<SaleDetails />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
