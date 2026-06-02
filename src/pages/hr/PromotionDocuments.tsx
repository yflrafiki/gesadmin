import { useState, useEffect } from 'react';
import { getPromotionDocuments, reviewPromotionDocument } from '../../api/promotions';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, AlertTriangle, Eye, X,
  FileText, User, BookOpen
} from 'lucide-react';

const PromotionDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [hrNotes, setHrNotes] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchDocuments = async () => {
    try {
      const res = await getPromotionDocuments();
      setDocuments(res.data.documents);
    } catch (err) {
      toast.error('Failed to load promotion documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleReview = async (decision: string) => {
    if (!selected) return;
    setReviewing(true);
    try {
      await reviewPromotionDocument(selected.id, {
        decision,
        hr_notes: hrNotes
      });
      toast.success(`Document ${decision}. ${decision === 'approved' ? 'Exam access granted!' : ''}`);
      setSelected(null);
      setHrNotes('');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewing(false);
    }
  };

  const parseValidation = (doc: any) => {
    if (!doc.ocr_validation) return null;
    try { return JSON.parse(doc.ocr_validation); } catch { return null; }
  };

  const filtered = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'auto_approved') return doc.hr_decision === 'approved' && !doc.hr_reviewed;
    if (filter === 'needs_review') return doc.hr_decision === 'manual_review' && !doc.hr_reviewed;
    if (filter === 'reviewed') return doc.hr_reviewed;
    return true;
  });

  if (loading) return <Layout><Spinner /></Layout>;

  const autoApproved = documents.filter(d => d.hr_decision === 'approved' && !d.hr_reviewed).length;
  const needsReview = documents.filter(d => d.hr_decision === 'manual_review' && !d.hr_reviewed).length;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Promotion Documents</h2>
          <p className="text-gray-500 text-sm">
            Review teacher documents submitted for promotion — OCR validated
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{autoApproved}</p>
            <p className="text-xs text-green-600 mt-1">Auto Approved by OCR</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{needsReview}</p>
            <p className="text-xs text-yellow-600 mt-1">Needs Manual Review</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {documents.filter(d => d.exam_access_granted).length}
            </p>
            <p className="text-xs text-blue-600 mt-1">Exam Access Granted</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'auto_approved', label: 'Auto Approved' },
            { key: 'needs_review', label: 'Needs Review' },
            { key: 'reviewed', label: 'Reviewed' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === key
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Documents List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => {
              const isAutoApproved = doc.hr_decision === 'approved' && !doc.hr_reviewed;
              const needsManualReview = doc.hr_decision === 'manual_review' && !doc.hr_reviewed;

              return (
                <div key={doc.id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
                  doc.exam_access_granted ? 'border-green-500' :
                  needsManualReview ? 'border-yellow-500' :
                  isAutoApproved ? 'border-blue-500' :
                  'border-gray-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">

                      {/* Teacher Info */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <User size={16} className="text-blue-600" />
                        <span className="font-semibold text-gray-800">
                          {doc.first_name} {doc.last_name}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{doc.staff_id}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {doc.current_grade}
                        </span>
                      </div>

                      {/* Document Name */}
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{doc.file_name}</span>
                      </div>

                      {/* OCR Validation Result */}
                      <div className="flex flex-wrap gap-3">
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          doc.ocr_name_match ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {doc.ocr_name_match
                            ? <CheckCircle size={14} />
                            : <XCircle size={14} />
                          }
                          Name {doc.ocr_name_match ? 'Matched' : 'Not Matched'}
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          doc.ocr_staff_id_match ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {doc.ocr_staff_id_match
                            ? <CheckCircle size={14} />
                            : <XCircle size={14} />
                          }
                          Staff ID {doc.ocr_staff_id_match ? 'Matched' : 'Not Matched'}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-wrap gap-2">
                        {isAutoApproved && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            ✓ Auto-approved by OCR — Pending HR confirmation
                          </span>
                        )}
                        {needsManualReview && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Needs Manual Review
                          </span>
                        )}
                        {doc.hr_reviewed && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            doc.exam_access_granted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {doc.exam_access_granted
                              ? '✓ Exam Access Granted'
                              : '✗ Exam Access Denied'
                            }
                          </span>
                        )}
                        {doc.hr_notes && (
                          <span className="text-xs text-gray-500 italic">
                            HR: {doc.hr_notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!doc.hr_reviewed && (
                      <button
                        onClick={() => { setSelected(doc); setHrNotes(''); }}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition w-fit shrink-0"
                      >
                        <Eye size={14} />
                        Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <h3 className="font-bold text-gray-800">
                  Review Promotion Document
                </h3>
                <button onClick={() => setSelected(null)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-4">

                {/* Teacher Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="text-gray-500">Teacher:</span> <strong>{selected.first_name} {selected.last_name}</strong></p>
                  <p><span className="text-gray-500">Staff ID:</span> <strong>{selected.staff_id}</strong></p>
                  <p><span className="text-gray-500">Current Grade:</span> <strong>{selected.current_grade}</strong></p>
                  <p><span className="text-gray-500">Years of Service:</span> <strong>{selected.years_of_service}</strong></p>
                  <p><span className="text-gray-500">Qualification:</span> <strong>{selected.qualification}</strong></p>
                  <p><span className="text-gray-500">Document:</span> <strong>{selected.file_name}</strong></p>
                </div>

                {/* OCR Results */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm">OCR Validation Results</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-lg p-3 text-center ${
                      selected.ocr_name_match ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {selected.ocr_name_match
                        ? <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                        : <XCircle size={20} className="text-red-500 mx-auto mb-1" />
                      }
                      <p className={`text-xs font-medium ${selected.ocr_name_match ? 'text-green-700' : 'text-red-600'}`}>
                        Name {selected.ocr_name_match ? 'Matched' : 'Did Not Match'}
                      </p>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${
                      selected.ocr_staff_id_match ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {selected.ocr_staff_id_match
                        ? <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                        : <XCircle size={20} className="text-red-500 mx-auto mb-1" />
                      }
                      <p className={`text-xs font-medium ${selected.ocr_staff_id_match ? 'text-green-700' : 'text-red-600'}`}>
                        Staff ID {selected.ocr_staff_id_match ? 'Matched' : 'Did Not Match'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* OCR Details */}
                {(() => {
                  const val = parseValidation(selected);
                  if (!val?.details) return null;
                  return (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">OCR Details:</p>
                      {val.details.map((d: string, i: number) => (
                        <p key={i} className="text-xs text-gray-600">{d}</p>
                      ))}
                      {val.parsedFields?.institution && (
                        <p className="text-xs text-gray-500 mt-1">
                          Institution found: {val.parsedFields.institution}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* OCR Text Preview */}
                {selected.ocr_extracted_text && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Extracted Text Preview:</p>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                        {selected.ocr_extracted_text.substring(0, 500)}
                        {selected.ocr_extracted_text.length > 500 ? '...' : ''}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Auto Decision Info */}
                <div className={`rounded-lg p-3 text-sm ${
                  selected.hr_decision === 'approved'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                }`}>
                  <p className="font-medium">
                    OCR Auto-Decision: <strong>{selected.hr_decision === 'approved' ? 'APPROVED' : 'MANUAL REVIEW REQUIRED'}</strong>
                  </p>
                  <p className="text-xs mt-1">
                    {selected.hr_decision === 'approved'
                      ? 'Both name and staff ID matched. You can approve exam access.'
                      : 'Name or staff ID did not match. Please review the document manually before granting exam access.'
                    }
                  </p>
                </div>

                {/* HR Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HR Notes (optional)
                  </label>
                  <textarea
                    value={hrNotes}
                    onChange={(e) => setHrNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Add notes for this decision..."
                  />
                </div>
              </div>

              {/* Decision Buttons */}
              <div className="px-6 pb-6 flex gap-3 shrink-0 border-t pt-4">
                <button
                  onClick={() => handleReview('rejected')}
                  disabled={reviewing}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject — Deny Exam Access
                </button>
                <button
                  onClick={() => handleReview('manual_review')}
                  disabled={reviewing}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg text-sm disabled:opacity-50"
                >
                  <AlertTriangle size={16} />
                  Flag for Further Review
                </button>
                <button
                  onClick={() => handleReview('approved')}
                  disabled={reviewing}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-50"
                >
                  <BookOpen size={16} />
                  Approve — Grant Exam Access
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PromotionDocuments;