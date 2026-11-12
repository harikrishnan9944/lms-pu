'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { logoutAction } from '@/app/actions/authActions';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Home,
  Menu,
  X,
  Shield,
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
  CheckCircle2,
  Bell,
  FolderKanban,
  FileText,
  FileCheck,
  CheckSquare,
  CreditCard,
  Video,
  MessageSquare,
  FolderArchive,
  Send,
  UserCheck,
  HelpCircle,
  PhoneCall,
  BookMarked,
  Building2,
  BarChart3,
  Settings,
  Activity,
} from 'lucide-react';

import { fetchNotificationsAction, markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/app/actions/lmsActions';
import { NotificationItem } from '@/lib/db';

export interface DashboardLayoutProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: 'ADMIN' | 'PROGRAM_COORDINATOR' | 'FACULTY' | 'MENTOR' | 'STUDENT';
    status: 'ACTIVE' | 'INACTIVE';
  };
  children: React.ReactNode;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: string;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotificationsAction().then(setNotifications).catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrator', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'PROGRAM_COORDINATOR':
        return { label: 'Programme Coordinator', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'FACULTY':
        return { label: 'Course Coordinator', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'MENTOR':
        return { label: 'Academic Mentor', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'STUDENT':
        return { label: 'Student', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(user.role);

  const getRoleHomePath = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin?tab=overview';
      case 'PROGRAM_COORDINATOR':
        return '/program-coordinator?tab=overview';
      case 'FACULTY':
        return '/faculty?tab=home';
      case 'MENTOR':
        return '/mentor?tab=overview';
      case 'STUDENT':
        return '/student?tab=dashboard';
      default:
        return '/';
    }
  };

  const roleHomePath = getRoleHomePath(user.role);

  // Navigation Items per Role
  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { label: 'Home', href: '/admin?tab=overview', icon: Home, tab: 'overview' },
          { label: 'User Management', href: '/admin/users', icon: Users },
          { label: 'Learner Management', href: '/admin/users?role=STUDENT', icon: GraduationCap },
          { label: 'Course Coordinator Management', href: '/admin/users?role=FACULTY', icon: UserCheck },
          { label: 'Programme Management', href: '/admin/programs', icon: FolderKanban },
          { label: 'Course Management', href: '/admin/courses', icon: BookOpen },
          { label: 'Academic Year & Semesters', href: '/admin?tab=academic-years', icon: Calendar, tab: 'academic-years' },
          { label: 'Study Centre Management', href: '/admin?tab=study-centres', icon: Building2, tab: 'study-centres' },
          { label: 'Announcements', href: '/admin?tab=announcements', icon: Bell, tab: 'announcements' },
          { label: 'Reports', href: '/admin?tab=reports', icon: BarChart3, tab: 'reports' },
          { label: 'Audit Logs', href: '/admin?tab=audit-logs', icon: Shield, tab: 'audit-logs' },
          { label: 'Settings', href: '/admin?tab=settings', icon: Settings, tab: 'settings' },
        ];
      case 'PROGRAM_COORDINATOR':
        return [
          { label: 'Home', href: '/program-coordinator?tab=overview', icon: Home, tab: 'overview' },
          { label: 'Course Management', href: '/program-coordinator?tab=papers', icon: BookOpen, tab: 'papers' },
          { label: 'Detailed Syllabi', href: '/program-coordinator?tab=syllabus', icon: BookMarked, tab: 'syllabus' },
          { label: 'Course Coordinator Allocation', href: '/program-coordinator?tab=assign-faculty', icon: UserCheck, tab: 'assign-faculty' },
          { label: 'Class Schedule', href: '/program-coordinator?tab=schedule', icon: Calendar, tab: 'schedule' },
          { label: 'Assignment Management', href: '/program-coordinator?tab=assignments', icon: FileText, tab: 'assignments' },
          { label: 'Resource Interaction', href: '/program-coordinator?tab=discussions', icon: MessageSquare, tab: 'discussions' },
          { label: 'Announcements & Calendar', href: '/program-coordinator?tab=announcements', icon: Bell, tab: 'announcements' },
          { label: 'E-Tutorial', href: '/program-coordinator?tab=materials', icon: FolderArchive, tab: 'materials' },
          { label: 'Learner Monitoring', href: '/program-coordinator?tab=learners', icon: GraduationCap, tab: 'learners' },
          { label: 'Attendance Verification', href: '/program-coordinator?tab=attendance', icon: Calendar, tab: 'attendance' },
          { label: 'Internal Marks Verification', href: '/program-coordinator?tab=assessments', icon: CheckSquare, tab: 'assessments' },
          { label: 'Reports', href: '/program-coordinator?tab=reports', icon: BarChart3, tab: 'reports' },
          { label: 'Coordinator Profile', href: '/program-coordinator?tab=profile', icon: User, tab: 'profile' },
        ];
      case 'FACULTY':
        return [
          { label: 'Home', href: '/faculty?tab=home', icon: Home, tab: 'home' },
          { label: 'Course Material', href: '/faculty?tab=resources', icon: BookOpen, tab: 'resources' },
          { label: 'Assignments', href: '/faculty?tab=assignments', icon: FileText, tab: 'assignments' },
          { label: 'Assessment', href: '/faculty?tab=assessments', icon: CheckSquare, tab: 'assessments' },
          { label: 'Internal Marks', href: '/faculty?tab=marks', icon: Award, tab: 'marks' },
          { label: 'Attendance', href: '/faculty?tab=attendance', icon: UserCheck, tab: 'attendance' },
          { label: 'Class Schedule', href: '/faculty?tab=schedule', icon: Calendar, tab: 'schedule' },
          { label: 'Announcements', href: '/faculty?tab=announcements', icon: Bell, tab: 'announcements' },
          { label: 'Resource Interaction', href: '/faculty?tab=discussions', icon: MessageSquare, tab: 'discussions' },
          { label: 'Student Performance', href: '/faculty?tab=performance', icon: BarChart3, tab: 'performance' },
          { label: 'Profile', href: '/faculty?tab=profile', icon: User, tab: 'profile' },
        ];
      case 'MENTOR':
        return [
          { label: 'Home', href: '/mentor?tab=overview', icon: Home, tab: 'overview' },
          { label: 'My Mentees (10 Students)', href: '/mentor?tab=students', icon: GraduationCap, tab: 'students' },
          { label: 'Activity Tracker', href: '/mentor?tab=activities', icon: Activity, tab: 'activities' },
          { label: 'Academic Performance', href: '/mentor?tab=performance', icon: CheckSquare, tab: 'performance' },
          { label: 'Attendance Monitoring', href: '/mentor?tab=attendance', icon: Calendar, tab: 'attendance' },
          { label: 'Mentoring Sessions & Notes', href: '/mentor?tab=sessions', icon: UserCheck, tab: 'sessions' },
          { label: 'Learner Messages', href: '/mentor?tab=messages', icon: Send, tab: 'messages' },
        ];
      case 'STUDENT':
        return [
          { label: 'Home', href: '/student?tab=dashboard', icon: Home, tab: 'dashboard' },
          { label: 'Programmes & Courses', href: '/student?tab=my-program', icon: GraduationCap, tab: 'my-program' },
          { label: 'Fee Activity', href: '/student?tab=fee', icon: CreditCard, tab: 'fee' },
          { label: 'My Courses', href: '/student?tab=my-courses', icon: BookOpen, tab: 'my-courses' },
          { label: 'Learning Resources', href: '/student?tab=resources', icon: FolderArchive, tab: 'resources' },
          { label: 'Live Classes', href: '/student?tab=live-classes', icon: Video, tab: 'live-classes' },
          { label: 'Attendance & Participation', href: '/student?tab=attendance', icon: Calendar, tab: 'attendance' },
          { label: 'Discussion Forums', href: '/student?tab=forums', icon: MessageSquare, tab: 'forums' },
          { label: 'Assignments', href: '/student?tab=assignments', icon: FileText, tab: 'assignments' },
          { label: 'IGNOU TEE Assignments', href: '/student?tab=ignou-assignments', icon: FileCheck, tab: 'ignou-assignments' },
          { label: 'Assessments', href: '/student?tab=assessments', icon: CheckSquare, tab: 'assessments' },
          { label: 'Announcements & Circulars', href: '/student?tab=circulars', icon: Bell, tab: 'circulars' },
          { label: 'Messages', href: '/student?tab=messages', icon: Send, tab: 'messages' },
          { label: 'Mentoring', href: '/student?tab=mentoring', icon: UserCheck, tab: 'mentoring' },
          { label: 'Notifications', href: '/student?tab=notifications', icon: Bell, tab: 'notifications' },
          { label: 'Certificates', href: '/student?tab=certificates', icon: Award, tab: 'certificates' },
          { label: 'Support Tickets', href: '/student?tab=tickets', icon: HelpCircle, tab: 'tickets' },
          { label: 'Profile', href: '/student?tab=profile', icon: User, tab: 'profile' },
          { label: 'Contact Directory', href: '/student?tab=directory', icon: PhoneCall, tab: 'directory' },
        ];
      default:
        return [];
    }
  };


  const navItems = getNavItems();

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 border-r border-slate-800 shrink-0 h-full overflow-hidden">
        {/* Brand Logo & Name */}
        <Link
          href={roleHomePath}
          className="p-5 flex items-center gap-3 border-b border-slate-800 shrink-0 hover:bg-slate-800/40 transition-colors group"
          title="Go to Home"
        >
          <img
            src="/logo.png"
            alt="Periyar University Logo"
            className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow-md shrink-0 group-hover:scale-105 transition-transform"
          />
          <div>
            <h1 className="font-bold text-lg text-white leading-tight group-hover:text-sky-300 transition-colors">LMS Portal</h1>
            <p className="text-xs text-slate-400 font-medium">Periyar University</p>
          </div>
        </Link>

        {/* User Card in Sidebar */}
        <div className="p-4 mx-3 my-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sky-400 font-bold text-sm shrink-0 border border-slate-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${roleInfo.bg}`}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const defaultTab = user.role === 'ADMIN' ? 'overview' : user.role === 'PROGRAM_COORDINATOR' ? 'overview' : user.role === 'FACULTY' ? 'home' : user.role === 'MENTOR' ? 'overview' : 'dashboard';
            const isActive = item.tab
              ? pathname === item.href.split('?')[0] && (currentTab ? currentTab === item.tab : item.tab === defaultTab)
              : pathname === item.href && !currentTab;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setProfileModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-left"
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-rose-900/40 transition-all disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Periyar University Logo"
            className="w-9 h-9 object-contain rounded-full bg-white p-0.5 shrink-0"
          />
          <div>
            <span className="font-bold text-base text-white block leading-tight">LMS Portal</span>
            <span className="text-[10px] text-slate-400 block font-medium">Periyar University</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={roleHomePath}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950 text-sky-300 hover:bg-sky-900 text-xs font-bold border border-sky-800 transition-all"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-slate-900/95 backdrop-blur-md z-40 p-5 flex flex-col space-y-4 border-b border-slate-800 animate-in fade-in slide-in-from-top-4">
          <div className="p-3 bg-slate-800/80 rounded-xl flex items-center gap-3 border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sky-400 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 text-white text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-sky-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setProfileModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 text-white text-sm font-medium text-left"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-sky-400" />
                <span>Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </nav>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-950/60 text-rose-300 font-semibold text-sm border border-rose-900/50"
          >
            <LogOut className="w-5 h-5" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href={roleHomePath}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 transition-all shadow-sm group"
              title="Go to Home"
            >
              <Home className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                Welcome, {user.name} 👋
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Role: <span className="text-slate-700 font-semibold">{roleInfo.label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${roleInfo.bg}`}>
              {roleInfo.label}
            </span>

            <button
              onClick={() => setNotifModalOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-800">{user.name}</span>
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Username</span>
                <span className="font-semibold text-slate-800">@{user.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Account ID</span>
                <span className="font-mono text-xs text-slate-600">{user.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Account Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              </div>
            </div>

            <button
              onClick={() => setProfileModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Notification Drawer Modal */}
      {notifModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setNotifModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
              </div>
              <button
                onClick={async () => {
                  await markAllNotificationsAsReadAction();
                  const updated = await fetchNotificationsAction();
                  setNotifications(updated);
                }}
                className="text-xs font-semibold text-sky-600 hover:underline"
              >
                Mark All as Read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No notifications found.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      n.isRead ? 'bg-white border-slate-200' : 'bg-sky-50/80 border-sky-200 font-medium'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                    </div>
                    <p className="text-slate-600">{n.message}</p>
                    {!n.isRead && (
                      <button
                        onClick={async () => {
                          await markNotificationAsReadAction(n.id);
                          const updated = await fetchNotificationsAction();
                          setNotifications(updated);
                        }}
                        className="text-[11px] font-semibold text-sky-600 hover:underline pt-1 block"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setNotifModalOpen(false)}
              className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
