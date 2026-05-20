import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { ChevronLeft, ChevronRight, Check, UserPlus } from 'lucide-react';

const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof', 'Rev', 'Alhaji', 'Madam'];
const QUALIFICATIONS = ['Certificate', 'Diploma', 'B.Ed', 'B.A', 'B.Sc', 'M.Ed', 'M.A', 'M.Sc', 'PhD'];
const MARITAL_STATUSES = ['single', 'married', 'divorced', 'widowed', 'separated'];
const EMPLOYMENT_STATUSES = ['active', 'retired', 'terminated', 'on_leave', 'suspended'];
const GRADES = ['Grade C', 'Grade B', 'Grade A', 'Principal', 'Director'];
const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Savannah', 'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East'
];

const steps = ['Account', 'Personal', 'Professional', 'Employment', 'Health'];

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

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

const AddTeacher = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: 'password123',
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
    disability_status: false,
    disability_type: '',
  });

  // ✅ Stable update function
  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validateStep = () => {
    if (currentStep === 0) {
      if (!form.email || !form.staff_id || !form.first_name || !form.last_name) {
        toast.error('Please fill in all required fields');
        return false;
      }
      if (!form.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post('/auth/register', form);
      toast.success(`Teacher ${form.first_name} ${form.last_name} registered successfully!`);
      navigate('/hr/teachers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium">Default password: <strong>password123</strong></p>
              <p className="text-xs mt-0.5">Teacher can change this after first login.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Email Address" field="email" value={form.email}
                  onChange={update} type="email" required placeholder="teacher@ges.com" />
              </div>
              <Field label="Staff ID" field="staff_id" value={form.staff_id}
                onChange={update} required placeholder="e.g. GES002" />
              <Field label="Date of Birth" field="date_of_birth" value={form.date_of_birth}
                onChange={update} type="date" />
              <Field label="First Name" field="first_name" value={form.first_name}
                onChange={update} required placeholder="First name" />
              <Field label="Last Name" field="last_name" value={form.last_name}
                onChange={update} required placeholder="Last name" />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" field="title" value={form.title}
              onChange={update} type="select" options={TITLES} />
            <Field label="Gender" field="gender" value={form.gender}
              onChange={update} type="select" options={['Male', 'Female']} />
            <Field label="Phone Number" field="phone" value={form.phone}
              onChange={update} type="tel" placeholder="e.g. 0244123456" />
            <Field label="Marital Status" field="marital_status" value={form.marital_status}
              onChange={update} type="select" options={MARITAL_STATUSES} />
            <Field label="Nationality" field="nationality" value={form.nationality}
              onChange={update} placeholder="e.g. Ghanaian" />
            <Field label="Hometown" field="hometown" value={form.hometown}
              onChange={update} placeholder="e.g. Tarkwa" />
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Subject Specialization" field="subject_specialization"
              value={form.subject_specialization} onChange={update}
              placeholder="e.g. Mathematics" />
            <Field label="Qualification" field="qualification" value={form.qualification}
              onChange={update} type="select" options={QUALIFICATIONS} />
            <Field label="Current Grade / Rank" field="current_grade" value={form.current_grade}
              onChange={update} type="select" options={GRADES} />
            <Field label="Years of Service" field="years_of_service"
              value={form.years_of_service} onChange={update} type="number" />
            <Field label="National Date of Present Rank" field="national_date_of_present_rank"
              value={form.national_date_of_present_rank} onChange={update} type="date" />
            <Field label="Years in Current Rank" field="years_in_current_rank"
              value={form.years_in_current_rank} onChange={update} type="number" />
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Current School" field="current_school" value={form.current_school}
                onChange={update} placeholder="e.g. Tarkwa Senior High School" />
            </div>
            <Field label="Current District" field="current_district" value={form.current_district}
              onChange={update} placeholder="e.g. Tarkwa-Nsuaem" />
            <Field label="Current Region" field="current_region" value={form.current_region}
              onChange={update} type="select" options={REGIONS} />
            <Field label="Date of First Appointment" field="date_of_first_appointment"
              value={form.date_of_first_appointment} onChange={update} type="date" />
            <Field label="Date of Confirmation" field="date_of_confirmation"
              value={form.date_of_confirmation} onChange={update} type="date" />
            <Field label="Date of Current Posting" field="date_of_current_posting"
              value={form.date_of_current_posting} onChange={update} type="date" />
            <Field label="Employment Status" field="employment_status"
              value={form.employment_status} onChange={update}
              type="select" options={EMPLOYMENT_STATUSES} />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Does the teacher have a disability?"
                field="disability_status" value={form.disability_status}
                onChange={update} type="checkbox" />
              {form.disability_status && (
                <Field label="Disability Type / Description"
                  field="disability_type" value={form.disability_type}
                  onChange={update} placeholder="Describe the disability..." />
              )}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="font-semibold text-gray-700 text-sm border-b pb-2 mb-3">
                Registration Summary
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  ['Full Name', `${form.title} ${form.first_name} ${form.last_name}`.trim()],
                  ['Staff ID', form.staff_id],
                  ['Email', form.email],
                  ['Gender', form.gender],
                  ['Grade', form.current_grade],
                  ['School', form.current_school],
                  ['District', form.current_district],
                  ['Region', form.current_region],
                  ['Status', form.employment_status],
                  ['Qualification', form.qualification],
                  ['Subject', form.subject_specialization],
                  ['Years of Service', String(form.years_of_service)],
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
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hr/teachers')}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Register New Teacher
            </h2>
            <p className="text-gray-500 text-sm">
              Fill in the teacher's details to create their account
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    i < currentStep ? 'bg-green-500 text-white' :
                    i === currentStep ? 'bg-blue-700 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < currentStep ? <Check size={14} /> : i + 1}
                  </div>
                  <p className={`text-xs mt-1 hidden md:block text-center max-w-[70px] ${
                    i === currentStep ? 'text-blue-700 font-medium' : 'text-gray-400'
                  }`}>
                    {step}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 ${
                    i < currentStep ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4 text-base">
            Step {currentStep + 1}: {steps[currentStep]}
          </h3>
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
      </div>
    </Layout>
  );
};

export default AddTeacher;