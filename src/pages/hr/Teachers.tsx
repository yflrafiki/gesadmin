import { useState, useEffect } from 'react';
import { getAllTeachers, deleteTeacher } from '../../api/teachers';
import Layout from '../../components/layout/Layout';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { Search, Eye, X, User, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { REGIONS, QUALIFICATIONS } from '../../constants/teacherOptions';

const Teachers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [qualification, setQualification] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const basePath = location.pathname.startsWith('/admin') ? '/admin' : '/hr';
  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';
  const isAdmin = user?.role === 'admin';

  const fetchTeachers = async () => {
    try {
      // HR is already server-side scoped to their own region, so the region
      // filter only makes sense (and is only shown) for admin.
      const res = await getAllTeachers({
        search,
        qualification: qualification || undefined,
        ...(isAdmin ? { region: region || undefined } : {})
      });
      setTeachers(res.data.teachers);
    } catch (err) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, [search, region, qualification]);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const t = confirmDelete;
    setDeletingId(t.id);
    try {
      await deleteTeacher(t.id);
      toast.success('Teacher record deleted');
      setConfirmDelete(null);
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete teacher');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return '—';
    return val.toString().split('T')[0];
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider border-b border-amber-50 pb-1">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );

  const InfoField = ({ label, value }: { label: string; value: any }) => (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  );

  if (loading) return <Layout><TableSkeleton /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Teachers</h2>
            <p className="text-gray-500 text-sm">
              {isAdmin
                ? 'View teacher profiles, documents and credentials — all regions'
                : 'View teacher profiles, documents and credentials'}
            </p>
            {!isAdmin && user?.region && (
              <span className="inline-block mt-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                Your region: {user.region}{user.district ? ` · ${user.district}` : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate(`${basePath}/teachers/add`, { state: { role: 'teacher' } })}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition w-fit"
          >
            <UserPlus size={16} />
            Add Teacher
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or staff ID..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">All Qualifications</option>
            {QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          {isAdmin && (
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">All Regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}

          {(search || qualification || region) && (
            <button
              onClick={() => { setSearch(''); setQualification(''); setRegion(''); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Photo', 'Staff ID', 'Name', 'School', 'District', 'Grade', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        {t.passport_photo ? (
                          <img
                            src={t.passport_photo_url ? t.passport_photo_url : `${apiUrl}/${t.passport_photo}`}
                            alt="Photo"
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                            <User size={16} className="text-amber-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{t.staff_id}</td>
                      <td className="px-4 py-3 font-medium">
                        {t.title} {t.first_name} {t.last_name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                        {t.current_school}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{t.current_district}</td>
                      <td className="px-4 py-3">
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                          {t.current_grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.employment_status === 'active' ? 'bg-green-100 text-green-700' :
                          t.employment_status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' :
                          t.employment_status === 'suspended' ? 'bg-red-100 text-red-700' :
                          t.employment_status === 'retired' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {(t.employment_status || 'active').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => setSelected(t)}
                          className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`${basePath}/teachers/${t.id}/edit`)}
                          className="flex items-center gap-1 text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setConfirmDelete(t)}
                            disabled={deletingId === t.id}
                            className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            {deletingId === t.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Teacher Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <h3 className="font-bold text-gray-800">Teacher Profile</h3>
                <button onClick={() => setSelected(null)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 space-y-6">

                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {selected.passport_photo ? (
                    <img
                      src={selected.passport_photo_url ? selected.passport_photo_url : `${apiUrl}/${selected.passport_photo}`}
                      alt="Passport"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <User size={40} className="text-amber-600" />
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selected.title} {selected.first_name} {selected.last_name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">{selected.staff_id}</p>
                    <p className="text-gray-500 text-sm">{selected.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        selected.employment_status === 'active' ? 'bg-green-100 text-green-700' :
                        selected.employment_status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' :
                        selected.employment_status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {(selected.employment_status || 'active').replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {selected.current_grade}
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {selected.qualification}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <Section title="Personal Information">
                  <InfoField label="Title" value={selected.title} />
                  <InfoField label="Full Name" value={`${selected.first_name} ${selected.last_name}`} />
                  <InfoField label="Date of Birth" value={formatDate(selected.date_of_birth)} />
                  <InfoField label="Gender" value={selected.gender} />
                  <InfoField label="Marital Status" value={selected.marital_status} />
                  <InfoField label="Nationality" value={selected.nationality} />
                  <InfoField label="Hometown" value={selected.hometown} />
                  <InfoField label="Phone" value={selected.phone} />
                  <InfoField label="House Number" value={selected.house_number} />
                </Section>

                {/* Identification */}
                <Section title="Identification">
                  <InfoField label="Ghana Card Number" value={selected.ghana_card_number} />
                  <InfoField label="Ghana Card Issue Date" value={formatDate(selected.ghana_card_issue_date)} />
                  <InfoField label="Ghana Card Expiry Date" value={formatDate(selected.ghana_card_expiry_date)} />
                </Section>

                {/* Professional Information */}
                <Section title="Professional Information">
                  <InfoField label="Subject Specialization" value={selected.subject_specialization} />
                  <InfoField label="Qualification" value={selected.qualification} />
                  <InfoField label="Current Grade / Rank" value={selected.current_grade} />
                  <InfoField label="Years of Service (auto-calculated)" value={selected.years_of_service} />
                  <InfoField label="National Date of Present Rank" value={formatDate(selected.national_date_of_present_rank)} />
                  <InfoField label="Years in Current Rank (auto-calculated)" value={selected.years_in_current_rank} />
                </Section>

                {/* Employment Details */}
                <Section title="Employment Details">
                  <InfoField label="Current School" value={selected.current_school} />
                  <InfoField label="Current District" value={selected.current_district} />
                  <InfoField label="Current Region" value={selected.current_region} />
                  <InfoField label="Date of First Appointment" value={formatDate(selected.date_of_first_appointment)} />
                  <InfoField label="Date of Confirmation" value={formatDate(selected.date_of_confirmation)} />
                  <InfoField label="Date of Current Posting" value={formatDate(selected.date_of_current_posting)} />
                  <InfoField label="Employment Status" value={(selected.employment_status || 'active').replace('_', ' ')} />
                </Section>

                {/* Diversity & Health */}
                <Section title="Diversity & Health">
                  <InfoField
                    label="Disability Status"
                    value={selected.disability_status ? 'Yes' : 'No'}
                  />
                  {selected.disability_status && (
                    <InfoField label="Disability Type" value={selected.disability_type} />
                  )}
                </Section>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t shrink-0 flex justify-end">
                <button
                  onClick={() => setSelected(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-full p-2 shrink-0">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h3 className="font-bold text-gray-800">Delete Teacher Record</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Permanently delete <strong>{confirmDelete.title} {confirmDelete.first_name} {confirmDelete.last_name}</strong>{' '}
                ({confirmDelete.staff_id})? This removes their account, documents, credentials and
                application history. <strong>This cannot be undone.</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={deletingId === confirmDelete.id}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingId === confirmDelete.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Teachers;