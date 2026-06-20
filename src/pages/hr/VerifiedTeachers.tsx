import { useState, useEffect } from 'react';
import { getVerifiedTeachers } from '../../api/credentials';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ShieldCheck, Search, FileText, Hash } from 'lucide-react';

interface VerifiedTeacherRow {
  teacher_id: string;
  first_name: string;
  last_name: string;
  staff_id: string;
  current_school: string | null;
  current_district: string | null;
  current_region: string | null;
  document_id: string;
  file_name: string;
  uploaded_at: string;
  verification_status: string;
  verified_at: string;
  blockchain_tx_id: string | null;
  document_hash: string;
}

const VerifiedTeachers = () => {
  const [rows, setRows] = useState<VerifiedTeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getVerifiedTeachers();
        setRows(res.data.teachers);
      } catch (err) {
        toast.error('Failed to load verified teachers');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.staff_id.toLowerCase().includes(q)
    );
  });

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Verified Teachers</h2>
          <p className="text-gray-500 text-sm">
            Teachers whose uploaded documents have been automatically verified — anchored on
            the blockchain and matched against their profile. Nothing for HR to upload or review here.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or staff ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <ShieldCheck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No verified teachers yet</p>
            <p className="text-gray-400 text-sm mt-1">
              This list fills in automatically as teachers upload documents
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.document_id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ShieldCheck size={16} className="text-green-500" />
                      <span className="font-semibold text-gray-800">{r.first_name} {r.last_name}</span>
                      <span className="text-xs font-mono text-gray-400">{r.staff_id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                        Verified
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText size={12} className="text-gray-400" />
                        {r.file_name}
                      </span>
                      {r.current_school && <span>School: <strong>{r.current_school}</strong></span>}
                      {r.current_region && <span>Region: <strong>{r.current_region}</strong></span>}
                    </div>
                    {r.blockchain_tx_id && (
                      <div className="flex items-center gap-2">
                        <Hash size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-400">TX:</p>
                        <p className="text-xs font-mono text-gray-600 truncate max-w-xs">
                          {r.blockchain_tx_id}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Verified: {new Date(r.verified_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifiedTeachers;
