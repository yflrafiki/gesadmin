import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsersByRole } from '../../api/auth';
import Layout from '../../components/layout/Layout';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { ClipboardCheck, Search, X, UserPlus } from 'lucide-react';

interface ExaminerUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const Examiners = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ExaminerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await getUsersByRole({ role: 'examiner' });
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load examiners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Layout><TableSkeleton /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Examiners</h2>
            <p className="text-gray-500 text-sm">
              All examiner accounts — {users.length} total
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/examiners/add')}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition w-fit"
          >
            <UserPlus size={16} />
            Add Examiner
          </button>
        </div>

        {/* Search */}
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

          {search && (
            <button
              onClick={() => setSearch('')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <ClipboardCheck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No examiners found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Examiner" to create one</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Email', 'Created'].map((h) => (
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

export default Examiners;
