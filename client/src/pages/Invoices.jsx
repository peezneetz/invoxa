import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Plus, FileText, ChevronDown } from 'lucide-react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const statusOptions = ['draft', 'sent', 'paid', 'overdue'];

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await api.patch(`/invoices/${id}/status`, { status });
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: res.data.status } : inv));
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filtered = filter === 'all' ? invoices : invoices.filter(inv => inv.status === filter);

  const totals = {
    all: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          to="/invoices/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
        >
          <Plus size={18} />
          New Invoice
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...statusOptions].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({totals[s] || 0})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">No invoices found</p>
            <p className="text-gray-500 text-sm mb-4">
              {filter === 'all' ? 'Create your first invoice to get started' : `No ${filter} invoices`}
            </p>
            {filter === 'all' && (
              <Link to="/invoices/new" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Create invoice
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <div className="col-span-2">Number</div>
              <div className="col-span-3">Client</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(inv => (
                <div key={inv.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-blue-600">{inv.invoice_number}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-900">{inv.client_name || 'No client'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">
                      {new Date(inv.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="relative inline-block">
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                        disabled={updatingId === inv.id}
                        className={`appearance-none text-xs font-medium px-3 py-1.5 rounded-full pr-7 cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[inv.status]}`}
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {inv.currency} {parseFloat(inv.total).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
