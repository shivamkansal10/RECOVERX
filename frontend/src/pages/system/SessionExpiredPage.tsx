import React from 'react';
import { Link } from 'react-router-dom';

export const SessionExpiredPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 sm:p-8">
      <div className="max-w-md w-full bg-surface border border-outline-variant rounded-3xl p-8 text-center space-y-6 shadow-md transition-all">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl flex items-center justify-center mx-auto text-error">
          <span className="material-symbols-outlined text-[36px] font-bold">
            lock_clock
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="font-headline-md text-headline-md text-primary font-extrabold">
            Session Expired
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Your login session has expired. To protect your personal information and reported items, you have been securely logged out.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            to="/login"
            className="w-full bg-primary text-on-primary font-label-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">login</span>
            Return to Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredPage;
