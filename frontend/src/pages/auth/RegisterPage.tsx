import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

// Zod schema for registration validation (frontend-only safety net)
const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/\d/, 'Password must contain at least one number'),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // POST to backend register API
      await axiosClient.post('/api/auth/register', data);
      
      // On success (201): Discard the returned User entity (which contains the password hash),
      // show a success toast notification, and redirect to the login page.
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        // Map 409 Conflict to the email field as an inline error
        setError('email', {
          type: 'manual',
          message: error.response.data.error || 'Email is already in use',
        });
      } else {
        toast.error(error.response?.data?.error || 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-6 font-body">
      {/* Header / Brand */}
      <div className="mb-8 flex flex-col items-center gap-2">
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
        <header className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Create an account</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Register to join your campus recovery community.
          </p>
        </header>

        <form className="space-y-4" id="register-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name Field */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="fullName">
              Full name
            </label>
            <input
              {...register('fullName')}
              className="w-full bg-surface text-on-surface font-body-md border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-on-surface-variant/50"
              id="fullName"
              placeholder="John Doe"
              type="text"
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-error text-caption mt-1 pl-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
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

          {/* Phone Number Field */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="phoneNumber">
              Phone number
            </label>
            <input
              {...register('phoneNumber')}
              className="w-full bg-surface text-on-surface font-body-md border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-on-surface-variant/50"
              id="phoneNumber"
              placeholder="9876543210"
              type="text"
              disabled={isSubmitting}
            />
            {errors.phoneNumber && (
              <p className="text-error text-caption mt-1 pl-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                className="w-full bg-surface text-on-surface font-body-md border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-on-surface-variant/50 pr-12"
                id="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                disabled={isSubmitting}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]" id="password-toggle-icon">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-caption mt-1 pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            className="w-full bg-primary text-on-primary font-label-md py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create account'
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
              Already have an account?
            </div>
          </div>
          <button
            className="w-full bg-transparent border border-outline-variant text-primary font-label-md py-4 rounded-full hover:bg-surface-container-low transition-colors active:scale-[0.98] cursor-pointer"
            type="button"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        </footer>
      </main>

      {/* Support Links */}
      <div className="mt-10 flex gap-8">
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

export default RegisterPage;
