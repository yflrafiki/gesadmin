import { useState, useEffect } from 'react';
import { createExam, getAllExams, publishExam, closeExam, getExamResults } from '../../api/exams';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Send, Lock, BookOpen, Eye, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  marks: number;
}

const emptyQuestion = (): Question => ({
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  marks: 1,
});

const ExaminerExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResults, setShowResults] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
    pass_mark: 5,
    questions: [emptyQuestion()],
  });

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

  const addQuestion = () =>
    setForm({ ...form, questions: [...form.questions, emptyQuestion()] });

  const removeQuestion = (i: number) => {
    if (form.questions.length === 1) return;
    setForm({ ...form, questions: form.questions.filter((_, idx) => idx !== i) });
  };

  const updateQuestion = (i: number, field: string, value: string | number) => {
    const updated = [...form.questions];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, questions: updated });
  };

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    if (form.questions.some(q =>
      !q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d
    )) {
      toast.error('Please fill in all question fields');
      return;
    }
    setSubmitting(true);
    try {
      await createExam({
        ...form,
        total_marks: form.questions.reduce((s, q) => s + q.marks, 0)
      });
      toast.success('Exam created successfully');
      setShowForm(false);
      setForm({ title: '', description: '', duration_minutes: 60, pass_mark: 5, questions: [emptyQuestion()] });
      fetchExams();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishExam(id);
      toast.success('Exam published — teachers can now take it');
      fetchExams();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeExam(id);
      toast.success('Exam closed');
      fetchExams();
    } catch (err: any) {
      toast.error('Failed to close exam');
    }
  };

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
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Examinations</h2>
            <p className="text-gray-500 text-sm">Create and manage promotion exams</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm transition w-fit"
          >
            <Plus size={16} />
            Create Exam
          </button>
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
                      <BookOpen size={16} className="text-purple-600" />
                      <span className="font-semibold text-gray-800">{exam.title}</span>
                      <Badge status={exam.status} />
                    </div>
                    {exam.description && (
                      <p className="text-sm text-gray-500">{exam.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>{exam.question_count} questions</span>
                      <span>{exam.duration_minutes} minutes</span>
                      <span>Pass: {exam.pass_mark}/{exam.total_marks} marks</span>
                      <span>{exam.attempt_count} attempts</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {exam.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(exam.id)}
                        className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        <Send size={14} />
                        Publish
                      </button>
                    )}
                    {exam.status === 'published' && (
                      <button
                        onClick={() => handleClose(exam.id)}
                        className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        <Lock size={14} />
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleViewResults(exam)}
                      className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg transition"
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

        {/* Create Exam Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4">
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-xl z-10">
                <h3 className="font-bold text-gray-800">Create New Exam</h3>
                <button onClick={() => setShowForm(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. Grade A Promotion Exam 2026"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Brief description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pass Mark</label>
                    <input
                      type="number"
                      value={form.pass_mark}
                      onChange={(e) => setForm({ ...form, pass_mark: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min={1}
                    />
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-700">
                      Questions ({form.questions.length}) —
                      Total: {form.questions.reduce((s, q) => s + q.marks, 0)} marks
                    </h4>
                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg"
                    >
                      <Plus size={14} />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.questions.map((q, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-purple-700">Question {i + 1}</span>
                          <button
                            onClick={() => removeQuestion(i)}
                            disabled={form.questions.length === 1}
                            className="text-red-400 hover:text-red-600 disabled:opacity-30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={2}
                          placeholder="Enter question..."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                            <div key={opt} className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                q.correct_answer === opt
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>{opt}</span>
                              <input
                                type="text"
                                value={q[`option_${opt.toLowerCase()}` as keyof Question] as string}
                                onChange={(e) => updateQuestion(i, `option_${opt.toLowerCase()}`, e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder={`Option ${opt}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Correct Answer:</label>
                            <select
                              value={q.correct_answer}
                              onChange={(e) => updateQuestion(i, 'correct_answer', e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              {['A', 'B', 'C', 'D'].map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Marks:</label>
                            <input
                              type="number"
                              value={q.marks}
                              onChange={(e) => updateQuestion(i, 'marks', parseInt(e.target.value))}
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                              min={1}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-800">
                  Total marks: <strong>{form.questions.reduce((s, q) => s + q.marks, 0)}</strong> —
                  Pass mark: <strong>{form.pass_mark}</strong> —
                  Questions: <strong>{form.questions.length}</strong>
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="flex-1 bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-lg text-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
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
                    {results.map((r, index) => (
                      <div key={r.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          r.passed
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-100 bg-red-50'
                        }`}>
                        <div>
                          <p className="font-medium text-gray-800">
                            #{index + 1} {r.first_name} {r.last_name}
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

export default ExaminerExams;