import { useState, useEffect } from 'react';
import { getUsersByRole } from '../../api/auth';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { UserCog, Search, X } from 'lucide-react';
import { REGIONS } from '../../constants/teacherOptions';

interface HrUser {
  id: string;
  email: string;
  role: string;
  region: string | null;
  district: string | null;
  created_at: string;
}

const HrOfficers = () => {
  const [users, setUsers] = useState<HrUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await getUsersByRole({ role: 'hr_officer', region: region || undefined });
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load HR officers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [region]);

  const filtered = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">HR Officers</h2>
          <p className="text-gray-500 text-sm">
            All HR officer accounts — {users.length} total{region ? ` in ${region}` : ''}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {(search || region) && (
            <button
              onClick={() => { setSearch(''); setRegion(''); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <UserCog size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No HR officers found</p>
            <p className="text-gray-400 text-sm mt-1">
              {region ? `No HR officers assigned to ${region}` : 'Create one from "Add Account"'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Email', 'Region', 'District', 'Created'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.region || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.district || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HrOfficers;
