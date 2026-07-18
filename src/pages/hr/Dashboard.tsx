import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../../api/reports';
import Layout from '../../components/layout/Layout';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { type DashboardSummary } from '../../types/index';
import {
  Users, ArrowLeftRight, TrendingUp, Shield, Clock,
  UserCog, ClipboardCheck, MapPin, FileText, BookOpen, CalendarDays,
} from 'lucide-react';

const StatCard = ({
  icon: Icon, label, value, color, sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color} shrink-0`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-gray-500 text-xs md:text-sm truncate">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// Horizontal bar row used in breakdown sections
const BarRow = ({
  label, count, total, color = 'bg-amber-500',
}: {
  label: string; count: number; total: number; color?: string;
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-40 shrink-0 truncate" title={label}>{label || 'Unknown'}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-700 w-10 text-right">{count}</span>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
};

const HRDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardSummary(user?.id);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Layout><DashboardSkeleton /></Layout>;

  const pendingTransfers   = data?.transfers.find(t => t.status === 'pending')?.count ?? '0';
  const pendingPromotions  = data?.promotions.find(p => p.status === 'pending')?.count ?? '0';
  const verifiedCredentials = data?.credentials.find(c => c.verification_status === 'verified')?.count ?? '0';

  const totalTeachers = data?.summary.total_teachers ?? 0;
  const region        = data?.summary.region;

  const gradeTotal = (data?.teachers_by_grade ?? []).reduce((s, r) => s + parseInt(r.count), 0);
  const qualTotal  = (data?.teachers_by_qualification ?? []).reduce((s, r) => s + parseInt(r.count), 0);

  const credTotal = (data?.credentials ?? []).reduce((s, r) => s + parseInt(r.count), 0);

  const credColors: Record<string, string> = {
    verified: 'bg-green-500',
    unverified: 'bg-gray-400',
    failed: 'bg-red-500',
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                Welcome, {user?.name || user?.email}
              </h2>
              <p className="text-slate-300 mt-1 text-sm">
                {isAdmin
                  ? 'System-wide overview — all regions'
                  : 'Manage teacher records, transfers, promotions and credentials'}
              </p>
            </div>
            {!isAdmin && region && (
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-lg px-4 py-2 self-start sm:self-auto">
                <MapPin size={16} className="text-amber-300 shrink-0" />
                <div>
                  <p className="text-xs text-amber-300">Your Region</p>
                  <p className="font-semibold text-amber-100 text-sm">{region}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Key stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={Users}
            label={isAdmin ? 'Total Teachers' : `Teachers in ${region ?? 'Region'}`}
            value={totalTeachers}
            color="bg-amber-500"
          />
          {isAdmin && (
            <StatCard
              icon={UserCog}
              label="Total HR Officers"
              value={data?.summary.total_hr_officers ?? 0}
              color="bg-blue-500"
            />
          )}
          {isAdmin && (
            <StatCard
              icon={ClipboardCheck}
              label="Total Examiners"
              value={data?.summary.total_examiners ?? 0}
              color="bg-indigo-500"
            />
          )}
          <StatCard
            icon={FileText}
            label="Total Applications"
            value={data?.summary.total_applications ?? 0}
            color="bg-slate-500"
            sub={`${data?.summary.recent_applications_7days ?? 0} in last 7 days`}
          />
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
          {!isAdmin && (
            <StatCard
              icon={CalendarDays}
              label="Recent Activity"
              value={data?.summary.recent_applications_7days ?? 0}
              color="bg-teal-500"
              sub="Applications last 7 days"
            />
          )}
        </div>

        {/* ── Transfer + Promotion status charts ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-amber-600" />
              Transfer Applications
              {!isAdmin && <span className="ml-auto text-xs text-gray-400 font-normal">to {region}</span>}
            </h3>
            {(data?.transfers?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No transfer data</p>
            ) : (
              <div className="space-y-3">
                {data?.transfers.map((t) => (
                  <BarRow
                    key={t.status}
                    label={t.status.replace(/_/g, ' ')}
                    count={parseInt(t.count)}
                    total={data.transfers.reduce((a, b) => a + parseInt(b.count), 0)}
                    color="bg-amber-500"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-600" />
              Promotion Applications
              {!isAdmin && <span className="ml-auto text-xs text-gray-400 font-normal">{region}</span>}
            </h3>
            {(data?.promotions?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No promotion data</p>
            ) : (
              <div className="space-y-3">
                {data?.promotions.map((p) => (
                  <BarRow
                    key={p.status}
                    label={p.status.replace(/_/g, ' ')}
                    count={parseInt(p.count)}
                    total={data.promotions.reduce((a, b) => a + parseInt(b.count), 0)}
                    color="bg-purple-500"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Regional breakdown (HR) / Region overview (Admin) ──────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Teachers by Grade */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Teachers by Grade
              {!isAdmin && <span className="ml-auto text-xs text-gray-400 font-normal">{region}</span>}
            </h3>
            {(data?.teachers_by_grade?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No grade data</p>
            ) : (
              <div className="space-y-3">
                {data?.teachers_by_grade.map((g) => (
                  <BarRow
                    key={g.current_grade}
                    label={g.current_grade || 'Ungraded'}
                    count={parseInt(g.count)}
                    total={gradeTotal}
                    color="bg-blue-500"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Teachers by Qualification */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              Teachers by Qualification
              {!isAdmin && <span className="ml-auto text-xs text-gray-400 font-normal">{region}</span>}
            </h3>
            {(data?.teachers_by_qualification?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No qualification data</p>
            ) : (
              <div className="space-y-3">
                {data?.teachers_by_qualification.map((q) => (
                  <BarRow
                    key={q.qualification}
                    label={q.qualification}
                    count={parseInt(q.count)}
                    total={qualTotal}
                    color="bg-indigo-500"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Credentials status + Districts ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Credential status */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-green-600" />
              Credential Verification
              {!isAdmin && <span className="ml-auto text-xs text-gray-400 font-normal">{region}</span>}
            </h3>
            {(data?.credentials?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No credential data</p>
            ) : (
              <div className="space-y-3">
                {data?.credentials.map((c) => (
                  <BarRow
                    key={c.verification_status}
                    label={c.verification_status.charAt(0).toUpperCase() + c.verification_status.slice(1)}
                    count={parseInt(c.count)}
                    total={credTotal}
                    color={credColors[c.verification_status] ?? 'bg-gray-400'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Teachers by District */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-amber-600" />
              {isAdmin ? 'Top Districts' : `Districts in ${region ?? 'Region'}`}
            </h3>
            {(data?.teachers_by_district?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No district data</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {data?.teachers_by_district.map((d) => (
                  <div key={d.current_district}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600 truncate" title={d.current_district}>
                      {d.current_district}
                    </span>
                    <span className="font-bold text-amber-700 shrink-0 ml-2">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── All-regions breakdown (admin only) ────────────────────────── */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-amber-600" />
              Teachers by Region
            </h3>
            {(data?.teachers_by_region?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No data</p>
            ) : (
              <div className="space-y-3">
                {data?.teachers_by_region.map((r) => (
                  <BarRow
                    key={r.current_region}
                    label={r.current_region || 'Unknown'}
                    count={parseInt(r.count)}
                    total={totalTeachers}
                    color="bg-amber-500"
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default HRDashboard;
