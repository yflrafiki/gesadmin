import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import toast from 'react-hot-toast';
import { Lock, Save, User, LogOut, Eye, EyeOff } from 'lucide-react';

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        current_password: form.current_password,
        new_password: form.new_password
      });
      toast.success('Password changed successfully');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Account</h2>
          <p className="text-gray-500 text-sm">Your login details and security settings</p>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-amber-50 rounded-full w-14 h-14 flex items-center justify-center shrink-0">
            <User size={28} className="text-amber-700" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
            <p className="text-sm font-medium text-gray-800">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                  className="w-full pl-9 pr-10 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  title={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  className="w-full pl-9 pr-10 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  title={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  className="w-full pl-9 pr-10 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  title={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </Layout>
  );
};

export default ChangePassword;