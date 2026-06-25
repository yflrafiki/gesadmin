export interface User {
  id: string;
  email: string;
  role: string;
  region?: string | null;
  district?: string | null;
  name?: string | null;
}

export interface ChangeRequest {
  id: string;
  teacher_id: string;
  field_name: string;
  current_value: string | null;
  requested_value: string;
  reason: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewed_by_email?: string;
  hr_notes: string | null;
  created_at: string;
  first_name?: string;
  last_name?: string;
  staff_id?: string;
  current_region?: string;
  current_district?: string;
  document_name?: string | null;
  document_hash?: string | null;
}

export interface Teacher {
  id: string;
  user_id: string;
  staff_id: string;
  title: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string;
  gender: string;
  marital_status: string | null;
  nationality: string | null;
  hometown: string | null;
  subject_specialization: string;
  current_grade: string;
  national_date_of_present_rank: string | null;
  years_in_current_rank: number;
  current_school: string;
  current_district: string;
  current_region: string;
  years_of_service: number;
  qualification: string;
  date_of_first_appointment: string | null;
  date_of_confirmation: string | null;
  date_of_current_posting: string | null;
  employment_status: string | null;
  passport_photo: string | null;
  disability_status: boolean;
  disability_type: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  teacher_id: string;
  type: string;
  status: string;
  reason: string;
  requested_district?: string;
  requested_region?: string;
  hr_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  first_name?: string;
  last_name?: string;
  staff_id?: string;
  current_grade?: string;
  current_school?: string;
  current_district?: string;
  current_region?: string;
  years_of_service?: number;
  qualification?: string;
}

export interface Credential {
  id: string;
  teacher_id: string;
  document_id: string;
  document_hash: string;
  blockchain_tx_id: string;
  verification_status: string;
  verified_at: string | null;
  created_at: string;
  file_name: string;
  file_type: string;
  first_name?: string;
  last_name?: string;
  staff_id?: string;
}

export interface DashboardSummary {
  summary: {
    total_teachers: number;
    total_hr_officers: number;
    total_applications: number;
    recent_applications_7days: number;
  };
  transfers: { status: string; count: string }[];
  promotions: { status: string; count: string }[];
  credentials: { verification_status: string; count: string }[];
  teachers_by_region: { current_region: string; count: string }[];
  teachers_by_grade: { current_grade: string; count: string }[];
}