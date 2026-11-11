'use client';

import React, { useState } from 'react';
import { deleteUserAction } from '@/app/actions/userActions';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Toast } from '../ui/Toast';

export interface DeleteUserModalProps {
  isOpen: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  } | null;
  onClose: () => void;
  onUserDeleted: () => void;
}

export function DeleteUserModal({ isOpen, user, onClose, onUserDeleted }: DeleteUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const result = await deleteUserAction(user.id);
      if (!result || !result.success) {
        setErrorMsg(result?.error || 'Failed to delete user account.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onUserDeleted();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
            <p className="text-xs text-rose-600 font-medium">Permanent Action</p>
          </div>
        </div>

        {errorMsg && (
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />
        )}

        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Are you sure you want to permanently delete the account for{' '}
            <strong className="text-slate-900 font-semibold">{user.name}</strong> (
            <span className="font-mono text-xs text-slate-700">@{user.username}</span>)?
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            <strong>Warning:</strong> This user will no longer be able to log in, and all associated account data will be removed.
          </div>
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
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Deleting...' : 'Delete User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
