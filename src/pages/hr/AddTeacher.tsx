import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';
import { registerAccount } from '../../api/auth';
import { ChevronLeft, ChevronRight, UserPlus, Upload } from 'lucide-react';
import { TITLES, QUALIFICATIONS, MARITAL_STATUSES, EMPLOYMENT_STATUSES, GRADES, REGIONS } from '../../constants/teacherOptions';

const ROLES = ['teacher', 'hr_officer', 'examiner', 'admin'];

const steps = ['Account', 'Personal', 'Identification & Statutory', 'Academic', 'Professional', 'Employment', 'Health'];

// Every field listed here must be filled before the admin can move to the
// next section — this is a mandatory intake form, not an optional one.
const REQUIRED_FIELDS: Record<number, [string, string][]> = {
  0: [['email', 'Email Address'], ['staff_id', 'Staff ID'], ['date_of_birth', 'Date of Birth'], ['first_name', 'First Name'], ['last_name', 'Last Name']],
  1: [['title', 'Title'], ['gender', 'Gender'], ['phone', 'Phone Number'], ['marital_status', 'Marital Status'], ['nationality', 'Nationality'], ['hometown', 'Hometown'], ['residential_address', 'Residential Address']],
  2: [['ghana_card_number', 'Ghana Card Number'], ['house_number', 'House Number'], ['ghana_card_issue_date', 'Ghana Card Issue Date'], ['ghana_card_expiry_date', 'Ghana Card Expiry Date'], ['ntc_license_number', 'NTC License Number'], ['ssnit_number', 'SSNIT Number'], ['nss_number', 'NSS Number'], ['nss_certificate', 'NSS Certificate']],
  3: [['institution_attended', 'Institution Attended'], ['graduation_date', 'Graduation Date'], ['student_index_number', 'Student Index Number'], ['qualification', 'Qualification'], ['major_minor_courses', 'Major / Minor Courses'], ['degree_certificate', 'Degree / Diploma Certificate']],
  4: [['subject_specialization', 'Subject Specialization'], ['current_grade', 'Current Grade / Rank'], ['national_date_of_present_rank', 'National Date of Present Rank']],
  5: [['current_school', 'Current School'], ['current_district', 'Current District'], ['current_region', 'Current Region'], ['date_of_first_appointment', 'Date of First Appointment'], ['date_of_confirmation', 'Date of Confirmation'], ['date_of_current_posting', 'Date of Current Posting'], ['employment_status', 'Employment Status'], ['appointment_letter', 'Appointment / Promotion Letter']],
};

const isFilled = (value: any) => {
  if (value instanceof File) return true;
  if (typeof value === 'boolean') return true;
  return String(value ?? '').trim() !== '';
};

const inputClass = "w-full border-0 border-b-2 border-gray-200 px-1 py-2.5 text-sm focus:outline-none focus:border-blue-600 transition bg-transparent";
const labelClass = "block text-sm font-medium text-gray-800 mb-1.5";

// ✅ Field is OUTSIDE AddTeacher — no re-render on keystroke
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
  label, field, value, onChange,
  type = 'text', options, required = false, placeholder = ''
}: FieldProps) => (
  <div>
    <label className={labelClass}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' && options ? (
      <select
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={inputClass}
      >
        <option value="">Select {label}...</option>
        {options.map(o => (
          <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
        ))}
      </select>
    ) : type === 'checkbox' ? (
      <div className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(field, e.target.checked)}
          className="w-5 h-5 accent-blue-600 cursor-pointer"
        />
        <span className="text-sm text-gray-600">Yes</span>
      </div>
    ) : type === 'file' ? (
      <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:border-blue-400 transition bg-gray-50">
        <Upload size={14} className="text-gray-400 shrink-0" />
        <span className="truncate text-gray-600">
          {value ? value.name : `Upload ${label}...`}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => onChange(field, e.target.files?.[0] || null)}
        />
      </label>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(
          field,
          type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
        )}
        className={inputClass}
        required={required}
        placeholder={placeholder}
      />
    )}
  </div>
);

const INITIAL_FORM: Record<string, any> = {
  email: '',
  password: 'password123',
  full_name: '',
  role: 'teacher',
  staff_id: '',
  first_name: '',
  last_name: '',
  date_of_birth: '',
  title: '',
  phone: '',
  gender: '',
  marital_status: '',
  nationality: 'Ghanaian',
  hometown: '',
  residential_address: '',
  house_number: '',
  ghana_card_number: '',
  ghana_card_issue_date: '',
  ghana_card_expiry_date: '',
  ntc_license_number: '',
  nss_number: '',
  nss_certificate: null,
  ssnit_number: '',
  institution_attended: '',
  graduation_date: '',
  major_minor_courses: '',
  student_index_number: '',
  degree_certificate: null,
  subject_specialization: '',
  qualification: '',
  current_grade: '',
  years_of_service: 0,
  national_date_of_present_rank: '',
  years_in_current_rank: 0,
  current_school: '',
  current_district: '',
  current_region: '',
  date_of_first_appointment: '',
  date_of_confirmation: '',
  date_of_current_posting: '',
  employment_status: 'active',
  appointment_letter: null,
  disability_status: false,
  disability_type: '',
  region: '',
  district: '',
};

const AddTeacher = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(INITIAL_FORM);
  // The role picker starts locked (it defaults to "teacher") — an admin has
  // to explicitly use "Change role" to switch what kind of account they're
  // creating, rather than risk silently flipping roles mid-form.
  const [roleLocked, setRoleLocked] = useState(true);

  const changeRole = () => {
    setForm(INITIAL_FORM);
    setCurrentStep(0);
    setRoleLocked(false);
  };

  // ✅ Stable update function
  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Every field in REQUIRED_FIELDS for the current step must be filled in —
  // this is a mandatory intake form, admins can't skip ahead with gaps.
  const validateStep = () => {
    const required = REQUIRED_FIELDS[currentStep] || [];
    const missing = required.filter(([key]) => !isFilled(form[key]));
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(([, label]) => label).join(', ')}`);
      return false;
    }
    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (currentStep === 1 && !/^\d{10}$/.test(form.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(0, prev - 1));

  // Files (NSS certificate, degree certificate, appointment letter) mean this
  // always goes as multipart/form-data — axios sets the right headers/boundary
  // automatically when given a FormData instance.
  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (value instanceof File) {
        fd.append(key, value);
      } else {
        fd.append(key, String(value));
      }
    });
    return fd;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await registerAccount(buildFormData());
      toast.success(`Teacher ${form.first_name} ${form.last_name} registered successfully!`);
      navigate('/admin/teachers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimpleSubmit = async () => {
    if (!form.email || !form.password || !form.full_name) {
      toast.error('Full name, email and password are required');
      return;
    }
    if (form.role === 'hr_officer' && !form.region) {
      toast.error('Region is required for HR officer accounts');
      return;
    }
    setSubmitting(true);
    try {
      await registerAccount({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        region: form.role === 'hr_officer' ? form.region : undefined,
        district: form.role === 'hr_officer' ? form.district : undefined,
      });
      toast.success(`${form.role.replace('_', ' ')} account created successfully!`);
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Account creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium">Default password: <strong>password123</strong></p>
              <p className="text-xs mt-0.5">Teacher can change this after first login.</p>
            </div>
            <Field label="Email Address" field="email" value={form.email}
              onChange={update} type="email" required placeholder="teacher@ges.com" />
            <Field label="Staff ID" field="staff_id" value={form.staff_id}
              onChange={update} required placeholder="e.g. GES002" />
            <Field label="Date of Birth" field="date_of_birth" value={form.date_of_birth}
              onChange={update} type="date" required />
            <Field label="First Name" field="first_name" value={form.first_name}
              onChange={update} required placeholder="First name" />
            <Field label="Last Name" field="last_name" value={form.last_name}
              onChange={update} required placeholder="Last name" />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <Field label="Title" field="title" value={form.title}
              onChange={update} type="select" options={TITLES} required />
            <Field label="Gender" field="gender" value={form.gender}
              onChange={update} type="select" options={['Male', 'Female']} required />
            <Field label="Phone Number (10 digits)" field="phone" value={form.phone}
              onChange={update} type="tel" required placeholder="e.g. 0244123456" />
            <Field label="Marital Status" field="marital_status" value={form.marital_status}
              onChange={update} type="select" options={MARITAL_STATUSES} required />
            <Field label="Nationality" field="nationality" value={form.nationality}
              onChange={update} required placeholder="e.g. Ghanaian" />
            <Field label="Hometown" field="hometown" value={form.hometown}
              onChange={update} required placeholder="e.g. Tarkwa" />
            <Field label="Residential Address" field="residential_address" value={form.residential_address}
              onChange={update} required placeholder="e.g. House 12, Tarkwa-Nsuaem" />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <p className="text-xs text-gray-500">Ghana Card format: GHA-XXXXXXXXX-X</p>
            <Field label="Ghana Card Number" field="ghana_card_number" value={form.ghana_card_number}
              onChange={update} required placeholder="e.g. GHA-123456789-0" />
            <Field label="House Number" field="house_number" value={form.house_number}
              onChange={update} required placeholder="e.g. H/No. 12" />
            <Field label="Ghana Card Issue Date" field="ghana_card_issue_date" value={form.ghana_card_issue_date}
              onChange={update} type="date" required />
            <Field label="Ghana Card Expiry Date" field="ghana_card_expiry_date" value={form.ghana_card_expiry_date}
              onChange={update} type="date" required />
            <Field label="NTC License Number" field="ntc_license_number" value={form.ntc_license_number}
              onChange={update} required placeholder="License or exam index number" />
            <Field label="SSNIT Number" field="ssnit_number" value={form.ssnit_number}
              onChange={update} required placeholder="e.g. C123456789012" />
            <Field label="NSS Number" field="nss_number" value={form.nss_number}
              onChange={update} required placeholder="National Service number" />
            <Field label="NSS Certificate" field="nss_certificate" value={form.nss_certificate}
              onChange={update} type="file" required />
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <Field label="Institution Attended" field="institution_attended" value={form.institution_attended}
              onChange={update} required placeholder="e.g. University of Education, Winneba" />
            <Field label="Graduation Date" field="graduation_date" value={form.graduation_date}
              onChange={update} type="date" required />
            <Field label="Student Index Number" field="student_index_number" value={form.student_index_number}
              onChange={update} required placeholder="Tertiary institution index number" />
            <Field label="Qualification" field="qualification" value={form.qualification}
              onChange={update} type="select" options={QUALIFICATIONS} required />
            <Field label="Major / Minor Courses" field="major_minor_courses" value={form.major_minor_courses}
              onChange={update} required placeholder="e.g. Maths (Major), Science (Minor)" />
            <Field label="Degree / Diploma Certificate" field="degree_certificate" value={form.degree_certificate}
              onChange={update} type="file" required />
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <Field label="Subject Specialization" field="subject_specialization"
              value={form.subject_specialization} onChange={update}
              required placeholder="e.g. Mathematics" />
            <Field label="Current Grade / Rank" field="current_grade" value={form.current_grade}
              onChange={update} type="select" options={GRADES} required />
            <Field label="Years of Service" field="years_of_service"
              value={form.years_of_service} onChange={update} type="number" />
            <Field label="National Date of Present Rank" field="national_date_of_present_rank"
              value={form.national_date_of_present_rank} onChange={update} type="date" required />
            <Field label="Years in Current Rank" field="years_in_current_rank"
              value={form.years_in_current_rank} onChange={update} type="number" />
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <Field label="Current School" field="current_school" value={form.current_school}
              onChange={update} required placeholder="e.g. Tarkwa Senior High School" />
            <Field label="Current District" field="current_district" value={form.current_district}
              onChange={update} required placeholder="e.g. Tarkwa-Nsuaem" />
            <Field label="Current Region" field="current_region" value={form.current_region}
              onChange={update} type="select" options={REGIONS} required />
            <Field label="Date of First Appointment" field="date_of_first_appointment"
              value={form.date_of_first_appointment} onChange={update} type="date" required />
            <Field label="Date of Confirmation" field="date_of_confirmation"
              value={form.date_of_confirmation} onChange={update} type="date" required />
            <Field label="Date of Current Posting" field="date_of_current_posting"
              value={form.date_of_current_posting} onChange={update} type="date" required />
            <Field label="Employment Status" field="employment_status"
              value={form.employment_status} onChange={update}
              type="select" options={EMPLOYMENT_STATUSES} required />
            <Field label="Appointment / Promotion Letter" field="appointment_letter" value={form.appointment_letter}
              onChange={update} type="file" required />
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <Field label="Does the teacher have a disability?"
              field="disability_status" value={form.disability_status}
              onChange={update} type="checkbox" />
            {form.disability_status && (
              <Field label="Disability Type / Description"
                field="disability_type" value={form.disability_type}
                onChange={update} required placeholder="Describe the disability..." />
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-semibold text-gray-700 text-sm border-b pb-2 mb-3">
                Registration Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  ['Full Name', `${form.title} ${form.first_name} ${form.last_name}`.trim()],
                  ['Staff ID', form.staff_id],
                  ['Email', form.email],
                  ['Gender', form.gender],
                  ['Ghana Card', form.ghana_card_number],
                  ['Grade', form.current_grade],
                  ['School', form.current_school],
                  ['District', form.current_district],
                  ['Region', form.current_region],
                  ['Status', form.employment_status],
                  ['Qualification', form.qualification],
                  ['Institution', form.institution_attended],
                  ['Subject', form.subject_specialization],
                  ['Years of Service', String(form.years_of_service)],
                  ['NTC License No.', form.ntc_license_number],
                  ['NSS Number', form.nss_number],
                  ['SSNIT Number', form.ssnit_number],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-700 text-xs">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/teachers')}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Create New Account
            </h2>
            <p className="text-gray-500 text-sm">
              Only admins can create accounts. Choose a role to get started.
            </p>
          </div>
        </div>

        {/* Role selector — locked to the current selection once chosen, so
            switching mid-form can't silently mix up data for a different
            role. "Change role" explicitly resets the form first. */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass.replace('mb-1.5', '')}>
              Account Role <span className="text-red-500">*</span>
            </label>
            {roleLocked && (
              <button
                type="button"
                onClick={changeRole}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Change role
              </button>
            )}
          </div>
          <select
            value={form.role}
            onChange={(e) => { update('role', e.target.value); setRoleLocked(true); }}
            className={inputClass}
          >
            {ROLES.map((r) => (
              <option key={r} value={r} disabled={roleLocked && r !== form.role}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {form.role !== 'teacher' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <Field label="Full Name" field="full_name" value={form.full_name}
              onChange={update} required placeholder="e.g. Jane Mensah" />
            <Field label="Email Address" field="email" value={form.email}
              onChange={update} type="email" required placeholder="user@ges.gov.gh" />
            <Field label="Password" field="password" value={form.password}
              onChange={update} type="text" required />
            {form.role === 'hr_officer' && (
              <>
                <Field label="Region" field="region" value={form.region}
                  onChange={update} type="select" options={REGIONS} required />
                <Field label="District" field="district" value={form.district}
                  onChange={update} placeholder="e.g. Tarkwa-Nsuaem" />
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  This HR officer will only be able to view and manage staff within the selected region.
                </p>
              </>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleSimpleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                <UserPlus size={16} />
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        ) : (
        <>
        {/* Progress — simple "Section X of Y" + thin bar, Google Forms style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              Section {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </span>
            <span className="text-gray-400 text-xs">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-t-4 border-t-blue-600">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pb-6">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm transition"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <div className="flex-1" />
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm transition"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              <UserPlus size={16} />
              {submitting ? 'Registering...' : 'Register Teacher'}
            </button>
          )}
        </div>
        </>
        )}
      </div>
    </Layout>
  );
};

export default AddTeacher;
