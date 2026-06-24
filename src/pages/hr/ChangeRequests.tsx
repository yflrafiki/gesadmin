import { useState, useEffect } from 'react';
import { getAllChangeRequests, reviewChangeRequest, getChangeRequestDocument } from '../../api/changeRequests';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { Check, X, Clock, Eye, FileText } from 'lucide-react';
import type { ChangeRequest } from '../../types';

const ChangeRequests = () => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [selected, setSelected] = useState<ChangeRequest | null>(null);
  const [hrNotes, setHrNotes] = useState('');
  const [docLoading, setDocLoading] = useState(false);

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

  const openReview = (r: ChangeRequest) => {
    setSelected(r);
    setHrNotes('');
  };

  const handleViewDocument = async (id: string) => {
    setDocLoading(true);
    try {
      const res = await getChangeRequestDocument(id);
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch (err: any) {
      toast.error('Failed to load document');
    } finally {
      setDocLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    setActingOn(selected.id);
    try {
      await reviewChangeRequest(selected.id, { status, hr_notes: hrNotes || undefined });
      toast.success(`Request ${status}`);
      setSelected(null);
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
            <p className="text-gray-500 text-sm">Teacher-submitted edits, each backed by a supporting document</p>
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
                  {['Teacher', 'Field', 'Current → Requested', 'Document', 'Status', 'Actions'].map(h => (
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
                      <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate">
                        "{r.current_value || '—'}" → "{r.requested_value}"
                      </td>
                      <td className="px-4 py-3">
                        {r.document_name ? (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <FileText size={12} /> attached
                          </span>
                        ) : '—'}
                      </td>
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
                        <button
                          onClick={() => openReview(r)}
                          className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye size={14} /> {r.status === 'pending' ? 'Review' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <h3 className="font-bold text-gray-800">Change Request Details</h3>
                <button onClick={() => setSelected(null)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Teacher</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selected.first_name} {selected.last_name} · <span className="font-mono text-xs">{selected.staff_id}</span>
                  </p>
                  {selected.current_region && (
                    <p className="text-xs text-gray-400 mt-0.5">{selected.current_region} · {selected.current_district}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Field</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">{selected.field_name.replace(/_/g, ' ')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Current Value</p>
                    <p className="text-sm text-gray-700">{selected.current_value || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Requested Value</p>
                    <p className="text-sm font-medium text-gray-800">{selected.requested_value}</p>
                  </div>
                </div>

                {selected.reason && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Reason given by teacher</p>
                    <p className="text-sm text-gray-700">{selected.reason}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400 mb-1">Supporting Document</p>
                  {selected.document_name ? (
                    <button
                      onClick={() => handleViewDocument(selected.id)}
                      disabled={docLoading}
                      className="flex items-center gap-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      <FileText size={16} />
                      {docLoading ? 'Loading...' : selected.document_name}
                    </button>
                  ) : (
                    <p className="text-sm text-red-500">No document attached</p>
                  )}
                </div>

                {selected.hr_notes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Previous HR notes</p>
                    <p className="text-sm text-gray-700">{selected.hr_notes}</p>
                  </div>
                )}

                {selected.status === 'pending' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Note (optional, shown to teacher)</label>
                    <textarea
                      value={hrNotes}
                      onChange={(e) => setHrNotes(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Optional note for the teacher"
                    />
                  </div>
                )}
              </div>

              {selected.status === 'pending' && (
                <div className="px-6 py-4 border-t shrink-0 flex gap-3">
                  <button
                    onClick={() => handleReview('rejected')}
                    disabled={actingOn === selected.id}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    <X size={16} /> Reject
                  </button>
                  <button
                    onClick={() => handleReview('approved')}
                    disabled={actingOn === selected.id}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    <Check size={16} /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChangeRequests;
