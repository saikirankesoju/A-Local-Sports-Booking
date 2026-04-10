import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, User, LogOut, Menu, X, LayoutDashboard, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const userLinks = [
    { path: '/', label: 'Home' },
    { path: '/venues', label: 'Venues' },
    { path: '/quick-book', label: 'Quick Book', icon: Zap, authRequired: true },
  ];

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'owner') return '/owner/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold">QuickCourt</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {userLinks.map(link => {
            // Show Quick Book only if authenticated and user role is user/not owner/admin
            if (link.authRequired && (!isAuthenticated || user?.role !== 'user')) return null;
            if (!link.authRequired && user && (user.role === 'owner' || user.role === 'admin')) return null;
            
            const Icon = link.icon as any;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
          {user && (user.role === 'owner' || user.role === 'admin') && (
            <Link
              to={getDashboardPath()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname.startsWith('/owner') || location.pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{user.role}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                {user.role === 'user' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/quick-book')}>
                      <Zap className="mr-2 h-4 w-4" /> Quick Book
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                      <Calendar className="mr-2 h-4 w-4" /> My Bookings
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>Log in</Button>
              <Button onClick={() => navigate('/signup')}>Sign up</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            {userLinks.map(link => {
              // Show Quick Book only if authenticated and user role is user/not owner/admin
              if (link.authRequired && (!isAuthenticated || user?.role !== 'user')) return null;
              if (!link.authRequired && user && (user.role === 'owner' || user.role === 'admin')) return null;
              
              const Icon = link.icon as any;
              return (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground">Profile</Link>
                <button onClick={() => { logout(); navigate('/login'); setMobileOpen(false); }} className="px-4 py-2 rounded-lg text-sm font-medium text-destructive text-left">Logout</button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Log in</Button>
                <Button className="w-full" onClick={() => { navigate('/signup'); setMobileOpen(false); }}>Sign up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
