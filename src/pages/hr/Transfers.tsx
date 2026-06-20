import { useState, useEffect } from 'react';
import { getAllTransfers, reviewTransfer } from '../../api/transfers';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { type Application } from '../../types/index';
import toast from 'react-hot-toast';
import { ArrowLeftRight, CheckCircle, XCircle, Info, X } from 'lucide-react';

const Transfers = () => {
  const [transfers, setTransfers] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Application | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [form, setForm] = useState({ status: '', hr_notes: '' });

  const fetchTransfers = async () => {
    try {
      const res = await getAllTransfers(filter ? { status: filter } : {});
      setTransfers(res.data.applications);
    } catch (err) {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, [filter]);

  const handleReview = async () => {
    if (!selected || !form.status) return;
    setReviewing(true);
    try {
      await reviewTransfer(selected.id, form);
      toast.success(`Application ${form.status} successfully`);
      setSelected(null);
      setForm({ status: '', hr_notes: '' });
      fetchTransfers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Transfer Applications</h2>
            <p className="text-gray-500 text-sm">Review and manage transfer requests</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-fit"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="more_info">More Info</option>
          </select>
        </div>

        {/* List */}
        {transfers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <ArrowLeftRight size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No transfer applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((app) => (
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
                    From: <strong>{app.current_district}</strong> →
                    To: <strong>{app.requested_district}, {app.requested_region}</strong>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                {app.status === 'pending' && (
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
                <h3 className="font-bold text-gray-800">Review Transfer Application</h3>
                <button onClick={() => setSelected(null)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* Application Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <p><span className="text-gray-500">Teacher:</span> <strong>{selected.first_name} {selected.last_name}</strong></p>
                <p><span className="text-gray-500">From:</span> <strong>{selected.current_district}, {selected.current_region}</strong></p>
                <p><span className="text-gray-500">To:</span> <strong>{selected.requested_district}, {selected.requested_region}</strong></p>
                <p><span className="text-gray-500">Reason:</span> {selected.reason}</p>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decision
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HR Notes
                  </label>
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
      </div>
    </Layout>
  );
};

export default Transfers;