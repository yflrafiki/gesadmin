import { useState, useEffect } from 'react';
import { getAllChangeRequests, reviewChangeRequest } from '../../api/changeRequests';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { Check, X, Clock } from 'lucide-react';
import type { ChangeRequest } from '../../types';

const ChangeRequests = () => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await getAllChangeRequests({ status: statusFilter || undefined });
      setRequests(res.data.requests);
    } catch (err) {
      toast.error('Failed to load change requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    const hr_notes = window.prompt(`Optional note for this ${status === 'approved' ? 'approval' : 'rejection'}:`) || undefined;
    setActingOn(id);
    try {
      await reviewChangeRequest(id, { status, hr_notes });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to review request');
    } finally {
      setActingOn(null);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Change Requests</h2>
            <p className="text-gray-500 text-sm">Teacher-submitted edits awaiting your approval</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Teacher', 'Field', 'Current → Requested', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No change requests found</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.first_name} {r.last_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{r.staff_id}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{r.field_name.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-gray-600">
                        "{r.current_value || '—'}" → "{r.requested_value}"
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{r.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          r.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {r.status === 'pending' && <Clock size={12} />}
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(r.id, 'approved')}
                              disabled={actingOn === r.id}
                              className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReview(r.id, 'rejected')}
                              disabled={actingOn === r.id}
                              className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
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

export default ChangeRequests;
