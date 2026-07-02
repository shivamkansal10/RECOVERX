import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

// Define frontend-only validation schema using Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      // Step 1: POST to /api/auth/login to get token
      const response = await axiosClient.post<{ token: string }>('/api/auth/login', {
        email: data.email,
        password: data.password,
      });

      const token = response.data.token;

      // Step 2: Bootstrap session using the token (saves it, calls GET /api/users/profile, and updates AuthContext)
      await login(token);

      // Step 3: Redirect to dashboard on success
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // Enforce the exact backend-specified validation error message
        setApiError('Invalid email or password');
      } else {
        setApiError(error.response?.data?.error || 'An unexpected error occurred. Please try again.');
      }
    }
  };

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
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Welcome back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Access your campus recovery dashboard.
          </p>
        </header>

        {/* Error Slot (Dynamically rendered based on API response) */}
        {apiError && (
          <div className="mb-6 p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded-lg flex items-center gap-3" id="error-slot">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <span className="font-label-md text-label-md text-error">{apiError}</span>
          </div>
        )}

        <form className="space-y-6" id="login-form" onSubmit={handleSubmit(onSubmit)}>
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

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <Link
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
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

          {/* Login Action Button */}
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
                <span>Logging in...</span>
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Footer / Registration */}
        <footer className="mt-10 space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative bg-surface-container-lowest px-4 text-caption font-caption text-on-surface-variant">
              New here?
            </div>
          </div>
          <button
            className="w-full bg-transparent border border-outline-variant text-primary font-label-md py-4 rounded-full hover:bg-surface-container-low transition-colors active:scale-[0.98] cursor-pointer"
            type="button"
            onClick={() => navigate('/register')}
          >
            Create an account
          </button>
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

export default LoginPage;
