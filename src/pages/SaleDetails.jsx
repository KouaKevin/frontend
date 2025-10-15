import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(['sale', id], () =>
    axios.get(`/sales/${id}`).then(res => res.data.sale)
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="spinner"/></div>;
  if (error) return <div className="text-red-600">Failed to load sale</div>;

  const sale = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sale Details</h1>
          <p className="mt-1 text-sm text-gray-500">Sale {sale.saleNumber}</p>
        </div>
        <div>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Date</div>
            <div className="text-sm font-medium">{format(new Date(sale.createdAt), 'PPpp')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Cashier</div>
            <div className="text-sm font-medium">{sale.cashier?.name}</div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-medium mb-4">Items</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center">
                      {it.product?.image ? (
                        <img src={(it.product.image.startsWith('/') ? (import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + ':5000')) + it.product.image : it.product.image)} alt={it.product?.name} className="h-10 w-10 rounded object-cover mr-3" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded mr-3"></div>
                      )}
                      <div>
                        <div className="text-sm font-medium">{it.product?.name}</div>
                        <div className="text-sm text-gray-500">{it.product?.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>{it.quantity}</td>
                  <td>CFA {Number(it.unitPrice).toFixed(2)}</td>
                  <td>CFA {Number(it.discount || 0).toFixed(2)}</td>
                  <td>CFA {Number(it.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4 max-w-sm ml-auto">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>CFA {Number(sale.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>CFA {Number(sale.tax || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>CFA {Number(sale.total).toFixed(2)}</span>
          </div>
          {sale.paymentDetails?.cashReceived !== undefined && (
            <>
              <div className="flex justify-between">
                <span>Cash Received</span>
                <span>CFA {Number(sale.paymentDetails.cashReceived).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change</span>
                <span>CFA {Number(sale.paymentDetails.change || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
