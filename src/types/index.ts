export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  subject_specialization: string;
  current_grade: string;
  current_school: string;
  current_district: string;
  current_region: string;
  years_of_service: number;
  qualification: string;
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
    total_applications: number;
    recent_applications_7days: number;
  };
  transfers: { status: string; count: string }[];
  promotions: { status: string; count: string }[];
  credentials: { verification_status: string; count: string }[];
  teachers_by_region: { current_region: string; count: string }[];
  teachers_by_grade: { current_grade: string; count: string }[];
}