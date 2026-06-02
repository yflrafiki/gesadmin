import { useState, useEffect } from 'react';
import { getAllExams, getExamResults } from '../../api/exams';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';
import {
  BookOpen, X, CheckCircle,
  XCircle, Eye
} from 'lucide-react';

const Exams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  const fetchExams = async () => {
    try {
      const res = await getAllExams();
      setExams(res.data.exams);
    } catch (err) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);



  const handleViewResults = async (exam: any) => {
    try {
      const res = await getExamResults(exam.id);
      setResults(res.data.results);
      setShowResults(exam);
    } catch (err) {
      toast.error('Failed to load results');
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Promotion Examinations</h2>
            <p className="text-gray-500 text-sm">View promotion exam results and history</p>
          </div>
        </div>

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No exams created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="font-semibold text-gray-800">{exam.title}</span>
                      <Badge status={exam.status} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>{exam.question_count} questions</span>
                      <span>{exam.duration_minutes} minutes</span>
                      <span>Pass: {exam.pass_mark}/{exam.total_marks} marks</span>
                      <span>{exam.attempt_count} attempts</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                      <button
                      onClick={() => handleViewResults(exam)}
                      className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye size={14} />
                      Results
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="font-bold text-gray-800">Results — {showResults.title}</h3>
                <button onClick={() => setShowResults(null)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                {results.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No submissions yet</p>
                ) : (
                  <div className="space-y-3">
                    {results.map((r) => (
                      <div key={r.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          r.passed ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'
                        }`}>
                        <div>
                          <p className="font-medium text-gray-800">
                            {r.first_name} {r.last_name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{r.staff_id}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {r.passed
                              ? <CheckCircle size={16} className="text-green-600" />
                              : <XCircle size={16} className="text-red-500" />
                            }
                            <span className={`font-bold ${r.passed ? 'text-green-700' : 'text-red-600'}`}>
                              {r.score}/{r.total_marks}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(r.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Exams;