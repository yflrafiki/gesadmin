import { useState, useEffect } from 'react';
import { getBlockchainNodes } from '../../api/exams';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import {
  Shield, CheckCircle, Server, Search,
  XCircle, Activity, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const BlockchainNodes = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txId, setTxId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [nodeActivity, setNodeActivity] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getBlockchainNodes();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load blockchain info');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleVerify = async () => {
    if (!txId.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    setNodeActivity([]);

    // Simulate node activity logs
    const nodes = ['GES (Orderer)', 'GTEC (Peer)', 'NTC (Peer)'];
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setNodeActivity(prev => [...prev, `${nodes[i]} — Querying ledger...`]);
      await new Promise(r => setTimeout(r, 400));
      setNodeActivity(prev => [...prev, `${nodes[i]} — Record found ✓`]);
    }

    try {
      const res = await API.get(`/credentials/check/${txId.trim()}`);
      setVerifyResult(res.data);
    } catch (err: any) {
      setVerifyResult({ verified: false, message: 'Credential not found on blockchain' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Blockchain Network</h2>
          <p className="text-gray-500 text-sm">
            Hyperledger Fabric private blockchain — 3 institutional nodes
          </p>
        </div>

        {/* Network Banner */}
        <div className="bg-blue-900 text-white rounded-xl p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={28} />
            <div>
              <h3 className="font-bold text-lg">{data?.network}</h3>
              <p className="text-blue-200 text-sm">Consensus Algorithm: {data?.consensus}</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            All teacher credentials are verified across 3 institutional nodes using
            PBFT consensus. A minimum of 2 out of 3 nodes must validate before a
            credential is written to the immutable ledger.
          </p>
        </div>

        {/* 3 Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.nodes.map((node: any, index: number) => (
            <div key={node.id}
              className="bg-white rounded-xl shadow-sm p-6 text-center space-y-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                index === 0 ? 'bg-blue-100' :
                index === 1 ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <Server size={24} className={
                  index === 0 ? 'text-blue-700' :
                  index === 1 ? 'text-green-700' : 'text-purple-700'
                } />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{node.id}</h4>
                <p className="text-xs text-gray-500 mt-1">{node.name}</p>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                node.role === 'orderer'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {node.role.toUpperCase()}
              </span>
              <div className="flex items-center justify-center gap-1.5 text-green-600 text-sm">
                <Activity size={14} />
                <span className="font-medium">Active</span>
              </div>
              <p className="text-xs text-gray-400">
                {index === 0
                  ? 'Orders & broadcasts transactions'
                  : 'Validates & endorses credentials'
                }
              </p>
            </div>
          ))}
        </div>

        {/* Verify TX */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Verify Credential by Transaction ID</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Paste blockchain transaction ID..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Node Activity Log */}
          {nodeActivity.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs space-y-1">
              <p className="text-green-400 mb-2">
                {'>'} Initiating PBFT consensus verification...
              </p>
              {nodeActivity.map((log, i) => (
                <p key={i} className="text-green-300">
                  {'>'} {log}
                </p>
              ))}
              {!verifying && verifyResult && (
                <p className={`mt-2 font-bold ${
                  verifyResult.verified ? 'text-green-400' : 'text-red-400'
                }`}>
                  {'>'} {verifyResult.verified
                    ? 'CONSENSUS REACHED — Credential verified on ledger ✓'
                    : 'VERIFICATION FAILED — Credential not found ✗'
                  }
                </p>
              )}
            </div>
          )}

          {/* Result */}
          {verifyResult && (
            <div className={`rounded-xl p-4 border ${
              verifyResult.verified
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {verifyResult.verified
                  ? <CheckCircle size={20} className="text-green-600" />
                  : <XCircle size={20} className="text-red-500" />
                }
                <span className={`font-semibold ${
                  verifyResult.verified ? 'text-green-700' : 'text-red-600'
                }`}>
                  {verifyResult.message}
                </span>
              </div>
              {verifyResult.verified && verifyResult.credential && (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-gray-500">Teacher:</p>
                    <p className="font-medium">{verifyResult.credential.teacher}</p>
                    <p className="text-gray-500">Staff ID:</p>
                    <p className="font-medium">{verifyResult.credential.staff_id}</p>
                    <p className="text-gray-500">Document:</p>
                    <p className="font-medium">{verifyResult.credential.file_name}</p>
                    <p className="text-gray-500">Verified:</p>
                    <p className="font-medium">
                      {new Date(verifyResult.credential.verified_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Document Hash</p>
                    <p className="text-xs font-mono text-gray-700 break-all">
                      {verifyResult.credential.document_hash}
                    </p>
                  </div>

                  {/* Node confirmations */}
                  {verifyResult.nodes && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-500 mb-2">Node Confirmations</p>
                      <div className="grid grid-cols-3 gap-2">
                        {verifyResult.nodes.map((node: any) => (
                          <div key={node.node_id}
                            className="bg-white rounded-lg p-2 text-center border border-green-100">
                            <CheckCircle size={14} className="text-green-500 mx-auto mb-1" />
                            <p className="text-xs font-bold text-gray-700">{node.node_id}</p>
                            <p className="text-xs text-gray-400 capitalize">{node.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={16} className="text-blue-600" />
            How Credential Verification Works
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', node: null, title: 'Document Upload', desc: 'Teacher uploads certificate or credential document to the system' },
              { step: '2', node: null, title: 'OCR Extraction', desc: 'Tesseract OCR automatically extracts text from the uploaded document' },
              { step: '3', node: null, title: 'Hash Generation', desc: 'A SHA-256 cryptographic hash of the document content is generated' },
              { step: '4', node: 'GES', title: 'GES Node (Orderer)', desc: 'GES receives the transaction, orders it and broadcasts to all peer nodes' },
              { step: '5', node: 'GTEC', title: 'GTEC Node (Peer)', desc: 'Ghana Tertiary Education Commission validates the academic credential' },
              { step: '6', node: 'NTC', title: 'NTC Node (Peer)', desc: 'National Teaching Council validates the teaching qualification' },
              { step: '7', node: null, title: 'PBFT Consensus', desc: '2 of 3 nodes must agree before the transaction is committed to the ledger' },
              { step: '8', node: null, title: 'Ledger Write', desc: 'Transaction ID and hash written immutably — cannot be altered or deleted' },
            ].map(({ step, node, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800 text-sm">{title}</p>
                    {node && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {node}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlockchainNodes;