import { useState, useEffect } from 'react';
import { getDashboardSummary, getTransferReport, getPromotionReport } from '../../api/reports';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';
import { ArrowLeftRight, TrendingUp } from 'lucide-react';

const Reports = () => {
  const [summary, setSummary] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transfers' | 'promotions'>('transfers');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, t, p] = await Promise.all([
          getDashboardSummary(),
          getTransferReport(),
          getPromotionReport(),
        ]);
        setSummary(s.data);
        setTransfers(t.data.transfers);
        setPromotions(p.data.promotions);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Reports</h2>
          <p className="text-gray-500 text-sm">System-wide analytics and reports</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Teachers', value: summary?.summary.total_teachers },
            { label: 'Total Applications', value: summary?.summary.total_applications },
            { label: 'Last 7 Days', value: summary?.summary.recent_applications_7days },
            { label: 'Verified Credentials', value: summary?.credentials.find((c: any) => c.verification_status === 'verified')?.count || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            {[
              { key: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
              { key: 'promotions', label: 'Promotions', icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === key
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                {activeTab === 'transfers' ? (
                  <tr>
                    {['Teacher', 'Staff ID', 'From', 'To', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                ) : (
                  <tr>
                    {['Teacher', 'Staff ID', 'Grade', 'Years', 'Qualification', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeTab === 'transfers' ? (
                  transfers.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No transfers</td></tr>
                  ) : transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{t.first_name} {t.last_name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.staff_id}</td>
                      <td className="px-4 py-3 text-gray-500">{t.current_district}</td>
                      <td className="px-4 py-3 text-gray-500">{t.requested_district}</td>
                      <td className="px-4 py-3"><Badge status={t.status} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  promotions.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No promotions</td></tr>
                  ) : promotions.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{p.first_name} {p.last_name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.staff_id}</td>
                      <td className="px-4 py-3">{p.current_grade}</td>
                      <td className="px-4 py-3">{p.years_of_service}</td>
                      <td className="px-4 py-3">{p.qualification}</td>
                      <td className="px-4 py-3"><Badge status={p.status} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;