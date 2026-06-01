import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import {
  Shield, Upload, CheckCircle, X,
  Search, FileText, Hash
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'degree', label: 'University Degree (GTEC)', org: 'GTECMSP' },
  { value: 'diploma', label: 'Diploma Certificate (GTEC)', org: 'GTECMSP' },
  { value: 'teaching_license', label: 'Teaching License (NTC)', org: 'NTCMSP' },
  { value: 'ntc_certificate', label: 'NTC Certificate (NTC)', org: 'NTCMSP' },
  { value: 'appointment_letter', label: 'Appointment Letter (GES)', org: 'GESMSP' },
  { value: 'service_record', label: 'Service Record (GES)', org: 'GESMSP' },
];

const BlockchainReferences = () => {
  const [references, setReferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchStaffId, setSearchStaffId] = useState('');
  const [form, setForm] = useState({
    staff_id: '',
    teacher_name: '',
    document_type: '',
    issued_by: '',
    issued_date: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchReferences = async (staffId = '') => {
    try {
      const url = staffId
        ? `/blockchain/references?staff_id=${staffId}`
        : '/blockchain/references';
      const res = await API.get(url);
      setReferences(res.data.references);
    } catch (err) {
      toast.error('Failed to load blockchain references');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReferences(); }, []);

  const handleUpload = async () => {
    if (!file || !form.staff_id || !form.teacher_name || !form.document_type) {
      toast.error('Please fill all required fields and select a file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const res = await API.post('/blockchain/upload-reference', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document anchored to blockchain successfully!');
      setShowForm(false);
      setFile(null);
      setForm({ staff_id: '', teacher_name: '', document_type: '', issued_by: '', issued_date: '' });
      fetchReferences();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getOrgColor = (org: string) => {
    if (org === 'GTECMSP') return 'bg-green-100 text-green-700';
    if (org === 'NTCMSP') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Blockchain Reference Documents
            </h2>
            <p className="text-gray-500 text-sm">
              Upload official documents to the blockchain for teacher credential verification
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition w-fit"
          >
            <Upload size={16} />
            Upload Reference Document
          </button>
        </div>

        {/* How it works */}
        <div className="bg-blue-900 text-white rounded-xl p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Shield size={20} />
            How Blockchain Reference Verification Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-800 rounded-lg p-3">
              <p className="font-semibold text-blue-200 mb-1">1. Upload Reference</p>
              <p className="text-blue-100 text-xs">
                HR/Admin uploads official documents (degrees, licenses) for each teacher.
                Each document is hashed and anchored across GES, GTEC and NTC nodes.
              </p>
            </div>
            <div className="bg-blue-800 rounded-lg p-3">
              <p className="font-semibold text-blue-200 mb-1">2. Teacher Uploads Document</p>
              <p className="text-blue-100 text-xs">
                When a teacher uploads their certificate, OCR extracts their name and staff ID
                from the document automatically.
              </p>
            </div>
            <div className="bg-blue-800 rounded-lg p-3">
              <p className="font-semibold text-blue-200 mb-1">3. Blockchain Verification</p>
              <p className="text-blue-100 text-xs">
                The system checks the blockchain ledger — if name, staff ID and document hash
                match the reference, the credential is verified as authentic.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchStaffId}
              onChange={(e) => setSearchStaffId(e.target.value)}
              placeholder="Search by Staff ID..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => fetchReferences(searchStaffId)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
          >
            Search
          </button>
          {searchStaffId && (
            <button
              onClick={() => { setSearchStaffId(''); fetchReferences(''); }}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* References List */}
        {references.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Shield size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No reference documents on blockchain</p>
            <p className="text-gray-400 text-sm mt-1">
              Upload official documents to start verifying teacher credentials
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {references.map((ref) => (
              <div key={ref.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="font-semibold text-gray-800">{ref.teacher_name}</span>
                      <span className="text-xs font-mono text-gray-400">{ref.staff_id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrgColor(ref.org_msp)}`}>
                        {ref.org_msp}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        Type: <strong>
                          {DOCUMENT_TYPES.find(d => d.value === ref.document_type)?.label || ref.document_type}
                        </strong>
                      </span>
                      {ref.issued_by && <span>Issued by: <strong>{ref.issued_by}</strong></span>}
                      {ref.issued_date && (
                        <span>Date: <strong>{ref.issued_date.split('T')[0]}</strong></span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Hash size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-400">Document Hash:</p>
                        <p className="text-xs font-mono text-gray-600 truncate max-w-xs">
                          {ref.document_hash}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-400">TX ID:</p>
                        <p className="text-xs font-mono text-gray-600 truncate max-w-xs">
                          {ref.blockchain_tx_id}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(ref.created_at).toLocaleString()} by {ref.uploaded_by_email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800">
                  Upload Reference Document to Blockchain
                </h3>
                <button onClick={() => setShowForm(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.staff_id}
                      onChange={(e) => setForm({ ...form, staff_id: e.target.value.toUpperCase() })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. GES001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.teacher_name}
                      onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Kwame Mensah"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.document_type}
                    onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select document type...</option>
                    {DOCUMENT_TYPES.map(d => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  {form.document_type && (
                    <p className="text-xs text-gray-500 mt-1">
                      Will be anchored by:{' '}
                      <strong>
                        {DOCUMENT_TYPES.find(d => d.value === form.document_type)?.org}
                      </strong>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issued By
                    </label>
                    <input
                      type="text"
                      value={form.issued_by}
                      onChange={(e) => setForm({ ...form, issued_by: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. UMaT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={form.issued_date}
                      onChange={(e) => setForm({ ...form, issued_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document File <span className="text-red-500">*</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition ${
                    file
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400'
                  }`}>
                    <Upload size={16} />
                    {file ? file.name : 'Click to select document (JPG, PNG, PDF, DOCX)'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.docx,.doc"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    {uploading ? 'Anchoring to Blockchain...' : 'Upload & Anchor'}
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

export default BlockchainReferences;