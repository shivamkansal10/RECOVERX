import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 sm:p-8">
      <div className="max-w-md w-full bg-surface border border-outline-variant rounded-3xl p-8 text-center space-y-6 shadow-md transition-all">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-primary/70">
          <span className="material-symbols-outlined text-[36px] font-bold">
            explore_off
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="font-headline-md text-headline-md text-primary font-extrabold">
            Page Not Found
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Action Button (Conditional based on AuthContext only) */}
        <div className="pt-2">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full bg-primary text-on-primary font-label-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Back to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full bg-primary text-on-primary font-label-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
