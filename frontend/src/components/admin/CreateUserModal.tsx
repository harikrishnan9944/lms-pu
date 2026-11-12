'use client';

import React, { useState } from 'react';
import { createUserAction } from '@/app/actions/userActions';
import { fetchProgramsAction } from '@/app/actions/lmsActions';
import { ProgramItem } from '@/lib/db';
import { UserRole, UserStatus } from '@/lib/auth';
import { X, UserPlus, Eye, EyeOff, Lock, Mail, User, ShieldCheck, Phone, GraduationCap, BookOpen, Hash, Camera, Upload, Trash2, RefreshCw } from 'lucide-react';
import { Toast } from '../ui/Toast';

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  defaultRole?: UserRole;
  programs?: ProgramItem[];
}

export function CreateUserModal({ isOpen, onClose, onUserCreated, defaultRole = 'STUDENT', programs }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  
  // Image Upload state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Programs state for assignment dropdown
  const [programsList, setProgramsList] = useState<ProgramItem[]>(programs || []);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [isCustomProgramme, setIsCustomProgramme] = useState(false);

  // Additional Role Fields
  const [qualification, setQualification] = useState('');
  const [programme, setProgramme] = useState('MCA');
  const [subject, setSubject] = useState('');
  const [mobile, setMobile] = useState('');
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [address, setAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole, isOpen]);

  // Load programs dynamically when modal opens
  React.useEffect(() => {
    if (programs && programs.length > 0) {
      setProgramsList(programs);
      if (!programme || programme === 'MCA') {
        const mcaMatch = programs.find((p) => p.name.includes('MCA') || p.code === '010' || p.code === 'MCA');
        setProgramme(mcaMatch ? mcaMatch.name : programs[0].name);
      }
    } else if (isOpen) {
      setLoadingPrograms(true);
      fetchProgramsAction()
        .then((data) => {
          if (data && data.length > 0) {
            setProgramsList(data);
            if (!programme || programme === 'MCA') {
              const mcaMatch = data.find((p) => p.name.includes('MCA') || p.code === '010' || p.code === 'MCA');
              setProgramme(mcaMatch ? mcaMatch.name : data[0].name);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoadingPrograms(false));
    }
  }, [isOpen, programs]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const selectedProgObj = programsList.find(
    (p) => p.name === programme || p.code === programme || (programme && (p.name.toLowerCase().includes(programme.toLowerCase()) || programme.toLowerCase().includes(p.name.toLowerCase())))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const progCodeClean = (selectedProgObj?.code || programme).replace(/[^A-Za-z0-9]/g, '') || 'MCA';

      const result = await createUserAction({
        name,
        email,
        username,
        password,
        role,
        status,
        qualification: (role === 'PROGRAM_COORDINATOR' || role === 'FACULTY' || role === 'MENTOR') ? qualification : undefined,
        programme,
        subject: (role === 'PROGRAM_COORDINATOR' || role === 'FACULTY' || role === 'MENTOR') ? subject : undefined,
        mobile,
        studentId: role === 'STUDENT' ? (studentId.trim() || `PU2026${progCodeClean}${Math.floor(100 + Math.random() * 900)}`) : undefined,
        semester: role === 'STUDENT' ? semester : undefined,
        address: role === 'STUDENT' ? address : undefined,
        imageUrl: imageUrl || undefined,
      });

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to create user account.');
        setIsSubmitting(false);
        return;
      }

      // Reset form
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setQualification('');
      setSubject('');
      setMobile('');
      setStudentId('');
      setAddress('');
      setImageUrl('');
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setRole(defaultRole);
      setStatus('ACTIVE');
      setIsCustomProgramme(false);
      const defaultProg = programsList.length > 0 ? (programsList.find(p => p.name.includes('MCA'))?.name || programsList[0].name) : 'MCA';
      setProgramme(defaultProg);
      setIsSubmitting(false);
      onUserCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-inner">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Create New {role === 'ADMIN' ? 'Admin' : role === 'PROGRAM_COORDINATOR' ? 'Programme Coordinator' : role === 'FACULTY' ? 'Faculty' : role === 'MENTOR' ? 'Mentor' : 'Student'} User
            </h3>
            <p className="text-xs text-slate-500">Specify details for account registration & database sync</p>
          </div>
        </div>

        {errorMsg && (
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Dropdown & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="PROGRAM_COORDINATOR">Programme Coordinator</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Student / User Photo Upload Section */}
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50/40 p-3.5 rounded-xl border border-sky-100 flex flex-col sm:flex-row items-center gap-3.5">
            <div className="relative w-20 h-24 rounded-xl border-2 border-dashed border-sky-300 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm group">
              {imagePreview || imageUrl ? (
                <>
                  <img
                    src={imagePreview || imageUrl}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg transition-colors shadow"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-center p-2 flex flex-col items-center justify-center text-slate-400 hover:text-sky-600 transition-colors"
                >
                  <Camera className="w-6 h-6 mb-1 text-sky-500" />
                  <span className="text-[10px] font-bold text-slate-600">Upload Photo</span>
                </div>
              )}

              {isUploadingImage && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-sky-600 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {imagePreview || imageUrl ? 'Change Student Photo' : 'Upload Student Photo'}
                </button>
                {(imagePreview || imageUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Official portrait photo for Digital ID Card (JPG, PNG, WEBP). Max 5MB.
              </p>
            </div>
          </div>

          {/* Full Name & Mail (Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mail (Email) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@lms.edu"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3 top-2.5 text-sm font-semibold">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="priyacoord"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temporary Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password@123"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
              {role === 'ADMIN'
                ? 'Admin Profile Fields'
                : role === 'PROGRAM_COORDINATOR'
                ? 'Programme Coordinator Required Fields'
                : role === 'FACULTY'
                ? 'Faculty Profile Fields'
                : role === 'MENTOR'
                ? 'Academic Mentor Profile Fields'
                : 'Student Profile Fields'}
            </h4>

            {/* Programme Coordinator & Admin & Faculty & Mentor Fields: Qualification, Programme, Subject, Mobile */}
            {(role === 'ADMIN' || role === 'PROGRAM_COORDINATOR' || role === 'FACULTY' || role === 'MENTOR') && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. M.Tech, Ph.D. in CS"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Assigned Programme <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomProgramme(!isCustomProgramme)}
                        className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold underline underline-offset-2"
                      >
                        {isCustomProgramme ? 'Select from Created' : '+ Type Custom'}
                      </button>
                    </div>

                    {isCustomProgramme ? (
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={programme}
                          onChange={(e) => setProgramme(e.target.value)}
                          placeholder="e.g. Master of Computer Applications (MCA)"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <select
                          value={selectedProgObj ? selectedProgObj.name : programme}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomProgramme(true);
                              setProgramme('');
                            } else {
                              setProgramme(e.target.value);
                            }
                          }}
                          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 font-medium cursor-pointer"
                        >
                          {loadingPrograms ? (
                            <option value="">Loading created programmes...</option>
                          ) : programsList.length === 0 ? (
                            <option value="MCA (Master of Computer Applications)">MCA (Master of Computer Applications) - 010</option>
                          ) : (
                            programsList.map((prog) => (
                              <option key={prog.id} value={prog.name}>
                                {prog.name} ({prog.code}) {prog.medium ? `— ${prog.medium}` : ''}
                              </option>
                            ))
                          )}
                          <option value="__custom__">✏️ + Enter Custom Programme Name</option>
                        </select>
                      </div>
                    )}

                    {selectedProgObj && !isCustomProgramme && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-sky-800 bg-sky-50/80 px-2.5 py-1 rounded-lg border border-sky-200/60 font-medium">
                        <span className="font-bold">Code: {selectedProgObj.code}</span>
                        <span className="text-slate-300">•</span>
                        <span>Medium: {selectedProgObj.medium || 'English'}</span>
                        {selectedProgObj.eligibility && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[200px]" title={selectedProgObj.eligibility}>
                              {selectedProgObj.eligibility}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Software Architecture"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Assigned Programme <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomProgramme(!isCustomProgramme)}
                        className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold underline underline-offset-2"
                      >
                        {isCustomProgramme ? 'Select from Created' : '+ Type Custom'}
                      </button>
                    </div>

                    {isCustomProgramme ? (
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={programme}
                          onChange={(e) => setProgramme(e.target.value)}
                          placeholder="e.g. Master of Computer Applications (MCA)"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <select
                          value={selectedProgObj ? selectedProgObj.name : programme}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomProgramme(true);
                              setProgramme('');
                            } else {
                              setProgramme(e.target.value);
                            }
                          }}
                          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 font-medium cursor-pointer"
                        >
                          {loadingPrograms ? (
                            <option value="">Loading created programmes...</option>
                          ) : programsList.length === 0 ? (
                            <option value="MCA (Master of Computer Applications)">MCA (Master of Computer Applications) - 010</option>
                          ) : (
                            programsList.map((prog) => (
                              <option key={prog.id} value={prog.name}>
                                {prog.name} ({prog.code}) {prog.medium ? `— ${prog.medium}` : ''}
                              </option>
                            ))
                          )}
                          <option value="__custom__">✏️ + Enter Custom Programme Name</option>
                        </select>
                      </div>
                    )}

                    {selectedProgObj && !isCustomProgramme && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-sky-800 bg-sky-50/80 px-2.5 py-1 rounded-lg border border-sky-200/60 font-medium">
                        <span className="font-bold">Code: {selectedProgObj.code}</span>
                        <span className="text-slate-300">•</span>
                        <span>Medium: {selectedProgObj.medium || 'English'}</span>
                        {selectedProgObj.eligibility && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[200px]" title={selectedProgObj.eligibility}>
                              {selectedProgObj.eligibility}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Register No. / Student ID</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Salem, Tamil Nadu, India"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Creating User...' : `Create ${role === 'ADMIN' ? 'Admin' : role === 'PROGRAM_COORDINATOR' ? 'Programme Coordinator' : role === 'FACULTY' ? 'Faculty' : 'Student'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


