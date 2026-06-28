import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import VerifyEmailCode from './pages/VerifyEmailCode';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import HRDashboard from './pages/hr/Dashboard';
import HRTeachers from './pages/hr/Teachers';
import HRTransfers from './pages/hr/Transfers';
import HRPromotions from './pages/hr/Promotions';
import AdminDashboard from './pages/hr/Dashboard';
import Reports from './pages/admin/Reports';
import AuditLog from './pages/admin/AuditLog';
import Spinner from './components/common/Spinner';
import EditTeacher from './pages/hr/EditTeacher';
import HRExams from './pages/hr/Exams';
import ExaminerDashboard from './pages/examiner/Dashboard';
import ExaminerExams from './pages/examiner/Exams';
import PromotionDocuments from './pages/hr/PromotionDocuments';
import ChangePassword from './pages/ChangePassword';
import AddTeacher from './pages/hr/AddTeacher';
import ChangeRequests from './pages/hr/ChangeRequests';
import VerifiedTeachers from './pages/hr/VerifiedTeachers';
import HrOfficers from './pages/admin/HrOfficers';

const ProtectedRoute = ({
  children, roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email-code" element={<VerifyEmailCode />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* HR Routes */}
        <Route path="/hr/dashboard" element={<ProtectedRoute roles={['hr_officer']}><HRDashboard /></ProtectedRoute>} />
        <Route path="/hr/teachers" element={<ProtectedRoute roles={['hr_officer']}><HRTeachers /></ProtectedRoute>} />
        <Route path="/hr/transfers" element={<ProtectedRoute roles={['hr_officer']}><HRTransfers /></ProtectedRoute>} />
        <Route path="/hr/promotions" element={<ProtectedRoute roles={['hr_officer']}><HRPromotions /></ProtectedRoute>} />
        <Route path="/hr/exams" element={<ProtectedRoute roles={['hr_officer']}><HRExams /></ProtectedRoute>} />
        <Route path="/hr/promotion-documents" element={<ProtectedRoute roles={['hr_officer']}><PromotionDocuments /></ProtectedRoute>} />
        <Route path="/hr/verified-teachers" element={<ProtectedRoute roles={['hr_officer']}><VerifiedTeachers /></ProtectedRoute>} />
        <Route path="/hr/change-requests" element={<ProtectedRoute roles={['hr_officer']}><ChangeRequests /></ProtectedRoute>} />
        <Route path="/hr/change-password" element={<ProtectedRoute roles={['hr_officer']}><ChangePassword /></ProtectedRoute>} />
        <Route path="/hr/teachers/:id/edit" element={<ProtectedRoute roles={['hr_officer']}><EditTeacher /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute roles={['admin']}><HRTeachers /></ProtectedRoute>} />
        <Route path="/admin/transfers" element={<ProtectedRoute roles={['admin']}><HRTransfers /></ProtectedRoute>} />
        <Route path="/admin/promotions" element={<ProtectedRoute roles={['admin']}><HRPromotions /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AuditLog /></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute roles={['admin']}><HRExams /></ProtectedRoute>} />
        <Route path="/admin/verified-teachers" element={<ProtectedRoute roles={['admin']}><VerifiedTeachers /></ProtectedRoute>} />
        <Route path="/admin/hr-officers" element={<ProtectedRoute roles={['admin']}><HrOfficers /></ProtectedRoute>} />
        <Route path="/admin/change-requests" element={<ProtectedRoute roles={['admin']}><ChangeRequests /></ProtectedRoute>} />
        <Route path="/admin/change-password" element={<ProtectedRoute roles={['admin']}><ChangePassword /></ProtectedRoute>} />
        <Route path="/admin/promotion-documents" element={<ProtectedRoute roles={['admin']}><PromotionDocuments /></ProtectedRoute>} />
        <Route path="/admin/teachers/add" element={<ProtectedRoute roles={['admin']}><AddTeacher /></ProtectedRoute>} />
        <Route path="/admin/teachers/:id/edit" element={<ProtectedRoute roles={['admin']}><EditTeacher /></ProtectedRoute>} />
        {/* Examiner Routes */}
        <Route path="/examiner/dashboard" element={<ProtectedRoute roles={['examiner']}><ExaminerDashboard /></ProtectedRoute>} />
        <Route path="/examiner/exams" element={<ProtectedRoute roles={['examiner']}><ExaminerExams /></ProtectedRoute>} />
        <Route path="/examiner/change-password" element={<ProtectedRoute roles={['examiner']}><ChangePassword /></ProtectedRoute>} />
        {/* Root */}
        <Route path="/" element={
          !user ? <Navigate to="/login" replace /> :
          user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
          user.role === 'examiner' ? <Navigate to="/examiner/dashboard" replace /> :
          <Navigate to="/hr/dashboard" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;