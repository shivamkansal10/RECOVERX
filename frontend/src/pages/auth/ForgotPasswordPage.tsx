import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Validation schema for forgot password (email format check)
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSent, setIsSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setError(null);
    try {
      // POST to forgot-password passing the email as a QUERY PARAMETER (not a request body)
      await axiosClient.post(`/api/auth/forgot-password?email=${encodeURIComponent(data.email)}`);
      
      // Success (200): Switch to the success card
      setIsSent(true);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // Known backend leak: 404 is thrown if user is not found.
        // We catch this and show the SAME neutral success card to protect user privacy.
        setIsSent(true);
      } else {
        // Surface other server errors (e.g. database connection down, etc.)
        setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
      }
    }
  };

  if (isSent) {
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
              <span className="material-symbols-outlined text-green-600 text-[24px]">mark_email_read</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Check your email</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              If an account is associated with that email, we have sent password reset instructions.
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
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <span className="font-label-md text-label-md text-error">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">
              Email address
            </label>
            <input
              {...register('email')}
              className="w-full bg-surface text-on-surface font-body-md border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-on-surface-variant/50"
              id="email"
              placeholder="name@university.edu"
              type="email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-error text-caption mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-primary text-on-primary font-label-md py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending link...</span>
              </div>
            ) : (
              'Send reset link'
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
              Remembered your password?
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

export default ForgotPasswordPage;
