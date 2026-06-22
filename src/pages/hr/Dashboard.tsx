import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../../api/reports';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { type DashboardSummary } from '../../types/index';
import { Users, ArrowLeftRight, TrendingUp, Shield, Clock, UserCog } from 'lucide-react';

const StatCard = ({
  icon: Icon, label, value, color
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-xs md:text-sm">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const HRDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDashboardSummary();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  const pendingTransfers = data?.transfers.find(t => t.status === 'pending')?.count || 0;
  const pendingPromotions = data?.promotions.find(p => p.status === 'pending')?.count || 0;
  const verifiedCredentials = data?.credentials.find(c => c.verification_status === 'verified')?.count || 0;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold">HR Officer Dashboard</h2>
          <p className="text-slate-300 mt-1 text-sm">
            Manage teacher records, transfers, promotions and credentials
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={Users}
            label="Total Teachers"
            value={data?.summary.total_teachers || 0}
            color="bg-amber-500"
          />
          {isAdmin && (
            <StatCard
              icon={UserCog}
              label="Total HR Officers"
              value={data?.summary.total_hr_officers || 0}
              color="bg-blue-500"
            />
          )}
          <StatCard
            icon={Clock}
            label="Pending Transfers"
            value={pendingTransfers}
            color="bg-yellow-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Pending Promotions"
            value={pendingPromotions}
            color="bg-purple-500"
          />
          <StatCard
            icon={Shield}
            label="Verified Credentials"
            value={verifiedCredentials}
            color="bg-green-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Transfer Status */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-amber-600" />
              Transfer Applications
            </h3>
            <div className="space-y-3">
              {data?.transfers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No transfer data</p>
              ) : (
                data?.transfers.map((t) => (
                  <div key={t.status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {t.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 md:w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (parseInt(t.count) /
                                data.transfers.reduce((a, b) => a + parseInt(b.count), 0)) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-6">{t.count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Promotion Status */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-600" />
              Promotion Applications
            </h3>
            <div className="space-y-3">
              {data?.promotions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No promotion data</p>
              ) : (
                data?.promotions.map((p) => (
                  <div key={p.status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {p.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 md:w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (parseInt(p.count) /
                                data.promotions.reduce((a, b) => a + parseInt(b.count), 0)) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-6">{p.count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Teachers by Region */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-amber-600" />
            Teachers by Region
          </h3>
          {data?.teachers_by_region.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No data</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data?.teachers_by_region.map((r) => (
                <div key={r.current_region}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-600">{r.current_region || 'Unknown'}</span>
                  <span className="font-bold text-amber-700">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HRDashboard;