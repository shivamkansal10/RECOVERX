import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import AuthImage from '../../components/AuthImage';
import type { ItemResponse } from '../../types';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch item details
  const { data: item, isLoading, error } = useQuery<ItemResponse>({
    queryKey: ['item', id],
    queryFn: async () => {
      const response = await axiosClient.get<ItemResponse>(`/api/items/${id}`);
      return response.data;
    },
    retry: false, // Do not auto-retry to prevent spamming 404s
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axiosClient.delete(`/api/items/${id}`);
    },
    // No automatic retries to prevent duplicate requests on non-idempotent endpoints
    retry: false,
    onSuccess: () => {
      toast.success('Item deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/my-items');
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Failed to delete the item.';
      toast.error(errMsg);
      // Suppress modal on failure
      setShowDeleteConfirm(false);
    },
  });

  // Check if current user is the owner
  const isOwner = item && user && item.reporterId === user.id;

  // Helper for status badge colors
  const getStatusBadgeClass = (itemStatus: string) => {
    switch (itemStatus.toUpperCase()) {
      case 'LOST':
        return 'bg-[#FFF5F5] border border-[#FFE0E0] text-[#BA1A1A]';
      case 'FOUND':
        return 'bg-[#F0FAF0] border border-[#D0ECD0] text-[#2E7D32]';
      case 'UNDER_REVIEW':
        return 'bg-[#FFF9E6] border border-[#FFE8B3] text-[#B27B00]';
      case 'MATCHED':
        return 'bg-[#F0F4FF] border border-[#D0E0FF] text-[#0043A6]';
      default:
        return 'bg-surface-container border border-outline-variant text-on-surface-variant';
    }
  };

  const formatStatus = (itemStatus: string) => {
    return itemStatus.replace('_', ' ').toLowerCase();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-surface-container-high rounded w-24"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="w-full aspect-[4/3] bg-surface-container-high rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-4 bg-surface-container-high rounded w-1/4"></div>
            <div className="h-8 bg-surface-container-high rounded w-3/4"></div>
            <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-surface-container-high rounded w-full"></div>
              <div className="h-3 bg-surface-container-high rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State or General Errors
  const is404 = error && (error as any).response?.status === 404;
  if (error || !item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
        <span className="material-symbols-outlined text-[64px] text-error">
          {is404 ? 'warning' : 'cloud_off'}
        </span>
        <div className="space-y-2 max-w-md">
          <h2 className="font-headline-md text-headline-md text-primary">
            {is404 ? 'Item report not found' : 'Failed to retrieve item details'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {is404
              ? 'The lost or found report you are looking for does not exist, or has been removed from the platform.'
              : 'There was an issue loading the details from the database. Please try again later.'}
          </p>
        </div>
        <Link
          to="/items"
          className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-full hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Browse Items
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumbs */}
      <nav className="flex items-center gap-2 text-caption font-caption text-on-surface-variant/70">
        <Link to="/items" className="hover:text-primary transition-colors">
          Browse Items
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface truncate max-w-[200px]">{item.title}</span>
      </nav>

      {/* Primary Detail Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Authentic image displaying */}
        <div className="space-y-4">
          <AuthImage
            src={item.imageUrl}
            alt={item.title}
            className="w-full aspect-video md:aspect-[4/3] rounded-2xl object-cover shadow-sm bg-surface-container border border-outline-variant"
          />
          {isOwner && (
            <Link
              to={`/items/${item.id}/upload`}
              className="w-full border border-primary text-primary font-label-md py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              {item.imageUrl ? 'Change Item Photo' : 'Upload Item Photo'}
            </Link>
          )}
        </div>

        {/* Right Column: Descriptions & Metadata details */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">
                {item.category || 'Uncategorized'}
              </span>
              <span
                className={`px-3 py-1 rounded text-caption font-bold uppercase tracking-wider ${getStatusBadgeClass(
                  item.status
                )}`}
              >
                {formatStatus(item.status)}
              </span>
            </div>
            <h1 className="font-headline-md text-[24px] text-primary leading-tight font-extrabold">
              {item.title}
            </h1>
            <div className="flex items-center gap-2 text-caption font-caption text-on-surface-variant/70">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span>Reported on {new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-2 border-t border-outline-variant/30 pt-4">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
              Description
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Reporter Details Block */}
          <div className="space-y-3 border-t border-outline-variant/30 pt-4">
            <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
              Reporter Details
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">
                  {item.reporterName ? item.reporterName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-body-md text-[14px] text-on-surface font-semibold">
                    {item.reporterName}
                  </p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {isOwner ? 'You reported this report' : 'Student/Reporter'}
                  </p>
                </div>
              </div>
              {isOwner && (
                <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed border border-outline-variant rounded text-[10px] font-bold uppercase select-none">
                  Owner
                </span>
              )}
            </div>
          </div>

          {/* Action buttons (Delete report option if owner) */}
          {isOwner && (
            <div className="border-t border-outline-variant/30 pt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-error-container text-on-error-container hover:bg-error-container/80 transition-colors font-label-md py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
                Delete Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !deleteMutation.isPending && setShowDeleteConfirm(false)}
          ></div>

          {/* Modal Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-headline-md text-[20px] font-bold text-primary">
                Delete Report?
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Are you sure you want to permanently delete this report? This action cannot be undone and will remove it from the public directory.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 border border-outline-variant text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                className="px-5 py-2.5 bg-error text-on-error font-label-md rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsPage;
