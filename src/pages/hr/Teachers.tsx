import { useState, useEffect } from 'react';
import { getAllTeachers, updateTeacher } from '../../api/teachers';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';
import { type Teacher } from '../../types/index';
import toast from 'react-hot-toast';
import { Search, Eye, Edit, X, Save, User, Lock } from 'lucide-react';

const QUALIFICATIONS = ['Certificate', 'Diploma', 'B.Ed', 'B.A', 'B.Sc', 'M.Ed', 'M.A', 'M.Sc', 'PhD'];
const EMPLOYMENT_STATUSES = ['active', 'retired', 'terminated', 'on_leave', 'suspended'];
const GRADES = ['Grade C', 'Grade B', 'Grade A', 'Principal', 'Director'];
const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Savannah', 'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East'
];

const SectionHeader = ({ title, locked }: { title: string; locked?: boolean }) => (
  <div className="col-span-2 mt-3">
    <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
      {locked && <Lock size={12} className="text-gray-400" />}
      <h4 className={`text-xs font-bold uppercase tracking-wider ${
        locked ? 'text-gray-400' : 'text-blue-700'
      }`}>
        {title} {locked && '— Read Only'}
      </h4>
    </div>
  </div>
);

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

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
    // Only pre-fill HR-editable fields
    setForm({
      current_grade: teacher.current_grade || '',
      current_school: teacher.current_school || '',
      current_district: teacher.current_district || '',
      current_region: teacher.current_region || '',
      subject_specialization: teacher.subject_specialization || '',
      qualification: teacher.qualification || '',
      years_of_service: teacher.years_of_service || 0,
      national_date_of_present_rank: (teacher as any).national_date_of_present_rank?.split('T')[0] || '',
      years_in_current_rank: (teacher as any).years_in_current_rank || 0,
      date_of_first_appointment: (teacher as any).date_of_first_appointment?.split('T')[0] || '',
      date_of_confirmation: (teacher as any).date_of_confirmation?.split('T')[0] || '',
      date_of_current_posting: (teacher as any).date_of_current_posting?.split('T')[0] || '',
      employment_status: (teacher as any).employment_status || 'active',
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

  const renderReadOnly = (label: string, value: any, isDate = false) => (
    <div key={label}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-500 italic">
        {value
          ? isDate ? value.toString().split('T')[0] : value.toString()
          : '—'
        }
      </p>
    </div>
  );

  const renderEditable = (
    label: string,
    key: string,
    type: string = 'text',
    options?: string[]
  ) => (
    <div key={key}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {editing ? (
        type === 'select' && options ? (
          <select
            value={form[key] || ''}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={form[key] || ''}
            onChange={(e) => setForm({
              ...form,
              [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      ) : (
        <p className="text-sm font-medium text-gray-800">
          {form[key]?.toString() || '—'}
        </p>
      )}
    </div>
  );

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Teachers</h2>
          <p className="text-gray-500 text-sm">View and manage teacher records</p>
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
                  {['Staff ID', 'Name', 'School', 'District', 'Grade', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs">{t.staff_id}</td>
                      <td className="px-4 py-3 font-medium">
                        {(t as any).title} {t.first_name} {t.last_name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                        {t.current_school}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{t.current_district}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                          {t.current_grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (t as any).employment_status === 'active' ? 'bg-green-100 text-green-700' :
                          (t as any).employment_status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' :
                          (t as any).employment_status === 'suspended' ? 'bg-red-100 text-red-700' :
                          (t as any).employment_status === 'retired' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {((t as any).employment_status || 'active').replace('_', ' ')}
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <div className="flex items-center gap-3">
                  {(selected as any).passport_photo ? (
                    <img
                      src={`http://localhost:5000/uploads/${(selected as any).passport_photo.split('uploads')[1]?.replace(/\\/g, '/') || (selected as any).passport_photo.replace(/\\/g, '/')}`}
                      alt="Passport"
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={18} className="text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {(selected as any).title} {selected.first_name} {selected.last_name}
                    </h3>
                    <p className="text-xs font-mono text-gray-400">{selected.staff_id}</p>
                  </div>
                </div>
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
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        <Save size={14} />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  )}
                  <button onClick={() => { setSelected(null); setEditing(false); }}>
                    <X size={20} className="text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6">

                {editing && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700 mb-4 flex items-center gap-2">
                    <Lock size={14} />
                    Personal details are managed by the teacher. You can only edit employment and professional information.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Personal — Read Only for HR */}
                  <SectionHeader title="Personal Information" locked />
                  {renderReadOnly('Title', (selected as any).title)}
                  {renderReadOnly('Full Name', `${selected.first_name} ${selected.last_name}`)}
                  {renderReadOnly('Date of Birth', (selected as any).date_of_birth, true)}
                  {renderReadOnly('Phone', selected.phone)}
                  {renderReadOnly('Gender', selected.gender)}
                  {renderReadOnly('Marital Status', (selected as any).marital_status)}
                  {renderReadOnly('Nationality', (selected as any).nationality)}
                  {renderReadOnly('Hometown', (selected as any).hometown)}
                  {renderReadOnly('Email', selected.email)}

                  {/* Diversity — Read Only for HR */}
                  <SectionHeader title="Diversity & Health" locked />
                  {renderReadOnly('Disability Status',
                    (selected as any).disability_status ? 'Yes' : 'No')}
                  {(selected as any).disability_status &&
                    renderReadOnly('Disability Type', (selected as any).disability_type)}

                  {/* Professional — HR Editable */}
                  <SectionHeader title="Professional Information" />
                  {renderEditable('Subject Specialization', 'subject_specialization')}
                  {renderEditable('Qualification', 'qualification', 'select', QUALIFICATIONS)}
                  {renderEditable('Current Grade / Rank', 'current_grade', 'select', GRADES)}
                  {renderEditable('Years of Service', 'years_of_service', 'number')}
                  {renderEditable('National Date of Present Rank', 'national_date_of_present_rank', 'date')}
                  {renderEditable('Years in Current Rank', 'years_in_current_rank', 'number')}

                  {/* Employment — HR Editable */}
                  <SectionHeader title="Employment Details" />
                  {renderEditable('Current School', 'current_school')}
                  {renderEditable('Current District', 'current_district')}
                  {renderEditable('Current Region', 'current_region', 'select', REGIONS)}
                  {renderEditable('Date of First Appointment', 'date_of_first_appointment', 'date')}
                  {renderEditable('Date of Confirmation', 'date_of_confirmation', 'date')}
                  {renderEditable('Date of Current Posting', 'date_of_current_posting', 'date')}
                  {renderEditable('Employment Status', 'employment_status', 'select', EMPLOYMENT_STATUSES)}

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