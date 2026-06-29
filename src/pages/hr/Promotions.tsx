import { useState, useEffect } from 'react';
import { getAllPromotions, reviewPromotion } from '../../api/promotions';
import Layout from '../../components/layout/Layout';
import { TableSkeleton } from '../../components/common/Skeleton';
import Badge from '../../components/common/Badge';
import { type Application } from '../../types/index';
import toast from 'react-hot-toast';
import { TrendingUp, CheckCircle, XCircle, Info, X, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Promotions = () => {
  const { user } = useAuth();
  // Approving/rejecting is an HR-only decision — admins get a read-only view
  // of the same applications (who applied, who decided, and what they
  // decided), enforced again server-side on the review endpoint itself.
  const isAdmin = user?.role === 'admin';
  const [promotions, setPromotions] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Application | null>(null);
  const [viewing, setViewing] = useState<Application | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [form, setForm] = useState({ status: '', hr_notes: '' });

  const fetchPromotions = async () => {
    try {
      const res = await getAllPromotions(filter ? { status: filter } : {});
      setPromotions(res.data.applications);
    } catch (err) {
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, [filter]);

  const handleReview = async () => {
    if (!selected || !form.status) return;
    setReviewing(true);
    try {
      await reviewPromotion(selected.id, form);
      toast.success(`Application ${form.status} successfully`);
      setSelected(null);
      setForm({ status: '', hr_notes: '' });
      fetchPromotions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <Layout><TableSkeleton /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Promotion Applications</h2>
            <p className="text-gray-500 text-sm">Review and manage promotion requests</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-fit"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* List */}
        {promotions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <TrendingUp size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No promotion applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map((app) => (
              <div key={app.id}
                className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">
                      {app.first_name} {app.last_name}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{app.staff_id}</span>
                    <Badge status={app.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Current Grade: <strong>{app.current_grade}</strong> —
                    Years: <strong>{app.years_of_service}</strong> —
                    Qualification: <strong>{app.qualification}</strong>
                  </p>
                  <p className="text-sm text-gray-500 italic">{app.reason}</p>
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(app.created_at).toLocaleString()}
                  </p>
                  {app.reviewed_at && (
                    <p className="text-xs text-gray-400">
                      {app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Reviewed'}: {new Date(app.reviewed_at).toLocaleString()}
                      {app.reviewed_by_email ? ` by ${app.reviewed_by_email}` : ''}
                    </p>
                  )}
                </div>
                {isAdmin ? (
                  <button
                    onClick={() => setViewing(app)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition w-fit shrink-0"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                ) : app.status === 'pending' && (
                  <button
                    onClick={() => setSelected(app)}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition w-fit shrink-0"
                  >
                    Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800">Review Promotion Application</h3>
                <button onClick={() => setSelected(null)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <p><span className="text-gray-500">Teacher:</span> <strong>{selected.first_name} {selected.last_name}</strong></p>
                <p><span className="text-gray-500">Current Grade:</span> <strong>{selected.current_grade}</strong></p>
                <p><span className="text-gray-500">Years of Service:</span> <strong>{selected.years_of_service}</strong></p>
                <p><span className="text-gray-500">Qualification:</span> <strong>{selected.qualification}</strong></p>
                <p><span className="text-gray-500">Reason:</span> {selected.reason}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: 'approved', label: 'Approve', icon: CheckCircle, color: 'border-green-500 bg-green-50 text-green-700' },
                      { value: 'rejected', label: 'Reject', icon: XCircle, color: 'border-red-500 bg-red-50 text-red-700' },
                      { value: 'more_info', label: 'More Info', icon: Info, color: 'border-blue-500 bg-blue-50 text-blue-700' },
                    ].map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setForm({ ...form, status: value })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition ${
                          form.status === value ? color : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HR Notes</label>
                  <textarea
                    value={form.hr_notes}
                    onChange={(e) => setForm({ ...form, hr_notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Add notes for the teacher..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={!form.status || reviewing}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    {reviewing ? 'Submitting...' : 'Submit Decision'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal — admin's read-only counterpart to the Review
            modal above. Same information, no decision controls. */}
        {viewing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800">Promotion Application Details</h3>
                <button onClick={() => setViewing(null)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="text-gray-500">Teacher:</span> <strong>{viewing.first_name} {viewing.last_name}</strong> <span className="text-gray-400 font-mono text-xs">({viewing.staff_id})</span></p>
                <p><span className="text-gray-500">Current Grade:</span> <strong>{viewing.current_grade}</strong></p>
                <p><span className="text-gray-500">Years of Service:</span> <strong>{viewing.years_of_service}</strong></p>
                <p><span className="text-gray-500">Qualification:</span> <strong>{viewing.qualification}</strong></p>
                <p><span className="text-gray-500">Reason:</span> {viewing.reason || '—'}</p>
                <p><span className="text-gray-500">Submitted:</span> {new Date(viewing.created_at).toLocaleString()}</p>
              </div>

              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Decision:</span>
                  <Badge status={viewing.status} />
                </div>
                {viewing.reviewed_by_email && (
                  <p><span className="text-gray-500">Reviewed by:</span> {viewing.reviewed_by_email}</p>
                )}
                {viewing.reviewed_at && (
                  <p><span className="text-gray-500">Reviewed on:</span> {new Date(viewing.reviewed_at).toLocaleString()}</p>
                )}
                {viewing.hr_notes && (
                  <p><span className="text-gray-500">HR Notes:</span> {viewing.hr_notes}</p>
                )}
                {viewing.status === 'pending' && (
                  <p className="text-amber-600">Awaiting HR review.</p>
                )}
              </div>

              <div className="flex justify-end pt-5">
                <button
                  onClick={() => setViewing(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Promotions;