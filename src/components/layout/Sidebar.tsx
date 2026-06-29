import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ArrowLeftRight,
  TrendingUp, BarChart3, FileText, Menu, X,
  BookOpen, ClipboardEdit, UserPlus, ShieldCheck, UserCog, ClipboardCheck
} from 'lucide-react';

const hrLinks = [
  { to: '/hr/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hr/teachers', icon: Users, label: 'Teachers' },
  { to: '/hr/teachers/add', icon: UserPlus, label: 'Add Teacher' },
  { heading: 'Applications' },
  { to: '/hr/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/hr/promotions', icon: TrendingUp, label: 'Promotions' },
  { to: '/hr/change-requests', icon: ClipboardEdit, label: 'Change Requests' },
  { to: '/hr/exams', icon: BookOpen, label: 'Examinations' },
  { to: '/hr/promotion-documents', icon: FileText, label: 'Promo Documents' },
  { to: '/hr/verified-teachers', icon: ShieldCheck, label: 'Verified Teachers' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
  { to: '/admin/hr-officers', icon: UserCog, label: 'HR Officers' },
  { to: '/admin/examiners', icon: ClipboardCheck, label: 'Examiners' },
  { heading: 'Applications' },
  { to: '/admin/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/admin/promotions', icon: TrendingUp, label: 'Promotions' },
  { to: '/admin/change-requests', icon: ClipboardEdit, label: 'Change Requests' },
  { to: '/admin/exams', icon: BookOpen, label: 'Examinations' },
  { to: '/admin/promotion-documents', icon: FileText, label: 'Promo Documents' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
  { to: '/admin/verified-teachers', icon: ShieldCheck, label: 'Verified Teachers' },
];

const examinerLinks = [
  { to: '/examiner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/examiner/exams', icon: BookOpen, label: 'Examinations' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'examiner' ? examinerLinks : hrLinks;

  const navLinks = (
    <nav className="flex flex-col gap-1 px-3 pt-4">
      {links.map((link, i) => {
        if ('heading' in link) {
          return (
            <p key={`heading-${i}`} className="text-xs font-bold uppercase tracking-wider px-4 pt-3 pb-1"
              style={{ color: '#C49A1A' }}>
              {link.heading}
            </p>
          );
        }
        const { to, icon: Icon, label } = link;
        return (
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
                ? { backgroundColor: '#FBF3D9', color: '#C49A1A', borderLeftColor: '#C49A1A' }
                : { color: '#1F4D30' }
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 text-white p-3 rounded-full shadow-lg"
        style={{ backgroundColor: '#C49A1A' }}
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
            style={{ backgroundColor: '#F7F5EF' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-white px-4 py-4" style={{ backgroundColor: '#0D2818' }}>
              <p className="font-bold">Menu</p>
            </div>
            {navLinks}
          </div>
        </div>
      )}

      <aside
        className="hidden md:block w-64 shadow-md min-h-screen"
        style={{ backgroundColor: '#F7F5EF', borderRight: '1px solid #E8C547' }}
      >
        {navLinks}
      </aside>
    </>
  );
};

export default Sidebar;
