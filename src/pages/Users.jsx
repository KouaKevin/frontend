import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  User,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery(
    ['users', { searchTerm, roleFilter, statusFilter, sortBy, sortOrder, page }],
    () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('isActive', statusFilter);
      
      return axios.get(`/users?${params}`).then(res => res.data);
    }
  );

  const toggleUserStatusMutation = useMutation(
    ({ userId, isActive }) => 
      axios.put(`/users/${userId}`, { isActive }),
    {
      onSuccess: () => {
        toast.success('User status updated successfully');
        queryClient.invalidateQueries('users');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user status');
      },
    }
  );

  const deleteUserMutation = useMutation(
    (userId) => axios.delete(`/users/${userId}`),
    {
      onSuccess: () => {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries('users');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      },
    }
  );

  const handleToggleStatus = (userId, currentStatus) => {
    toggleUserStatusMutation.mutate({ 
      userId, 
      isActive: !currentStatus 
    });
  };

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete "${userName}"?`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {};

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'cashier':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'stock_manager':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { class: 'badge-error', text: 'Admin' },
      cashier: { class: 'badge-info', text: 'Cashier' },
      stock_manager: { class: 'badge-success', text: 'Stock Manager' }
    };
    
    const config = roleConfig[role] || { class: 'badge-info', text: role };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
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
                placeholder="      Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="stock_manager">Stock Manager</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
              <option value="role">Role</option>
              <option value="createdAt">Date Created</option>
              <option value="lastLogin">Last Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-red-600">
                                {user.name?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-300">
                              {user.name}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              {getRoleIcon(user.role)}
                              <span className="ml-1">{user.role}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td>
                        {getRoleBadge(user.role)}
                      </td>
                      <td>
                        <span className={clsx(
                          'badge',
                          user.isActive ? 'badge-success' : 'badge-error'
                        )}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-sm text-gray-300">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            className={clsx(
                              'text-gray-400 hover:text-gray-600',
                              user.isActive ? 'hover:text-red-600' : 'text-green-600'
                            )}
                            disabled={toggleUserStatusMutation.isLoading}
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          {/* <button
                            className="text-green-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button> */}
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="text-red-600"
                            disabled={deleteUserMutation.isLoading}
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

export default Users;


