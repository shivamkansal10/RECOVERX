import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import axiosClient from '../api/axiosClient';

// Zod schema for password validations
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/\d/, 'New password must contain at least one number'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Mutation: Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      // Send raw Map<String,String> containing oldPassword and newPassword
      const payload = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };
      const response = await axiosClient.put<string>('/api/users/password', payload);
      return response.data;
    },
    onSuccess: (msg) => {
      toast.success(msg || 'Password updated successfully.');
      reset();
      navigate('/profile');
    },
    onError: (err: any) => {
      if (err.response) {
        const { status, data } = err.response;
        
        // Map 400 "Current password does not match." specifically to the oldPassword input
        if (status === 400 && data && data.error === 'Current password does not match.') {
          setError('oldPassword', {
            type: 'server',
            message: data.error,
          });
          return;
        }
        
        const errMsg = data.error || 'Failed to update password. Please try again.';
        toast.error(errMsg);
      } else {
        toast.error('Network error. Please try again.');
      }
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-left space-y-1">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md select-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Profile
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold pt-2">
          Change Password
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Update your login password to keep your account secure.
        </p>
      </header>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-sm"
      >
        {/* Current Password Field */}
        <div className="space-y-1.5 relative">
          <label htmlFor="oldPassword" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Current Password
          </label>
          <div className="relative">
            <input
              id="oldPassword"
              type={showOldPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={changePasswordMutation.isPending}
              {...register('oldPassword')}
              className={`w-full bg-surface border rounded-xl pl-4 pr-11 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all ${
                errors.oldPassword
                  ? 'border-error focus:border-error focus:ring-error/5'
                  : 'border-outline-variant focus:border-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showOldPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.oldPassword && (
            <p className="text-error font-caption text-caption ml-1">{errors.oldPassword.message}</p>
          )}
        </div>

        {/* New Password Field */}
        <div className="space-y-1.5 relative">
          <label htmlFor="newPassword" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={changePasswordMutation.isPending}
              {...register('newPassword')}
              className={`w-full bg-surface border rounded-xl pl-4 pr-11 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all ${
                errors.newPassword
                  ? 'border-error focus:border-error focus:ring-error/5'
                  : 'border-outline-variant focus:border-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showNewPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-error font-caption text-caption ml-1">{errors.newPassword.message}</p>
          )}
          <p className="text-caption font-caption text-on-surface-variant/70 ml-1">
            Must be at least 8 characters long and contain at least one number.
          </p>
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-1.5 relative">
          <label htmlFor="confirmNewPassword" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmNewPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={changePasswordMutation.isPending}
              {...register('confirmNewPassword')}
              className={`w-full bg-surface border rounded-xl pl-4 pr-11 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all ${
                errors.confirmNewPassword
                  ? 'border-error focus:border-error focus:ring-error/5'
                  : 'border-outline-variant focus:border-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="text-error font-caption text-caption ml-1">{errors.confirmNewPassword.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
          <Link
            to="/profile"
            className="flex-1 border border-outline-variant text-on-surface font-label-md py-3.5 rounded-xl hover:bg-surface-container transition-colors text-center cursor-pointer select-none"
            style={{ pointerEvents: changePasswordMutation.isPending ? 'none' : 'auto' }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="flex-1 bg-primary text-on-primary font-label-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {changePasswordMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">lock_open</span>
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
