'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/actions/authActions';
import { UserRole } from '@/lib/auth';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  X,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Home,
  UserCheck,
} from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

interface RoleConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  defaultEmail: string;
  defaultPass: string;
  icon: React.ElementType;
  badgeBg: string;
  colorFrom: string;
  colorTo: string;
  hoverBorder: string;
  hoverGlow: string;
  btnBg: string;
  accentColor: string;
}

const ROLE_CARDS: RoleConfig[] = [
  {
    role: 'ADMIN',
    title: 'Admin Portal',
    subtitle: 'System Administration & Security',
    description: 'Manage users, role permissions, system configurations, password resets, and monitor system metrics.',
    defaultEmail: 'admin@lms.edu',
    defaultPass: 'Admin@123456',
    icon: ShieldCheck,
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    colorFrom: 'from-purple-500',
    colorTo: 'to-indigo-600',
    hoverBorder: 'hover:border-purple-500/60',
    hoverGlow: 'hover:shadow-purple-500/20',
    btnBg: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-purple-500/25',
    accentColor: 'text-purple-400',
  },
  {
    role: 'PROGRAM_COORDINATOR',
    title: 'Programme Coordinator',
    subtitle: 'Academic & Curriculum Control',
    description: 'Oversee degree programmes, manage course allocations, organize schedules, and track academic metrics.',
    defaultEmail: 'priya@lms.edu',
    defaultPass: 'Password@123',
    icon: Award,
    badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    colorFrom: 'from-sky-500',
    colorTo: 'to-blue-600',
    hoverBorder: 'hover:border-sky-500/60',
    hoverGlow: 'hover:shadow-sky-500/20',
    btnBg: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-sky-500/25',
    accentColor: 'text-sky-400',
  },
  {
    role: 'FACULTY',
    title: 'Course Coordinator Portal',
    subtitle: 'Course Materials, Assignments & Student Performance',
    description: 'Manage course materials, evaluate assignments & assessments, verify attendance, record internal marks, and track student performance.',
    defaultEmail: 'arun@lms.edu',
    defaultPass: 'Password@123',
    icon: BookOpen,
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    colorFrom: 'from-emerald-500',
    colorTo: 'to-teal-600',
    hoverBorder: 'hover:border-emerald-500/60',
    hoverGlow: 'hover:shadow-emerald-500/20',
    btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25',
    accentColor: 'text-emerald-400',
  },
  {
    role: 'MENTOR',
    title: 'Mentor Portal',
    subtitle: 'Mentee Guidance & Activity Tracking',
    description: 'Track assigned mentees (10 students per mentor in sequential order), monitor student activities, performance, and mentoring sessions.',
    defaultEmail: 'mentor@lms.edu',
    defaultPass: 'Password@123',
    icon: UserCheck,
    badgeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    colorFrom: 'from-teal-500',
    colorTo: 'to-emerald-600',
    hoverBorder: 'hover:border-teal-500/60',
    hoverGlow: 'hover:shadow-teal-500/20',
    btnBg: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-teal-500/25',
    accentColor: 'text-teal-400',
  },
  {
    role: 'STUDENT',
    title: 'Student Portal',
    subtitle: 'Learning Hub & Academic Records',
    description: 'View enrolled courses, access study materials, submit assignments, check attendance and results.',
    defaultEmail: 'karthik@lms.edu',
    defaultPass: 'Password@123',
    icon: GraduationCap,
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    colorFrom: 'from-amber-500',
    colorTo: 'to-orange-600',
    hoverBorder: 'hover:border-amber-500/60',
    hoverGlow: 'hover:shadow-amber-500/20',
    btnBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/25',
    accentColor: 'text-amber-400',
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const initialRoleParam = searchParams.get('role') as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRoleParam);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    urlError === 'inactive'
      ? 'Your account is currently inactive. Please contact the administrator.'
      : null
  );
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // When a role card is selected, pre-fill matching credentials automatically
  const handleSelectRoleCard = (roleConfig: RoleConfig) => {
    setSelectedRole(roleConfig.role);
    setIdentifier(roleConfig.defaultEmail);
    setPassword(roleConfig.defaultPass);
    setErrorMsg(null);
  };

  useEffect(() => {
    if (initialRoleParam) {
      const match = ROLE_CARDS.find((r) => r.role === initialRoleParam);
      if (match) {
        handleSelectRoleCard(match);
      }
    }
  }, [initialRoleParam]);

  const activeRoleConfig = ROLE_CARDS.find((r) => r.role === selectedRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('identifier', identifier);
    formData.append('password', password);
    if (selectedRole) {
      formData.append('role', selectedRole);
    }

    try {
      const result = await loginAction(null, formData);

      if (!result.success) {
        setErrorMsg(result.error || 'Invalid credentials.');
        setIsLoading(false);
        return;
      }

      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
  };

  const handleGoHome = () => {
    setSelectedRole(null);
    setErrorMsg(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-y-auto overflow-x-hidden font-sans">
      {/* Dynamic Background Lighting Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-lg mx-auto w-full z-10 my-auto py-4">
        {/* Top Navigation Bar with Home button */}
        <div className="flex items-center justify-between w-full mb-4 px-1">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 shadow-sm transition-all group"
            title="Go to Home / All Logins"
          >
            <Home className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Home (All Logins)</span>
          </button>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PU LMS Portal</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-4 ring-slate-900 mb-1">
            <img
              src="/logo.png"
              alt="Periyar University Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Periyar University LMS Portal
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-md">
            Enterprise Academic Portal • Select your role below to login
          </p>
        </div>

        {/* SCREEN 1: 4 ROLE CARDS VIEW (When no role card is selected yet) */}
        {!selectedRole || !activeRoleConfig ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Select Your Role Portal</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-800/60">
                <Home className="w-3 h-3" />
                <span>Home Portal</span>
              </span>
            </div>

            {/* Single Column Compact List Layout */}
            <div className="flex flex-col space-y-3">
              {ROLE_CARDS.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.role}
                    onClick={() => handleSelectRoleCard(card)}
                    className={`group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 ${card.hoverBorder} shadow-lg ${card.hoverGlow} rounded-xl p-3.5 transition-all duration-200 hover:scale-[1.01] relative flex items-center justify-between overflow-hidden`}
                  >
                    {/* Left Accent Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${card.colorFrom} ${card.colorTo}`} />

                    <div className="flex items-center gap-3.5 pl-2 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.colorFrom} ${card.colorTo} flex items-center justify-center text-white shadow-md shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                            {card.title}
                          </h2>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${card.badgeBg}`}>
                            {card.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {card.subtitle} • <span className="font-mono text-slate-500">{card.defaultEmail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform shrink-0 ml-3">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* SCREEN 2: LOGIN FORM FOR THE SELECTED ROLE CARD */
          <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Back to Home / Role Selection Navigation */}
            <div className="flex items-center justify-between mb-4 gap-2">
              <button
                type="button"
                onClick={handleGoHome}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-4 py-2.5 rounded-xl border border-sky-500/50 shadow-md shadow-sky-600/20 transition-all group"
                id="btn-login-home"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Home (All Logins)</span>
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch Role</span>
              </button>
            </div>

            {/* Login Card Box */}
            <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800 relative overflow-hidden">
              {/* Colored Indicator Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeRoleConfig.colorFrom} ${activeRoleConfig.colorTo}`} />

              {/* Selected Role Header */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${activeRoleConfig.colorFrom} ${activeRoleConfig.colorTo} flex items-center justify-center text-white shadow-lg shrink-0`}>
                    <activeRoleConfig.icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-white truncate">
                      {activeRoleConfig.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {activeRoleConfig.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1 shrink-0"
                  title="Return to Home / All Logins"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </button>
              </div>

              {errorMsg && (
                <div className="mb-5">
                  <Toast message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeRoleConfig.defaultEmail}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSuccess(false);
                        setForgotModalOpen(true);
                      }}
                      className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-lg ${activeRoleConfig.btnBg} transition-all disabled:opacity-50 mt-2`}
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to {activeRoleConfig.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Role Switcher Bar */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                  Switch Role Portal
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {ROLE_CARDS.map((card) => {
                    const isCurrent = card.role === selectedRole;
                    return (
                      <button
                        key={card.role}
                        type="button"
                        onClick={() => handleSelectRoleCard(card)}
                        className={`p-2 rounded-lg text-center transition-all text-xs font-semibold flex flex-col items-center justify-center ${
                          isCurrent
                            ? 'bg-slate-800 text-white ring-1 ring-slate-700'
                            : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                        }`}
                      >
                        <card.icon className={`w-4 h-4 mb-1 ${isCurrent ? card.accentColor : 'text-slate-500'}`} />
                        <span className="text-[10px] truncate max-w-full">
                          {card.role === 'PROGRAM_COORDINATOR' ? 'Coord' : card.role.charAt(0) + card.role.slice(1).toLowerCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Return to Home / All 4 Logins */}
                <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={handleGoHome}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors py-1 px-3 rounded-lg hover:bg-slate-800"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Return to Home (All Logins)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-slate-500 font-medium">
          Protected by LMS Server Security & Role-Based Access Control
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Password</h3>
                <p className="text-xs text-slate-400">Request password reset link</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">Request Received</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  If an account exists for <span className="font-medium text-sky-400">{forgotEmail}</span>, instructions have been sent to reset your password.
                </p>
                <button
                  onClick={() => setForgotModalOpen(false)}
                  className="mt-2 px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered academic email address. The system administrator will issue a reset token or password recovery instructions.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@lms.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
        Loading portal...
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}

