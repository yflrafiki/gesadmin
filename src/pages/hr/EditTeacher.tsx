import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { FormSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { getTeacherById, updateTeacher } from '../../api/teachers';
import type { Teacher } from '../../types';
import { TITLES, QUALIFICATIONS, EMPLOYMENT_STATUSES, GRADES, REGIONS } from '../../constants/teacherOptions';

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface FieldProps {
  label: string;
  field: string;
  value: any;
  onChange: (field: string, value: any) => void;
  type?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

const Field = ({
  label,
  field,
  value,
  onChange,
  type = 'text',
  options,
  required = false,
  placeholder = ''
}: FieldProps) => (
  <div>
    <label className={labelClass}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' && options ? (
      <select
        value={value ?? ''}
        onChange={(e) => onChange(field, e.target.value)}
        className={inputClass}
      >
        <option value="">Select {label}...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    ) : type === 'checkbox' ? (
      <div className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field, e.target.checked)}
          className="w-5 h-5 accent-blue-600 cursor-pointer"
        />
        <span className="text-sm text-gray-600">Yes</span>
      </div>
    ) : (
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(
          field,
          type === 'number'
            ? (e.target.value === '' ? '' : Number(e.target.value))
            : e.target.value
        )}
        className={inputClass}
        required={required}
        placeholder={placeholder}
      />
    )}
  </div>
);

const EditTeacher = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<any>({
    title: '',
    first_name: '',
    last_name: '',
    phone: '',
    subject_specialization: '',
    qualification: '',
    current_grade: '',
    national_date_of_present_rank: '',
    current_school: '',
    current_district: '',
    current_region: '',
    date_of_first_appointment: '',
    date_of_confirmation: '',
    date_of_current_posting: '',
    employment_status: 'active',
    disability_status: false,
    disability_type: '',
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await getTeacherById(id);
        const teacherData = res.data.teacher ?? res.data;
        setTeacher(teacherData);
        setForm({
          title: teacherData.title ?? '',
          first_name: teacherData.first_name ?? '',
          last_name: teacherData.last_name ?? '',
          phone: teacherData.phone ?? '',
          subject_specialization: teacherData.subject_specialization ?? '',
          qualification: teacherData.qualification ?? '',
          current_grade: teacherData.current_grade ?? '',
          national_date_of_present_rank: teacherData.national_date_of_present_rank ?? '',
          current_school: teacherData.current_school ?? '',
          current_district: teacherData.current_district ?? '',
          current_region: teacherData.current_region ?? '',
          date_of_first_appointment: teacherData.date_of_first_appointment ?? '',
          date_of_confirmation: teacherData.date_of_confirmation ?? '',
          date_of_current_posting: teacherData.date_of_current_posting ?? '',
          employment_status: teacherData.employment_status ?? 'active',
          disability_status: Boolean(teacherData.disability_status),
          disability_type: teacherData.disability_type ?? '',
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Unable to load teacher');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const update = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }));

  const buildPayload = () => {
    const payload: any = {};
    const setValue = (field: string, value: any) => {
      if (typeof value === 'boolean') {
        payload[field] = value;
        return;
      }
      if (value !== undefined && value !== '') {
        payload[field] = value;
      }
    };

    setValue('title', form.title);
    setValue('first_name', form.first_name);
    setValue('last_name', form.last_name);
    setValue('phone', form.phone);
    setValue('subject_specialization', form.subject_specialization);
    setValue('qualification', form.qualification);
    setValue('current_grade', form.current_grade);
    setValue('national_date_of_present_rank', form.national_date_of_present_rank);
    setValue('current_school', form.current_school);
    setValue('current_district', form.current_district);
    setValue('current_region', form.current_region);
    setValue('date_of_first_appointment', form.date_of_first_appointment);
    setValue('date_of_confirmation', form.date_of_confirmation);
    setValue('date_of_current_posting', form.date_of_current_posting);
    setValue('employment_status', form.employment_status);
    setValue('disability_status', form.disability_status);
    setValue('disability_type', form.disability_type);

    return payload;
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      await updateTeacher(id, payload);
      toast.success('Teacher updated successfully');
      navigate('/hr/teachers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Teacher update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><FormSkeleton /></Layout>;
  if (!teacher) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
          <p className="text-gray-600">Teacher not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Edit Teacher</h2>
            <p className="text-gray-500 text-sm">Update teacher details.</p>
          </div>
          <button
            onClick={() => navigate('/hr/teachers')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition"
          >
            Back to Teachers
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" field="title" value={form.title} onChange={update} type="select" options={TITLES} />
            <Field label="First Name" field="first_name" value={form.first_name} onChange={update} required />
            <Field label="Last Name" field="last_name" value={form.last_name} onChange={update} required />
            <Field label="Phone" field="phone" value={form.phone} onChange={update} placeholder="e.g. 0244123456" />
            <Field label="Subject Specialization" field="subject_specialization" value={form.subject_specialization} onChange={update} placeholder="e.g. Mathematics" />
            <Field label="Qualification" field="qualification" value={form.qualification} onChange={update} type="select" options={QUALIFICATIONS} />
            <Field label="Current Grade / Rank" field="current_grade" value={form.current_grade} onChange={update} type="select" options={GRADES} />
            <div>
              <Field label="Date of First Appointment" field="date_of_first_appointment" value={form.date_of_first_appointment} onChange={update} type="date" />
              <p className="text-xs text-gray-400 mt-1">
                Years of service: <strong>{teacher?.years_of_service ?? '—'}</strong> (calculated automatically from this date)
              </p>
            </div>
            <div>
              <Field label="National Date of Present Rank" field="national_date_of_present_rank" value={form.national_date_of_present_rank} onChange={update} type="date" />
              <p className="text-xs text-gray-400 mt-1">
                Years in current rank: <strong>{teacher?.years_in_current_rank ?? '—'}</strong> (calculated automatically from this date)
              </p>
            </div>
            <Field label="Current School" field="current_school" value={form.current_school} onChange={update} placeholder="e.g. Tarkwa Senior High School" />
            <Field label="Current District" field="current_district" value={form.current_district} onChange={update} placeholder="e.g. Tarkwa-Nsuaem" />
            <Field label="Current Region" field="current_region" value={form.current_region} onChange={update} type="select" options={REGIONS} />
            <Field label="Date of Current Posting" field="date_of_current_posting" value={form.date_of_current_posting} onChange={update} type="date" />
            <Field label="Employment Status" field="employment_status" value={form.employment_status} onChange={update} type="select" options={EMPLOYMENT_STATUSES} />
            <Field label="Disability Status" field="disability_status" value={form.disability_status} onChange={update} type="checkbox" />
            {form.disability_status && (
              <Field label="Disability Type" field="disability_type" value={form.disability_type} onChange={update} placeholder="Describe the disability" />
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/hr/teachers')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditTeacher;
