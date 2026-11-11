'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchUsersAction, fetchMetricsAction, toggleUserStatusAction, autoAssignMentorsAction } from '@/app/actions/userActions';

import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { DeleteUserModal } from './DeleteUserModal';
import { UserRole, UserStatus } from '@/lib/auth';
import { AdminPrograms } from './AdminPrograms';
import { AdminCourses } from './AdminCourses';
import { AdminApplications } from './AdminApplications';
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Edit,
  KeyRound,
  Power,
  Eye,
  RefreshCw,
  Trash2,
  FolderKanban,
  FileCheck,
  Home,
  Sparkles,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/authActions';
import { Toast } from '../ui/Toast';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  qualification?: string;
  programme?: string;
  subject?: string;
  mobile?: string;
  studentId?: string;
  semester?: string;
  address?: string;
  imageUrl?: string;
  mentorId?: string;
  mentorName?: string;
  createdAt: string | Date;
}

export interface Metrics {
  totalUsers: number;
  programCoordinators: number;
  faculty: number;
  mentors?: number;
  students: number;
}

export interface UserManagementViewProps {
  initialMetrics: Metrics;
}

export function UserManagementView({ initialMetrics }: UserManagementViewProps) {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'users' | 'programs' | 'courses' | 'applications'>('users');
  const [userSubRole, setUserSubRole] = useState<'ALL' | 'ADMIN' | 'PROGRAM_COORDINATOR' | 'FACULTY' | 'MENTOR' | 'STUDENT'>(
    roleParam && ['ADMIN', 'PROGRAM_COORDINATOR', 'FACULTY', 'MENTOR', 'STUDENT'].includes(roleParam)
      ? (roleParam as any)
      : 'ALL'
  );
  const [isAssigningMentors, setIsAssigningMentors] = useState(false);

  useEffect(() => {
    if (roleParam && ['ADMIN', 'PROGRAM_COORDINATOR', 'FACULTY', 'MENTOR', 'STUDENT'].includes(roleParam)) {
      setUserSubRole(roleParam as any);
    }
  }, [roleParam]);

  useEffect(() => {
    if (tabParam && ['users', 'programs', 'courses', 'applications'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [programmeFilter, setProgrammeFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const effectiveRoleFilter = userSubRole !== 'ALL' ? userSubRole : roleFilter;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, metricsRes] = await Promise.all([
        fetchUsersAction({
          page: currentPage,
          limit,
          search,
          role: effectiveRoleFilter,
          status: statusFilter,
          programme: programmeFilter,
          semester: semesterFilter,
        }),
        fetchMetricsAction(),
      ]);

      setUsers(usersRes.users as UserItem[]);
      setTotalCount(usersRes.totalCount);
      setTotalPages(usersRes.totalPages);
      setMetrics(metricsRes);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load users data.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, search, effectiveRoleFilter, statusFilter, programmeFilter, semesterFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const result = await toggleUserStatusAction(user.id, user.status);
      if (result.success) {
        setToast({
          message: `Account status for ${user.name} changed to ${result.newStatus}.`,
          type: 'success',
        });
        loadData();
      } else {
        setToast({ message: result.error || 'Failed to update status.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error toggling status.', type: 'error' });
    }
  };

  const handleAutoAssignMentors = async () => {
    setIsAssigningMentors(true);
    try {
      const result = await autoAssignMentorsAction();
      if (result.success) {
        setToast({ message: result.message || 'Auto-assignment completed successfully!', type: 'success' });
        loadData();
      } else {
        setToast({ message: result.message || 'Failed to auto-assign mentors.', type: 'error' });
      }
    } catch (e: any) {
      setToast({ message: e.message || 'Error running mentor auto-assignment.', type: 'error' });
    } finally {
      setIsAssigningMentors(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Admin</span>;
      case 'PROGRAM_COORDINATOR':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Programme Coordinator</span>;
      case 'FACULTY':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Course Coordinator</span>;
      case 'MENTOR':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-200">Academic Mentor</span>;
      case 'STUDENT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Student</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{role}</span>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Inactive
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Main Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit, reset passwords, and manage all system user accounts.
          </p>
        </div>
        <Link
          href="/admin?tab=overview"
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
          title="Go to Home"
        >
          <Home className="w-3.5 h-3.5 text-sky-400" />
          <span>Home</span>
        </Link>
      </div>

      {/* Conditionally Render Active Tab Module */}
      {activeTab === 'programs' && <AdminPrograms />}
      {activeTab === 'courses' && <AdminCourses />}
      {activeTab === 'applications' && <AdminApplications />}

      {activeTab === 'users' && (
        <section id="users" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Sub-Navigation for User Roles */}
          <div className="bg-slate-900 text-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Filter by Role:</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setUserSubRole('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userSubRole === 'ALL'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setUserSubRole('ADMIN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userSubRole === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setUserSubRole('PROGRAM_COORDINATOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userSubRole === 'PROGRAM_COORDINATOR'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Programme Coordinator
              </button>
              <button
                onClick={() => setUserSubRole('FACULTY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userSubRole === 'FACULTY'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Course Coordinator
              </button>
              <button
                onClick={() => setUserSubRole('MENTOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userSubRole === 'MENTOR'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Mentor
              </button>
              <button
                onClick={() => setUserSubRole('STUDENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  userSubRole === 'STUDENT'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Student
              </button>
            </div>
          </div>

          {/* Section Top Header & Actions */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {userSubRole === 'ADMIN'
                  ? 'Admin Accounts Management'
                  : userSubRole === 'PROGRAM_COORDINATOR'
                  ? 'Programme Coordinator Management'
                  : userSubRole === 'FACULTY'
                  ? 'Course Coordinator Management'
                  : userSubRole === 'MENTOR'
                  ? 'Academic Mentor Management'
                  : userSubRole === 'STUDENT'
                  ? 'Student Management'
                  : 'User Management'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage accounts, roles, and automated 10-student mentor allocations
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleAutoAssignMentors}
                disabled={isAssigningMentors}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/30 transition-all"
                title="Automatically assign every 10 students to 1 mentor in sequential order"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAssigningMentors ? 'animate-spin' : ''}`} />
                <span>{isAssigningMentors ? 'Assigning...' : 'Auto-Assign Mentors (10/Mentor)'}</span>
              </button>

              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 transition-all self-start md:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New {userSubRole === 'ADMIN' ? 'Admin' : userSubRole === 'PROGRAM_COORDINATOR' ? 'Programme Coordinator' : userSubRole === 'FACULTY' ? 'Course Coordinator' : userSubRole === 'MENTOR' ? 'Mentor' : userSubRole === 'STUDENT' ? 'Student' : 'User'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row flex-wrap gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Name, Email, Username, or Register No..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Role Filter */}
            <div className="w-full sm:w-44">
              <select
                value={effectiveRoleFilter}
                onChange={(e) => {
                  setUserSubRole(e.target.value as any);
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="PROGRAM_COORDINATOR">Programme Coordinator</option>
                <option value="FACULTY">Course Coordinator</option>
                <option value="MENTOR">Mentor</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            {/* Programme Filter */}
            <div className="w-full sm:w-48">
              <select
                value={programmeFilter}
                onChange={(e) => {
                  setProgrammeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              >
                <option value="ALL">All Programmes</option>
                <option value="MCA">MCA</option>
                <option value="M.Sc. Computer Science">M.Sc. Computer Science</option>
                <option value="M.Sc. Data Science">M.Sc. Data Science</option>
                <option value="BCA">BCA</option>
                <option value="B.Sc. Computer Science">B.Sc. Computer Science</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            {/* Semester Filter */}
            <div className="w-full sm:w-40">
              <select
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              >
                <option value="ALL">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-36">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* User Management Table */}
          <div className="overflow-x-auto min-h-[300px] relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
                  <span>Loading users...</span>
                </div>
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Name / Handle</th>
                  <th className="py-3.5 px-6 font-semibold">Role</th>
                  <th className="py-3.5 px-6">Programme</th>
                  <th className="py-3.5 px-6">Semester / ID / Subject</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600 text-sm">No users found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                            {user.imageUrl ? (
                              <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-snug">{user.name}</p>
                            <p className="text-xs text-slate-500">@{user.username} • <span className="font-mono text-slate-400">{user.email}</span></p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">{getRoleBadge(user.role)}</td>

                      <td className="py-4 px-6 text-xs font-semibold text-sky-700">
                        {user.programme || 'MCA'}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-700">
                        {user.role === 'STUDENT' ? (
                          <div>
                            <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block mb-0.5">
                              {user.semester || 'Semester 1'}
                            </span>
                            {user.studentId && (
                              <p className="text-[11px] font-mono text-slate-500">Reg: {user.studentId}</p>
                            )}
                            {user.mentorName && (
                              <p className="text-[11px] text-teal-700 font-medium mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                                Mentor: {user.mentorName}
                              </p>
                            )}
                          </div>
                        ) : user.role === 'MENTOR' ? (
                          <div>
                            <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block mb-0.5">
                              Academic Mentor
                            </span>
                            {user.qualification && (
                              <p className="text-[11px] text-slate-500">{user.qualification}</p>
                            )}
                          </div>
                        ) : user.role === 'FACULTY' || user.role === 'PROGRAM_COORDINATOR' ? (
                          <div>
                            <span className="font-medium text-slate-800">{user.subject || 'Faculty Subject'}</span>
                            {user.qualification && (
                              <p className="text-[11px] text-slate-500">{user.qualification}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6">{getStatusBadge(user.status)}</td>

                      <td className="py-4 px-6 text-right relative">
                        <div className="inline-flex items-center gap-1">
                          {/* View Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'ACTIVE'
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setResetModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Bar */}
          <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-800">{users.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-800">{Math.min(currentPage * limit, totalCount)}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalCount}</span> registered users
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-medium text-slate-600 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={createModalOpen}
        defaultRole={userSubRole !== 'ALL' ? userSubRole : 'PROGRAM_COORDINATOR'}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={() => {
          setToast({ message: 'User account created successfully!', type: 'success' });
          loadData();
        }}
      />

      <EditUserModal
        isOpen={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={() => {
          setToast({ message: 'User details updated successfully!', type: 'success' });
          loadData();
        }}
      />

      <ResetPasswordModal
        isOpen={resetModalOpen}
        user={selectedUser}
        onClose={() => {
          setResetModalOpen(false);
          setSelectedUser(null);
        }}
        onPasswordReset={() => {
          setToast({ message: 'Password reset successfully!', type: 'success' });
        }}
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        user={selectedUser}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onUserDeleted={() => {
          setToast({ message: 'User account deleted successfully!', type: 'success' });
          loadData();
        }}
      />

      {/* View Details Modal */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-lg">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Username</span>
                <span className="font-semibold text-slate-800">@{selectedUser.username}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Role</span>
                <span>{getRoleBadge(selectedUser.role)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Account Status</span>
                <span>{getStatusBadge(selectedUser.status)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Registered Date</span>
                <span className="font-mono text-slate-700">{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-slate-600">{selectedUser.id}</span>
              </div>
            </div>

            <button
              onClick={() => setViewModalOpen(false)}
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
