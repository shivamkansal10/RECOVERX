import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Zod schema for new password validation (frontend-only strength check)
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Read the token parameter from the URL on mount
  const token = searchParams.get('token');

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(
    !token ? 'No password reset token was provided. Please request a new link.' : null
  );
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setErrorState('No password reset token was provided. Please request a new link.');
      return;
    }

    setErrorState(null);

    try {
      // NOTE: Backend resolution:
      // The email containing this link is generated dynamically backend-side based on 
      // the request's Origin/Referer headers to prevent hardcoding localhost.

      // Submitting request:
      // Endpoint expects @RequestBody String newPassword, which requires sending a raw
      // JSON string literal (e.g. "myNewPassword123") with Content-Type: application/json.
      await axiosClient.post(
        `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
        JSON.stringify(data.newPassword),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Success (200): Switch to the success state
      setIsSuccess(true);
    } catch (err: any) {
      // Treat BOTH 404 (invalid token) and 500 (expired token) as "link expired or invalid"
      setErrorState('The password reset link is invalid or has expired. Please request a new one.');
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-6 font-body">
        {/* Header / Brand */}
        <div className="mb-12 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center relative">
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-secondary rounded-full"></div>
              <span className="material-symbols-outlined text-white text-[16px]">search</span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tighter font-extrabold uppercase">
              RECOVERX
            </span>
          </div>
        </div>

        {/* Success View Layout Card */}
        <main className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl p-8 md:p-10 auth-card text-center">
          <header className="mb-8">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <span className="material-symbols-outlined text-green-600 text-[24px]">lock_reset</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Password reset</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
          </header>

          <Link
            className="w-full block bg-primary text-on-primary font-label-md py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-sm text-center"
            to="/login"
          >
            Back to Login
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-6 font-body">
      {/* Header / Brand */}
      <div className="mb-12 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center relative">
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-secondary rounded-full"></div>
            <span className="material-symbols-outlined text-white text-[16px]">search</span>
          </div>
          <span className="font-headline-md text-headline-md tracking-tighter font-extrabold uppercase">
            RECOVERX
          </span>
        </div>
      </div>

      {/* Auth Layout Card */}
      <main className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl p-8 md:p-10 auth-card">
        <header className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Reset password</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter your new password below to update your credentials.
          </p>
        </header>

        {errorState && (
          <div className="mb-6 p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
            <div className="space-y-3">
              <span className="font-label-md text-label-md text-error block leading-relaxed">{errorState}</span>
              <Link
                to="/forgot-password"
                className="inline-block text-error font-label-md underline hover:opacity-85 text-xs"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* New Password Field */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="newPassword">
              New password
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                className="w-full bg-surface text-on-surface font-body-md border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-on-surface-variant/50 pr-12"
                id="newPassword"
                placeholder="••••••••"
                type={showNewPassword ? 'text' : 'password'}
                disabled={isSubmitting || !token}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1"
                onClick={() => setShowNewPassword(!showNewPassword)}
                type="button"
                disabled={!token}
              >
                <span className="material-symbols-outlined text-[20px]" id="password-toggle-icon">
                  {showNewPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-error text-caption mt-1 pl-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="confirmPassword">
              Confirm new password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                className="w-full bg-surface text-on-surface font-body-md border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-on-surface-variant/50 pr-12"
                id="confirmPassword"
                placeholder="••••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                disabled={isSubmitting || !token}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
                disabled={!token}
              >
                <span className="material-symbols-outlined text-[20px]" id="password-toggle-icon">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-error text-caption mt-1 pl-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-primary text-on-primary font-label-md py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            type="submit"
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating password...</span>
              </div>
            ) : (
              'Reset password'
            )}
          </button>
        </form>

        {/* Footer / Login Redirect */}
        <footer className="mt-8 space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative bg-surface-container-lowest px-4 text-caption font-caption text-on-surface-variant">
              Never mind?
            </div>
          </div>
          <Link
            className="w-full block text-center bg-transparent border border-outline-variant text-primary font-label-md py-4 rounded-full hover:bg-surface-container-low transition-colors active:scale-[0.98]"
            to="/login"
          >
            Back to Login
          </Link>
        </footer>
      </main>

      {/* Support Links */}
      <div className="mt-12 flex gap-8">
        <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
          Terms of Service
        </a>
        <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
          Privacy Policy
        </a>
        <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#">
          Campus Security
        </a>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
