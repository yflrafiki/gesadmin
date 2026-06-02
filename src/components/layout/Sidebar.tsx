import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ArrowLeftRight,
  TrendingUp, BarChart3, FileText, Menu, X,
  BookOpen, Shield, Key
} from 'lucide-react';

const hrLinks = [
  { to: '/hr/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hr/teachers', icon: Users, label: 'Teachers' },
  { to: '/hr/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/hr/promotions', icon: TrendingUp, label: 'Promotions' },
  { to: '/hr/exams', icon: BookOpen, label: 'Examinations' },
  { to: '/hr/promotion-documents', icon: FileText, label: 'Promo Documents' },
  { to: '/hr/change-password', icon: Key, label: 'Change Password' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
  { to: '/admin/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/admin/promotions', icon: TrendingUp, label: 'Promotions' },
  { to: '/admin/exams', icon: BookOpen, label: 'Examinations' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
  { to: '/admin/blockchain', icon: Shield, label: 'Blockchain' },
  { to: '/admin/change-password', icon: Key, label: 'Change Password' },
  { to: '/admin/blockchain-references', icon: Shield, label: 'Blockchain Refs' },
];

const examinerLinks = [
  { to: '/examiner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/examiner/exams', icon: BookOpen, label: 'Examinations' },
  { to: '/examiner/change-password', icon: Key, label: 'Change Password' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'examiner' ? examinerLinks : hrLinks;

  const navLinks = (
    <nav className="flex flex-col gap-1 px-3 pt-4">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive ? 'border-l-4' : ''
            }`
          }
          style={({ isActive }) =>
            isActive
              ? { backgroundColor: '#fdf8e1', color: '#B8860B', borderLeftColor: '#B8860B' }
              : { color: '#3d2200' }
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 text-white p-3 rounded-full shadow-lg"
        style={{ backgroundColor: '#B8860B' }}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-64 h-full shadow-xl"
            style={{ backgroundColor: '#FAF7F0' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-white px-4 py-4" style={{ backgroundColor: '#1C0A00' }}>
              <p className="font-bold">Menu</p>
            </div>
            {navLinks}
          </div>
        </div>
      )}

      <aside
        className="hidden md:block w-64 shadow-md min-h-screen"
        style={{ backgroundColor: '#FAF7F0', borderRight: '1px solid #e6c84a' }}
      >
        {navLinks}
      </aside>
    </>
  );
};

export default Sidebar;
