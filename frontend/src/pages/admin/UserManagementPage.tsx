import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface UserDetail {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export const UserManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset page on query update
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Query: Get all users from /api/admin/users
  const { data: users = [], isLoading, error } = useQuery<UserDetail[]>({
    queryKey: ['adminUsersList'],
    queryFn: async () => {
      const response = await axiosClient.get<any[]>('/api/admin/users');
      
      // =========================================================================
      // SECURITY VULNERABILITY ALERT:
      // The backend returns raw User entities including bcrypt password hashes.
      // There is no DTO or @JsonIgnore constraint blocking it on UserController.java.
      // We immediately strip this password field defensively before caching or rendering.
      // =========================================================================
      return response.data.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
    },
    retry: false,
  });

  // Client-side search filtering across fullName and email
  const filteredUsers = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [users, debouncedSearch]);

  // Client-side pagination calculations
  const totalElements = filteredUsers.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page]);

  return (
    <div className="space-y-6 text-left">
      {/* Header & Navigation */}
      <header className="space-y-1.5">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md select-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Admin Center
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold pt-2">
          User Management
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Overview of registered campus users, roles, and registration dates.
        </p>
      </header>

      {/* Search Bar Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-xl pl-11 pr-4 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 transition-all"
          />
        </div>
      </div>

      {/* Main Table view */}
      {isLoading ? (
        // Loading Skeleton
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
          <div className="h-10 bg-surface-container rounded w-full animate-pulse"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-surface-container-low rounded w-full animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        // Error state
        <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 text-center text-error space-y-3">
          <span className="material-symbols-outlined text-[48px]">gpp_bad</span>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold">Failed to load users</h3>
            <p className="font-body-md text-body-md mt-1">
              There was an issue connecting to the server. Please verify you are authenticated as an Administrator.
            </p>
          </div>
        </div>
      ) : totalElements === 0 ? (
        // Empty Search State
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[36px]">no_accounts</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary font-bold">No users found</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Try adjusting your search terms or verify registration status.
            </p>
          </div>
        </div>
      ) : (
        // Data list Table
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/60">
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4 w-16">ID</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4">Full Name</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4">Email</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4">Phone Number</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-center p-4 w-32">Role</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-right p-4 w-44">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginatedUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="font-body-sm text-body-sm text-on-surface-variant/80 p-4">{item.id}</td>
                    <td className="font-body-md text-[14px] text-on-surface font-semibold p-4">{item.fullName}</td>
                    <td className="font-body-md text-[14px] text-on-surface-variant p-4">{item.email}</td>
                    <td className="font-body-md text-[14px] text-on-surface-variant p-4">{item.phoneNumber || 'N/A'}</td>
                    <td className="p-4 text-center">
                      {item.role === 'ADMIN' ? (
                        <span className="inline-block px-3 py-1 bg-[#FFF5F5] text-[#D32F2F] border border-[#FFE0E0] rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm">
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm">
                          STUDENT
                        </span>
                      )}
                    </td>
                    <td className="font-caption text-caption text-on-surface-variant/80 text-right p-4">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-t border-outline-variant/60">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing <strong className="text-on-surface">{page * pageSize + 1}</strong> to{' '}
                <strong className="text-on-surface">
                  {Math.min((page + 1) * pageSize, totalElements)}
                </strong>{' '}
                of <strong className="text-on-surface">{totalElements}</strong> users
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="border border-outline-variant text-on-surface font-label-md px-3.5 py-1.5 rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    className={`font-label-md px-3.5 py-1.5 rounded-xl transition-all select-none cursor-pointer ${
                      page === idx
                        ? 'bg-primary text-on-primary font-bold shadow-sm'
                        : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="border border-outline-variant text-on-surface font-label-md px-3.5 py-1.5 rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
