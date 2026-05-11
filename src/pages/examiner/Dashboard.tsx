import { useState, useEffect } from 'react';
import { getAllExams } from '../../api/exams';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import { BookOpen, Send, Lock, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ExaminerDashboard = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllExams();
        setExams(res.data.exams);
      } catch (err) {
        toast.error('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  const draft = exams.filter(e => e.status === 'draft').length;
  const published = exams.filter(e => e.status === 'published').length;
  const closed = exams.filter(e => e.status === 'closed').length;
  const totalAttempts = exams.reduce((sum, e) => sum + parseInt(e.attempt_count || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">

        {/* Banner */}
        <div className="bg-purple-900 text-white rounded-xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold">Examiner Dashboard</h2>
          <p className="text-purple-200 mt-1 text-sm">
            Create and manage promotion examinations for GES teachers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: BookOpen, label: 'Draft Exams', value: draft, color: 'bg-gray-500' },
            { icon: Send, label: 'Published', value: published, color: 'bg-green-500' },
            { icon: Lock, label: 'Closed', value: closed, color: 'bg-red-500' },
            { icon: Clock, label: 'Total Attempts', value: totalAttempts, color: 'bg-purple-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <div className={`p-3 rounded-full ${color}`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Exams</h3>
          {exams.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No exams created yet</p>
          ) : (
            <div className="space-y-3">
              {exams.slice(0, 5).map((exam) => (
                <div key={exam.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{exam.title}</p>
                    <p className="text-xs text-gray-400">
                      {exam.question_count} questions · {exam.attempt_count} attempts
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'published' ? 'bg-green-100 text-green-700' :
                    exam.status === 'closed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {exam.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExaminerDashboard;