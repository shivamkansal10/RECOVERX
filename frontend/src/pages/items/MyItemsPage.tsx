import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import AuthImage from '../../components/AuthImage';
import { getStatusBadgeClass, formatStatus } from '../../components/ItemCard';
import type { ItemResponse, SpringPage } from '../../types';

export const MyItemsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(0);
  const size = 5; // Clean page sizing

  const [itemToDelete, setItemToDelete] = useState<ItemResponse | null>(null);

  // Fetch my items
  const { data, isLoading, error } = useQuery<SpringPage<ItemResponse>>({
    queryKey: ['my-items', { page, size }],
    queryFn: async () => {
      const response = await axiosClient.get<SpringPage<ItemResponse>>(
        `/api/items/my-items?page=${page}&size=${size}&sort=createdAt,desc`
      );
      return response.data;
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await axiosClient.delete(`/api/items/${itemId}`);
    },
    retry: false,
    onSuccess: () => {
      toast.success('Item deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-items'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setItemToDelete(null);
    },
    onError: (err: any) => {
      // If 404 is returned, the item has already been deleted. Map to success behavior.
      if (err.response && err.response.status === 404) {
        toast.success('Item deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['my-items'] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setItemToDelete(null);
      } else {
        const errMsg = err.response?.data?.error || 'Failed to delete the item.';
        toast.error(errMsg);
      }
    },
  });

  // Reset scroll position on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold">My Items</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage your reported lost and found items.
          </p>
        </div>
        <Link
          to="/items/new"
          className="bg-primary text-on-primary font-label-md px-6 py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 self-start sm:self-center shadow-sm cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Report New Item
        </Link>
      </header>

      {/* Main Content */}
      {isLoading ? (
        // Skeleton loader
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-outline-variant/20">
              <div className="w-14 h-10 bg-surface-container-high rounded shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                <div className="h-3 bg-surface-container-high rounded w-1/4"></div>
              </div>
              <div className="w-12 h-6 bg-surface-container-high rounded shrink-0"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        // Error state
        <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 text-center space-y-4 text-error">
          <span className="material-symbols-outlined text-[48px]">cloud_off</span>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold">Failed to load your items</h3>
            <p className="font-body-md text-body-md mt-1">
              There was an issue connecting to the server. Please try again.
            </p>
          </div>
        </div>
      ) : !data || data.totalElements === 0 ? (
        // Empty state per Stitch design when totalElements === 0
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[36px]">inventory_2</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary font-bold">No reported items</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              You haven't reported any items in our campus community yet.
            </p>
          </div>
          <Link
            to="/items/new"
            className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-xl hover:opacity-90 inline-block text-center cursor-pointer select-none"
          >
            Report an Item Now
          </Link>
        </div>
      ) : (
        // Items list/table
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container/50 border-b border-outline-variant/60">
                  <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4">Photo</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4">Item Details</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4">Category</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4">Status</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4">Date Reported</th>
                  <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-lowest/55 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <AuthImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-10 rounded-lg object-cover bg-surface border border-outline-variant/20"
                      />
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="font-semibold text-primary">{item.title}</div>
                      <div className="text-[13px] text-on-surface-variant/80 line-clamp-1 max-w-xs">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle font-body-md text-[14px]">
                      {item.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider select-none ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle font-body-md text-[14px] text-on-surface-variant">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/items/${item.id}`}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                        <Link
                          to={`/items/${item.id}/upload`}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                          title="Upload Image"
                        >
                          <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        </Link>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-List View */}
          <div className="block md:hidden divide-y divide-outline-variant/30">
            {data.content.map((item) => (
              <div key={item.id} className="p-4 space-y-4">
                <div className="flex gap-4">
                  <AuthImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover bg-surface border border-outline-variant/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">
                        {item.category || 'Uncategorized'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider select-none ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </div>
                    <div className="font-semibold text-primary truncate">{item.title}</div>
                    <div className="text-caption text-on-surface-variant line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-caption text-on-surface-variant/70">
                  <span>Reported: {new Date(item.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/items/${item.id}`}
                      className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[12px] rounded-lg transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      to={`/items/${item.id}/upload`}
                      className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[12px] rounded-lg transition-colors"
                    >
                      Photo
                    </Link>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="px-3 py-1.5 bg-error-container/20 hover:bg-error-container/40 text-error font-label-md text-[12px] rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          {data.totalPages > 1 && (
            <div className="bg-surface-container/25 px-6 py-4 flex items-center justify-between border-t border-outline-variant/60">
              <button
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={data.first}
                className="bg-surface-container border border-outline-variant text-on-surface font-label-md px-4 py-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              <span className="font-label-md text-label-md text-on-surface-variant">
                Page {data.number + 1} of {data.totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(data.totalPages - 1, prev + 1))}
                disabled={data.last}
                className="bg-surface-container border border-outline-variant text-on-surface font-label-md px-4 py-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 text-left shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-headline-md text-headline-md text-primary font-bold">
              Confirm Delete
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Are you sure you want to delete <span className="font-semibold text-primary">"{itemToDelete.title}"</span>? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={deleteMutation.isPending}
                className="border border-outline-variant text-on-surface font-label-md px-5 py-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="bg-error text-on-error font-label-md px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Confirm Delete
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

export default MyItemsPage;
