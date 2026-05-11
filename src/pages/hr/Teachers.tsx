import { useState, useEffect } from 'react';
import { getAllTeachers, updateTeacher } from '../../api/teachers';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import { type Teacher } from '../../types/index';
import toast from 'react-hot-toast';
import { Search, Eye, Edit, X, Save } from 'lucide-react';

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Teacher>>({});

  const fetchTeachers = async () => {
    try {
      const res = await getAllTeachers({ search });
      setTeachers(res.data.teachers);
    } catch (err) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, [search]);

  const handleView = (teacher: Teacher) => {
    setSelected(teacher);
    setForm({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      phone: teacher.phone,
      current_grade: teacher.current_grade,
      current_school: teacher.current_school,
      current_district: teacher.current_district,
      current_region: teacher.current_region,
      years_of_service: teacher.years_of_service,
      qualification: teacher.qualification,
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateTeacher(selected.id, form);
      toast.success('Teacher record updated');
      setEditing(false);
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Teachers</h2>
          <p className="text-gray-500 text-sm">View and manage all teacher records</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or staff ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Staff ID', 'Name', 'School', 'District', 'Grade', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs">{t.staff_id}</td>
                      <td className="px-4 py-3 font-medium">{t.first_name} {t.last_name}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{t.current_school}</td>
                      <td className="px-4 py-3 text-gray-500">{t.current_district}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                          {t.current_grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleView(t)}
                          className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="font-bold text-gray-800">
                  {selected.first_name} {selected.last_name}
                  <span className="ml-2 text-sm font-mono text-gray-400">{selected.staff_id}</span>
                </h3>
                <div className="flex gap-2">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  )}
                  <button onClick={() => setSelected(null)}>
                    <X size={20} className="text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', key: 'first_name', editable: true },
                    { label: 'Last Name', key: 'last_name', editable: true },
                    { label: 'Phone', key: 'phone', editable: true },
                    { label: 'Current Grade', key: 'current_grade', editable: true },
                    { label: 'Current School', key: 'current_school', editable: true },
                    { label: 'District', key: 'current_district', editable: true },
                    { label: 'Region', key: 'current_region', editable: true },
                    { label: 'Years of Service', key: 'years_of_service', editable: true, type: 'number' },
                    { label: 'Qualification', key: 'qualification', editable: true },
                    { label: 'Email', key: 'email', editable: false },
                  ].map(({ label, key, editable, type }) => (
                    <div key={key}>
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      {editing && editable ? (
                        <input
                          type={type || 'text'}
                          value={(form as any)[key] || ''}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-700">
                          {(selected as any)[key] || '—'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Teachers;