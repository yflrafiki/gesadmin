import { useState, useEffect } from 'react';
import { verifyByTxId } from '../../api/credentials';
import Layout from '../../components/layout/Layout';
import { CardListSkeleton } from '../../components/common/Skeleton';
import Badge from '../../components/common/Badge';
import { type Credential } from '../../types/index';
import toast from 'react-hot-toast';
import { Shield, Search, CheckCircle, XCircle, Copy } from 'lucide-react';
import API from '../../api/axios';

const Credentials = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [txId, setTxId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/reports/credentials');
        setCredentials(res.data.credentials);
      } catch (err) {
        toast.error('Failed to load credentials');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleVerify = async () => {
    if (!txId.trim()) return;
    setVerifying(true);
    try {
      const res = await verifyByTxId(txId.trim());
      setVerifyResult(res.data);
    } catch (err: any) {
      setVerifyResult({ verified: false, message: 'Credential not found' });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  if (loading) return <Layout><CardListSkeleton /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Credential Verification</h2>
          <p className="text-gray-500 text-sm">Verify teacher credentials on the blockchain</p>
        </div>

        {/* Verify by TX ID */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Verify by Transaction ID</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Enter blockchain transaction ID..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleVerify}
              disabled={verifying || !txId.trim()}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              <Search size={16} />
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {/* Verify Result */}
          {verifyResult && (
            <div className={`mt-4 rounded-lg p-4 ${
              verifyResult.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {verifyResult.verified
                  ? <CheckCircle size={18} className="text-green-600" />
                  : <XCircle size={18} className="text-red-500" />
                }
                <span className={`font-semibold text-sm ${
                  verifyResult.verified ? 'text-green-700' : 'text-red-600'
                }`}>
                  {verifyResult.message}
                </span>
              </div>
              {verifyResult.verified && verifyResult.credential && (
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Teacher: <strong>{verifyResult.credential.teacher}</strong></p>
                  <p>Staff ID: <strong>{verifyResult.credential.staff_id}</strong></p>
                  <p>Document: <strong>{verifyResult.credential.file_name}</strong></p>
                  <p>Verified: <strong>{new Date(verifyResult.credential.verified_at).toLocaleDateString()}</strong></p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* All Credentials */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">All Verified Credentials</h3>
          {credentials.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <Shield size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No credentials found</p>
            </div>
          ) : (
            credentials.map((cred) => (
              <div key={cred.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">
                        {cred.first_name} {cred.last_name}
                      </span>
                      <span className="text-xs font-mono text-gray-400">{cred.staff_id}</span>
                      <Badge status={cred.verification_status} />
                    </div>
                    <p className="text-sm text-gray-600">{cred.file_name}</p>
                    {cred.verified_at && (
                      <p className="text-xs text-gray-400">
                        Verified: {new Date(cred.verified_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {cred.blockchain_tx_id && (
                    <button
                      onClick={() => copyToClipboard(cred.blockchain_tx_id)}
                      className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg shrink-0"
                    >
                      <Copy size={14} />
                      Copy TX ID
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Credentials;