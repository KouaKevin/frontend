import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyItem = { product: '', productName: '', quantity: 1, unitPrice: 0, discount: 0, image: '' };

const SaleForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: productsData } = useQuery('all-products-for-sale', () =>
    axios.get('/products?limit=1000').then(res => res.data.products)
  );

  const products = productsData || [];

  const [items, setItems] = useState([ { ...emptyItem } ]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tax, setTax] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const receiptRef = useRef();
  const [loading, setLoading] = useState(false);

  const createSale = useMutation(
    (payload) => axios.post('/sales', payload),
    {
      onSuccess: (res) => {
        toast.success('Sale created');
        queryClient.invalidateQueries('sales');
        navigate('/sales');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to create sale');
      }
    }
  );

  const handleAddItem = () => setItems(prev => ([...prev, { ...emptyItem }]));

  const handleRemoveItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));

  const handleChangeItem = (index, field, value) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const handleSelectProduct = (index, productId) => {
    const prod = products.find(p => p._id === productId);
    if (!prod) return;
    setItems(prev => prev.map((it, i) => i === index ? {
      ...it,
      product: prod._id,
      productName: prod.name,
      unitPrice: prod.price || 0,
      image: prod.image || ''
    } : it));
  };

  const computed = useMemo(() => {
    const subtotal = items.reduce((s, it) => {
      const q = Number(it.quantity) || 0;
      const up = Number(it.unitPrice) || 0;
      const d = Number(it.discount) || 0;
      return s + Math.max(0, q * up - d);
    }, 0);
    const total = subtotal + (Number(tax) || 0);
    return { subtotal, total };
  }, [items, tax]);

  const change = Math.max(0, (Number(cashReceived) || 0) - computed.total);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!items.length || items.some(it => !it.product || Number(it.quantity) <= 0 || Number(it.unitPrice) < 0)) {
      toast.error('Please fill valid product, quantity and unit price for each item');
      setLoading(false);
      return;
    }

    const payload = {
      items: items.map(it => ({
        product: it.product,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        discount: Number(it.discount) || 0
      })),
      paymentMethod,
      tax: Number(tax) || 0,
      paymentDetails: {
        cashReceived: paymentMethod === 'cash' || paymentMethod === 'mixed' ? Number(cashReceived) || 0 : undefined,
        change: paymentMethod === 'cash' || paymentMethod === 'mixed' ? change : undefined
      }
    };

    try {
      const res = await createSale.mutateAsync(payload);
      // Build receipt and open print window
      const sale = res?.data?.sale || null;
      if (sale) {
        const receiptPayload = {
          sale,
          subtotal: computed.subtotal,
          tax: Number(tax) || 0,
          total: computed.total,
          cashReceived: Number(cashReceived) || 0,
          change
        };
        // open simple receipt in new window for printing
        const w = window.open('', '_blank');
        if (w) {
          const html = `<!doctype html><html><head><title>Receipt</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #ddd}</style></head><body>` +
            `<h2>Receipt - ${sale.saleNumber || ''}</h2>` +
            `<p>Date: ${new Date(sale.createdAt).toLocaleString()}</p>` +
            `<table>` +
            `<thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total (CFA)</th></tr></thead><tbody>` +
            (sale.items.map(it => `<tr><td>${it.product.name || ''}</td><td>${it.quantity}</td><td>${Number(it.unitPrice).toFixed(2)}</td><td>${Number(it.totalPrice).toFixed(2)}</td></tr>`).join('')) +
            `</tbody></table>` +
            `<p>Subtotal: CFA ${receiptPayload.subtotal.toFixed(2)}</p>` +
            `<p>Tax: CFA ${receiptPayload.tax.toFixed(2)}</p>` +
            `<p><strong>Total: CFA ${receiptPayload.total.toFixed(2)}</strong></p>` +
            `<p>Cash Received: CFA ${receiptPayload.cashReceived.toFixed(2)}</p>` +
            `<p>Change: CFA ${receiptPayload.change.toFixed(2)}</p>` +
            `<p>Thank you for your purchase.</p>` +
            `</body></html>`;
          w.document.write(html);
          w.document.close();
          w.focus();
          w.print();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Sale</h1>
          <p className="mt-1 text-sm text-gray-500">Create a new sales transaction</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-4 space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <h2 className="text-sm font-medium text-red-600">Product</h2>
                <div className="relative">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search product by name or SKU..."
                    value={item.productName || ''}
                    onChange={(e) => {
                      handleChangeItem(idx, 'productName', e.target.value);
                    }}
                  />
                  {item.productName && (
                    <div className="absolute z-10 left-0 right-0 bg-white border rounded mt-1 max-h-48 overflow-auto">
                      {products.filter(p => (p.name || '').toLowerCase().includes((item.productName || '').toLowerCase()) || (p.sku || '').toLowerCase().includes((item.productName || '').toLowerCase())).slice(0, 10).map(p => (
                        <div key={p._id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleSelectProduct(idx, p._id)}>
                          <img src={(p.image && p.image.startsWith('/')) ? (import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + ':5000')) + p.image : p.image} alt={p.name} className="h-8 w-8 rounded mr-2 object-cover" />
                          <div>
                            <div className="text-sm font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.sku}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center">
                  {item.image ? (
                    <img src={(item.image && item.image.startsWith('/')) ? (import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + ':5000')) + item.image : item.image} alt="preview" className="h-12 w-12 rounded object-cover mr-3" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded mr-3 flex items-center justify-center">No image</div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm">Tax (CFA)</div>
                    <input type="number" step="0.01" className="form-input mt-1" value={tax} onChange={(e) => setTax(e.target.value)} />
                  </div>
                </div>
                <div className="mt-2">
                  <input type="number" min="1" className="form-input" value={item.quantity} onChange={(e) => handleChangeItem(idx, 'quantity', e.target.value)} />
                </div>
              </div>

              <div className="col-span-2">
                <label className="form-label">Unit Price</label>
                <input type="number" step="0.01" min="0" className="form-input" value={item.unitPrice} onChange={(e) => handleChangeItem(idx, 'unitPrice', e.target.value)} />
              </div>

              <div className="col-span-2">
                <label className="form-label">Discount</label>
                <input type="number" step="0.01" min="0" className="form-input" value={item.discount} onChange={(e) => handleChangeItem(idx, 'discount', e.target.value)} />
              </div>

              <div className="col-span-1 flex items-start justify-end">
                <button type="button" className="text-red-600 hover:text-red-800" onClick={() => handleRemoveItem(idx)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div>
            <button type="button" className="btn btn-outline" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2"/> Add Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card p-4">
            <h3 className="text-sm font-medium text-red-600">Payment</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile</option>
                  {/* <option value="mixed">Mixed</option> */}
                </select>
              </div>

              <div>
                <label className="form-label">Tax ()</label>
                <input type="number" step="0.01" className="form-input" value={tax} onChange={(e) => setTax(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-medium text-red-600">Summary</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>CFA {computed.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>CFA {(Number(tax) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>CFA {computed.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="form-label">Cash Received (CFA)</label>
              <input type="number" step="0.01" className="form-input" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} />
              <div className="flex justify-between mt-2 font-medium">
                <span>Change</span>
                <span>CFA {change.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary w-full" disabled={loading || createSale.isLoading}>
                {loading || createSale.isLoading ? 'Processing...' : 'Create Sale'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleForm;


