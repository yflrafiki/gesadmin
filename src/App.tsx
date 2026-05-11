import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Spinner from './components/common/Spinner';

const ProtectedRoute = ({
  children,
  roles,
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

        {/* HR placeholder */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute roles={['hr_officer']}>
              <div className="p-6 text-xl font-bold">HR Dashboard — Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Admin placeholder */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <div className="p-6 text-xl font-bold">Admin Dashboard — Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/hr/dashboard" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;