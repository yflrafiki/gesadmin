import { useState, useEffect } from 'react';
import { getBlockchainNodes } from '../../api/exams';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import { Shield, CheckCircle, Server } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockchainNodes = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Blockchain Network</h2>
          <p className="text-gray-500 text-sm">Hyperledger Fabric private blockchain nodes</p>
        </div>

        {/* Network Info */}
        <div className="bg-blue-900 text-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={28} />
            <div>
              <h3 className="font-bold text-lg">{data?.network}</h3>
              <p className="text-blue-200 text-sm">Consensus: {data?.consensus}</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            The GES credential verification network uses a private Hyperledger Fabric
            blockchain with 3 participating institutional nodes. All credential verifications
            require consensus from at least 2 of the 3 nodes using PBFT protocol.
          </p>
        </div>

        {/* Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.nodes.map((node: any, index: number) => (
            <div key={node.id}
              className="bg-white rounded-xl shadow-sm p-6 text-center space-y-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <Server size={24} className={
                  index === 0 ? 'text-blue-700' : index === 1 ? 'text-green-700' : 'text-purple-700'
                } />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{node.id}</h4>
                <p className="text-sm text-gray-500">{node.name}</p>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                node.role === 'orderer'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {node.role.toUpperCase()}
              </span>
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <CheckCircle size={14} />
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">How Credential Verification Works</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Document Upload', desc: 'Teacher uploads certificate or credential document' },
              { step: '2', title: 'OCR Extraction', desc: 'Tesseract OCR extracts text from the document automatically' },
              { step: '3', title: 'Hash Generation', desc: 'A SHA-256 cryptographic hash of the document is generated' },
              { step: '4', title: 'Node Validation', desc: 'All 3 nodes (GES, GTEC, NTC) independently validate the credential' },
              { step: '5', title: 'PBFT Consensus', desc: '2 of 3 nodes must agree (consensus) before the TX is committed' },
              { step: '6', title: 'Ledger Write', desc: 'Transaction ID and hash written immutably to the blockchain ledger' },
              { step: '7', title: 'Verification', desc: 'HR officers can verify any credential instantly using the Transaction ID' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
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