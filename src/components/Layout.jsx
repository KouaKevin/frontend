import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Build navigation based on role
  let navigation = [];
  if (user?.role === 'stock_manager') {
    navigation = [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Stock', href: '/stock', icon: Warehouse },
      { name: 'Settings', href: '/settings', icon: Settings }
    ];
  } else if (user?.role === 'cashier') {
    navigation = [
      { name: 'Sales', href: '/sales', icon: ShoppingCart }
    ];
  } else {
    navigation = [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Sales', href: '/sales', icon: ShoppingCart },
      { name: 'Stock', href: '/stock', icon: Warehouse },
      ...(user?.role === 'admin' ? [{ name: 'Users', href: '/users', icon: Users }] : []),
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Settings', href: '/settings', icon: Settings },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-red-600">Champion Market</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                      onClick={() => { sessionStorage.setItem('nav_allowed', '1'); setSidebarOpen(false); }}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-red-600">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-red-600">Champion Market</h1>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                      onClick={() => { sessionStorage.setItem('nav_allowed', '1'); }}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-red-600">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-2">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-red-600">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
