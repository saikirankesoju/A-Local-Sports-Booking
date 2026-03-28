import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, Users, User } from 'lucide-react';

const adminLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/approvals', label: 'Facility Approvals', icon: CheckCircle },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/profile', label: 'Profile', icon: User },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] bg-sidebar border-r flex-shrink-0 hidden lg:block">
      <div className="p-4">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-4 px-3">
          Admin Panel
        </h3>
        <nav className="flex flex-col gap-1">
          {adminLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
