import { useState, useEffect } from 'react';
import { getAuditLog } from '../../api/reports';
import Layout from '../../components/layout/Layout';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { FileText, Search } from 'lucide-react';

const actionColors: Record<string, string> = {
  LOGIN: 'bg-amber-100 text-amber-700',
  REGISTER: 'bg-green-100 text-green-700',
  UPDATE_PROFILE: 'bg-yellow-100 text-yellow-700',
  CREATE_TRANSFER: 'bg-purple-100 text-purple-700',
  REVIEW_TRANSFER: 'bg-orange-100 text-orange-700',
  CREATE_PROMOTION: 'bg-pink-100 text-pink-700',
  REVIEW_PROMOTION: 'bg-red-100 text-red-700',
  BLOCKCHAIN_VERIFY: 'bg-teal-100 text-teal-700',
  UPDATE_TEACHER: 'bg-indigo-100 text-indigo-700',
};

const AuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAuditLog();
        setLogs(res.data.logs);
      } catch (err) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = logs.filter(log =>
    log.email?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.details?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout><TableSkeleton /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Audit Logs</h2>
            <p className="text-gray-500 text-sm">Complete record of all system actions</p>
          </div>
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
            />
          </div>
        </div>

        {/* Logs */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Action', 'User', 'Role', 'Details', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          actionColors[log.action] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{log.email}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">
                        {log.role?.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{log.details}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
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

export default AuditLog;