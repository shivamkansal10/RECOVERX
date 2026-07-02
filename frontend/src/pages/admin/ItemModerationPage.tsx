import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import AuthImage from '../../components/AuthImage';
import type { ItemResponse } from '../../types';

export const ItemModerationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState<{
    type: 'flag' | 'delete';
    itemId: number;
    itemTitle: string;
  } | null>(null);

  // Query: Fetch items (category, status, page, size, sort=createdAt,desc)
  const { data, isLoading, error, refetch } = useQuery<{
    content: ItemResponse[];
    totalPages: number;
    totalElements: number;
  }>({
    queryKey: ['adminItemsList', statusFilter, categoryFilter, page],
    queryFn: async () => {
      const response = await axiosClient.get<any>('/api/items', {
        params: {
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          page,
          size: pageSize,
          sort: 'createdAt,desc',
        },
      });
      return response.data;
    },
  });

  // Mutation: Flag Item
  const flagMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.post<string>(`/api/admin/items/${id}/flag`);
      return response.data;
    },
    onSuccess: (msg) => {
      toast.success(msg || 'Item marked as under review.');
      setModalConfig(null);
      // Invalidate and refetch queries to refresh the status badges
      queryClient.invalidateQueries({ queryKey: ['adminItemsList'] });
      refetch();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Failed to flag item.';
      toast.error(errMsg);
    },
  });

  // Mutation: Delete Item
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete<string>(`/api/admin/items/${id}`);
      return response.data;
    },
    onSuccess: (msg) => {
      toast.success(msg || 'Item successfully deleted.');
      setModalConfig(null);
      queryClient.invalidateQueries({ queryKey: ['adminItemsList'] });
      refetch();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Failed to delete item.';
      toast.error(errMsg);
    },
  });

  const handleActionConfirm = () => {
    if (!modalConfig) return;
    if (modalConfig.type === 'flag') {
      flagMutation.mutate(modalConfig.itemId);
    } else {
      deleteMutation.mutate(modalConfig.itemId);
    }
  };

  const isMutationPending = flagMutation.isPending || deleteMutation.isPending;

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
          Item Moderation
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Review, flag, and remove listings reported by campus users.
        </p>
      </header>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-wrap gap-4 items-center">
        {/* Category Filter */}
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label htmlFor="category" className="font-label-sm text-label-sm text-on-surface-variant/80 font-bold uppercase tracking-wider pl-1">
            Category
          </label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="bg-surface border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Keys">Keys</option>
            <option value="Wallets">Wallets</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label htmlFor="status" className="font-label-sm text-label-sm text-on-surface-variant/80 font-bold uppercase tracking-wider pl-1">
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="bg-surface border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="LOST">Lost</option>
            <option value="FOUND">Found</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="MATCHED">Matched</option>
          </select>
        </div>
      </div>

      {/* Moderation Table */}
      {isLoading ? (
        // Table Loading skeleton
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4">
          <div className="h-10 bg-surface-container rounded w-full animate-pulse"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-surface-container-low rounded w-full animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        // Error state
        <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 text-center text-error space-y-3">
          <span className="material-symbols-outlined text-[48px]">gpp_bad</span>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold">Failed to load items</h3>
            <p className="font-body-md text-body-md mt-1">
              There was an issue connecting to the server. Verify your administrator privileges.
            </p>
          </div>
        </div>
      ) : !data || data.content.length === 0 ? (
        // Empty State
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[36px]">inventory</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary font-bold">No reported items</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              There are no reported items matching the selected filters.
            </p>
          </div>
        </div>
      ) : (
        // Table content list
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/60">
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4 w-20">Photo</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4">Item Details</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4 w-32">Category</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-center p-4 w-36">Status</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-left p-4 w-28">Reporter ID</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-right p-4 w-32">Reported Date</th>
                  <th className="font-label-md text-label-md text-on-surface-variant text-center p-4 w-52">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Photo */}
                    <td className="p-4 align-middle">
                      <AuthImage
                        src={item.imageUrl || undefined}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg border border-outline-variant/50"
                      />
                    </td>

                    {/* Details */}
                    <td className="p-4 align-middle">
                      <div className="space-y-0.5">
                        <Link
                          to={`/items/${item.id}`}
                          className="font-body-md text-[14px] text-on-surface font-semibold hover:text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="font-body-sm text-body-sm text-on-surface-variant/80 line-clamp-1 max-w-sm">
                          {item.description}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="font-body-md text-[14px] text-on-surface-variant p-4 align-middle">
                      {item.category || 'Other'}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 align-middle text-center">
                      {item.status === 'LOST' && (
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-bold tracking-wider uppercase">
                          LOST
                        </span>
                      )}
                      {item.status === 'FOUND' && (
                        <span className="inline-block px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-[11px] font-bold tracking-wider uppercase">
                          FOUND
                        </span>
                      )}
                      {item.status === 'UNDER_REVIEW' && (
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[11px] font-bold tracking-wider uppercase">
                          UNDER REVIEW
                        </span>
                      )}
                      {item.status === 'MATCHED' && (
                        <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[11px] font-bold tracking-wider uppercase">
                          MATCHED
                        </span>
                      )}
                    </td>

                    {/* Reporter ID */}
                    <td className="font-body-md text-[14px] text-on-surface-variant p-4 align-middle">
                      {item.reporterId}
                    </td>

                    {/* Reported Date */}
                    <td className="font-caption text-caption text-on-surface-variant/80 text-right p-4 align-middle">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-middle text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* Flag button */}
                        <button
                          onClick={() =>
                            setModalConfig({
                              type: 'flag',
                              itemId: item.id,
                              itemTitle: item.title,
                            })
                          }
                          disabled={
                            isMutationPending ||
                            item.status === 'UNDER_REVIEW' ||
                            item.status === 'MATCHED'
                          }
                          className="border border-amber-300 text-amber-800 font-label-md text-[13px] px-3 py-1.5 rounded-lg hover:bg-amber-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Mark as under review and notify owner"
                        >
                          <span className="material-symbols-outlined text-[16px]">flag</span>
                          Flag
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() =>
                            setModalConfig({
                              type: 'delete',
                              itemId: item.id,
                              itemTitle: item.title,
                            })
                          }
                          disabled={isMutationPending}
                          className="border border-red-300 text-[#D32F2F] font-label-md text-[13px] px-3 py-1.5 rounded-lg hover:bg-[#FFF5F5] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Delete reported item permanently"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-t border-outline-variant/60">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing <strong className="text-on-surface">{page * pageSize + 1}</strong> to{' '}
                <strong className="text-on-surface">
                  {Math.min((page + 1) * pageSize, data.totalElements)}
                </strong>{' '}
                of <strong className="text-on-surface">{data.totalElements}</strong> items
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="border border-outline-variant text-on-surface font-label-md px-3.5 py-1.5 rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: data.totalPages }).map((_, idx) => (
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
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page === data.totalPages - 1}
                  className="border border-outline-variant text-on-surface font-label-md px-3.5 py-1.5 rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {modalConfig && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant max-w-md w-full rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in text-left">
            {/* Modal Icon and Title */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  modalConfig.type === 'flag'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-[#FFF5F5] text-[#D32F2F] border border-[#FFE0E0]'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {modalConfig.type === 'flag' ? 'flag' : 'delete'}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  {modalConfig.type === 'flag' ? 'Flag Item for Review' : 'Delete Listing Permanently'}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Item: <strong className="text-on-surface">{modalConfig.itemTitle}</strong>
                </p>
              </div>
            </div>

            {/* Modal Warning Text */}
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {modalConfig.type === 'flag'
                ? 'Are you sure you want to mark this item as under review? This will lock normal edit operations and dispatch a review warning email notification to the reporter.'
                : 'Are you sure you want to delete this reported item listing? This action is permanent and cannot be undone.'}
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalConfig(null)}
                disabled={isMutationPending}
                className="flex-1 border border-outline-variant text-on-surface font-label-md py-3 rounded-xl hover:bg-surface-container transition-colors text-center cursor-pointer select-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleActionConfirm}
                disabled={isMutationPending}
                className={`flex-1 text-on-primary font-label-md py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 ${
                  modalConfig.type === 'flag' ? 'bg-amber-600' : 'bg-red-600'
                }`}
              >
                {isMutationPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">done</span>
                    {modalConfig.type === 'flag' ? 'Yes, Flag Item' : 'Yes, Delete Item'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemModerationPage;
