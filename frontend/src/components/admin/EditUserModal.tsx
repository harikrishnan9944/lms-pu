'use client';

import React, { useState, useEffect } from 'react';
import { updateUserAction } from '@/app/actions/userActions';
import { fetchProgramsAction } from '@/app/actions/lmsActions';
import { ProgramItem } from '@/lib/db';
import { UserRole, UserStatus } from '@/lib/auth';
import { X, Edit3, Mail, User, ShieldCheck, Phone, GraduationCap, BookOpen, Hash, Camera, Upload, Trash2, RefreshCw } from 'lucide-react';
import { Toast } from '../ui/Toast';

export interface EditUserModalProps {
  isOpen: boolean;
  user: {
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
    academicInfo?: string;
    imageUrl?: string;
  } | null;
  onClose: () => void;
  onUserUpdated: () => void;
  programs?: ProgramItem[];
}

export function EditUserModal({ isOpen, user, onClose, onUserUpdated, programs }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');

  // Photo state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Programs state for assignment dropdown
  const [programsList, setProgramsList] = useState<ProgramItem[]>(programs || []);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [isCustomProgramme, setIsCustomProgramme] = useState(false);

  // Additional fields
  const [qualification, setQualification] = useState('');
  const [programme, setProgramme] = useState('');
  const [subject, setSubject] = useState('');
  const [mobile, setMobile] = useState('');
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [address, setAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (programs && programs.length > 0) {
      setProgramsList(programs);
    } else if (isOpen) {
      setLoadingPrograms(true);
      fetchProgramsAction()
        .then((data) => {
          if (data && data.length > 0) {
            setProgramsList(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingPrograms(false));
    }
  }, [isOpen, programs]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setRole(user.role);
      setStatus(user.status);
      setQualification(user.qualification || '');
      setProgramme(user.programme || '');
      setSubject(user.subject || '');
      setMobile(user.mobile || '');
      setStudentId(user.studentId || '');
      setSemester(user.semester || 'Semester 1');
      setAddress(user.address || '');
      setImageUrl(user.imageUrl || '');
      setImagePreview(user.imageUrl || '');
      setIsCustomProgramme(false);
    }
  }, [user]);

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

  if (!isOpen || !user) return null;

  const selectedProgObj = programsList.find(
    (p) => p.name === programme || p.code === programme || (programme && (p.name.toLowerCase().includes(programme.toLowerCase()) || programme.toLowerCase().includes(p.name.toLowerCase())))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const result = await updateUserAction(user.id, {
        name,
        email,
        username,
        role,
        status,
        qualification,
        programme,
        subject,
        mobile,
        studentId,
        semester,
        address,
        imageUrl: imageUrl || '',
      });

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to update user.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onUserUpdated();
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
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit User Profile</h3>
            <p className="text-xs text-slate-500">Update information for {user.name}</p>
          </div>
        </div>

        {errorMsg && (
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload Section */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 p-3.5 rounded-xl border border-amber-200/60 flex flex-col sm:flex-row items-center gap-3.5">
            <div className="relative w-20 h-24 rounded-xl border-2 border-dashed border-amber-300 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm group">
              {imagePreview || imageUrl ? (
                <>
                  <img
                    src={imagePreview || imageUrl}
                    alt="Uploaded user preview"
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
                  className="cursor-pointer text-center p-2 flex flex-col items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"
                >
                  <Camera className="w-6 h-6 mb-1 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-600">ID Photo</span>
                </div>
              )}

              {isUploadingImage && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
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
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
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
                Official portrait photo for Digital ID Card (JPG, PNG, WEBP).
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <span className="text-slate-400 absolute left-3 top-2.5 text-sm font-semibold">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Role Fields */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Extended Information</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
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
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
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
                        } else {
                          setProgramme(e.target.value);
                        }
                      }}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 font-medium cursor-pointer"
                    >
                      {loadingPrograms ? (
                        <option value="">Loading created programmes...</option>
                      ) : (
                        <>
                          {/* If current assigned program doesn't strictly equal any program in list, preserve as option */}
                          {programme && !programsList.some((p) => p.name === programme || p.code === programme) && (
                            <option value={programme}>{programme} (Current)</option>
                          )}
                          {programsList.map((prog) => (
                            <option key={prog.id} value={prog.name}>
                              {prog.name} ({prog.code}) {prog.medium ? `— ${prog.medium}` : ''}
                            </option>
                          ))}
                          <option value="__custom__">✏️ + Enter Custom Programme Name</option>
                        </>
                      )}
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

            {(role === 'PROGRAM_COORDINATOR' || role === 'FACULTY' || role === 'MENTOR') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'STUDENT' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID / Register No.</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

