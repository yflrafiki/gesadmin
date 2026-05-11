import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ArrowLeftRight,
  TrendingUp, Shield, BarChart3, FileText, Menu, X
} from 'lucide-react';

const hrLinks = [
  { to: '/hr/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hr/teachers', icon: Users, label: 'Teachers' },
  { to: '/hr/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/hr/promotions', icon: TrendingUp, label: 'Promotions' },
  { to: '/hr/credentials', icon: Shield, label: 'Credentials' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
  { to: '/admin/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/admin/promotions', icon: TrendingUp, label: 'Promotions' },
  { to: '/admin/credentials', icon: Shield, label: 'Credentials' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : hrLinks;

  const navLinks = (
    <nav className="flex flex-col gap-1 px-3 pt-4">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`
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
        className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-700 text-white p-3 rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={() => setOpen(false)}>
          <div className="w-64 bg-white h-full shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="bg-blue-900 text-white px-4 py-4">
              <p className="font-bold">Menu</p>
            </div>
            {navLinks}
          </div>
        </div>
      )}

      <aside className="hidden md:block w-64 bg-white shadow-md min-h-screen">
        {navLinks}
      </aside>
    </>
  );
};

export default Sidebar;