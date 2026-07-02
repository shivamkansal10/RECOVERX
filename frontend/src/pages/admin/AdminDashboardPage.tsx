import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export const AdminDashboardPage: React.FC = () => {
  // Query 1: Get total users from /api/admin/users
  const { data: usersCount = 0, isLoading: isLoadingUsers, error: errorUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await axiosClient.get<any[]>('/api/admin/users');
      // Instantly strip out password hashes for security compliance
      const cleanUsers = response.data.map(({ password, ...u }) => u);
      return cleanUsers.length;
    },
    retry: false,
  });

  // Query 2: Get total items count
  const { data: totalItems = 0, isLoading: isLoadingTotal, error: errorTotal } = useQuery({
    queryKey: ['adminTotalItems'],
    queryFn: async () => {
      const response = await axiosClient.get<any>('/api/items', {
        params: { size: 1 },
      });
      return response.data.totalElements;
    },
    retry: false,
  });

  // Query 3: Get items under review count
  const { data: underReviewCount = 0, isLoading: isLoadingReview, error: errorReview } = useQuery({
    queryKey: ['adminReviewItems'],
    queryFn: async () => {
      const response = await axiosClient.get<any>('/api/items', {
        params: { status: 'UNDER_REVIEW', size: 1 },
      });
      return response.data.totalElements;
    },
    retry: false,
  });

  // Query 4: Get items matched count
  const { data: matchedCount = 0, isLoading: isLoadingMatched, error: errorMatched } = useQuery({
    queryKey: ['adminMatchedItems'],
    queryFn: async () => {
      const response = await axiosClient.get<any>('/api/items', {
        params: { status: 'MATCHED', size: 1 },
      });
      return response.data.totalElements;
    },
    retry: false,
  });

  const isLoading = isLoadingUsers || isLoadingTotal || isLoadingReview || isLoadingMatched;
  const hasError = errorUsers || errorTotal || errorReview || errorMatched;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-6 bg-surface-container-high rounded w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-container rounded-2xl border border-outline-variant"></div>
          ))}
        </div>
        <div className="h-48 bg-surface-container rounded-2xl border border-outline-variant"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 text-center text-error space-y-3 max-w-xl mx-auto">
        <span className="material-symbols-outlined text-[48px]">gpp_bad</span>
        <div>
          <h3 className="font-headline-md text-headline-md font-bold">Admin Portal Authorization Error</h3>
          <p className="font-body-md text-body-md mt-1">
            You do not have administrative privileges to access this console or the backend database is unreachable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[28px] font-bold">
            admin_panel_settings
          </span>
          <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold">
            Admin Control Center
          </h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Platform statistics overview, moderation controls, and matching settlements.
        </p>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-label-sm text-[12px] text-on-surface-variant font-bold uppercase tracking-wider">
              Total Users
            </p>
            <h3 className="font-headline-lg text-[32px] text-primary font-extrabold">
              {usersCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-[26px]">group</span>
          </div>
        </div>

        {/* Total Items */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-label-sm text-[12px] text-on-surface-variant font-bold uppercase tracking-wider">
              Total Items
            </p>
            <h3 className="font-headline-lg text-[32px] text-primary font-extrabold">
              {totalItems}
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-[26px]">inventory_2</span>
          </div>
        </div>

        {/* Items Under Review */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-label-sm text-[12px] text-on-surface-variant font-bold uppercase tracking-wider">
              Under Review
            </p>
            <h3 className="font-headline-lg text-[32px] text-primary font-extrabold">
              {underReviewCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[26px]">gpp_maybe</span>
          </div>
        </div>

        {/* Items Matched */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-label-sm text-[12px] text-on-surface-variant font-bold uppercase tracking-wider">
              Items Matched
            </p>
            <h3 className="font-headline-lg text-[32px] text-primary font-extrabold">
              {matchedCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-[26px]">handshake</span>
          </div>
        </div>
      </div>

      {/* Moderation Controls / Quick-Links */}
      <section className="space-y-4">
        <h2 className="font-headline-md text-headline-md text-primary font-extrabold">
          Administrative Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Management Card */}
          <Link
            to="/admin/users"
            className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:border-primary transition-all text-left flex flex-col justify-between h-48 cursor-pointer select-none"
          >
            <div className="space-y-2">
              <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">
                manage_accounts
              </span>
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                User Management
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80">
                View system users list and access security privileges.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-bold text-primary group-hover:translate-x-1 transition-transform pt-4">
              Open Panel
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </Link>

          {/* Item Moderation Card */}
          <Link
            to="/admin/items"
            className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:border-primary transition-all text-left flex flex-col justify-between h-48 cursor-pointer select-none"
          >
            <div className="space-y-2">
              <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">
                gpp_bad
              </span>
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                Item Moderation
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80">
                Flag suspicious listings, delete inappropriate submissions.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-bold text-primary group-hover:translate-x-1 transition-transform pt-4">
              Open Panel
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </Link>

          {/* Match Settlement Card */}
          <Link
            to="/admin/match"
            className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:border-primary transition-all text-left flex flex-col justify-between h-48 cursor-pointer select-none"
          >
            <div className="space-y-2">
              <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform">
                fact_check
              </span>
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                Match Confirmations
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80">
                Approve match pairings and dispatch verification notifications.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-bold text-primary group-hover:translate-x-1 transition-transform pt-4">
              Open Panel
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
