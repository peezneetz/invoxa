import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import api from '../utils/api';
import { FileText, Users, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, cliRes] = await Promise.all([
          api.get('/invoices'),
          api.get('/clients'),
        ]);
        setInvoices(invRes.data);
        setClients(cliRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  const outstanding = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  const recentInvoices = invoices.slice(0, 5);

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
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">Here is what is happening with your invoices.</p>
        </div>
        <Link
          to="/invoices/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
        >
          <Plus size={18} />
          New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Invoices" value={invoices.length} color="bg-blue-500" />
        <StatCard icon={Users} label="Total Clients" value={clients.length} color="bg-purple-500" />
        <StatCard
          icon={TrendingUp}
          label="Revenue (Paid)"
          value={`KES ${totalRevenue.toLocaleString()}`}
          color="bg-green-500"
        />
        <StatCard
          icon={Clock}
          label="Outstanding"
          value={`KES ${outstanding.toLocaleString()}`}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
          <Link to="/invoices" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">No invoices yet</p>
            <p className="text-gray-500 text-sm mb-4">Create your first invoice to get started</p>
            <Link
              to="/invoices/new"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Create invoice
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentInvoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-500">{inv.client_name || 'No client'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[inv.status]}`}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 w-32 text-right">
                    {inv.currency} {parseFloat(inv.total).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
