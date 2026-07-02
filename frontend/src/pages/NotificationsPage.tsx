import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import type { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Query: GET /api/notifications/my with polling interval of 30 seconds
  const { data: notifications = [], isLoading, error } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axiosClient.get<Notification[]>('/api/notifications/my');
      return response.data;
    },
    refetchInterval: 30000, // 30s polling
  });

  // Mutation: Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.put(`/api/notifications/${id}/read`);
    },
    // Optimistic Update for fast, premium feeling interaction
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          ['notifications'],
          previousNotifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
      return { previousNotifications };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      toast.error('Failed to mark notification as read.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation: Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axiosClient.put('/api/notifications/mark-all-read');
    },
    // Optimistic Update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          ['notifications'],
          previousNotifications.map((n) => ({ ...n, read: true }))
        );
      }
      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      toast.error('Failed to mark all notifications as read.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Unread Count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sorting: Unread first, then newest first (createdAt descending)
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1; // Unread (read=false) comes first
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold">Notifications</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Stay updated on your reported items and matching activities.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="border border-primary text-primary font-label-md px-5 py-2.5 rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 self-start sm:self-center cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[20px]">done_all</span>
            Mark All Read
          </button>
        )}
      </header>

      {/* Main List */}
      {isLoading ? (
        // Loading Skeletons
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 animate-pulse space-y-3"
            >
              <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
              <div className="h-3 bg-surface-container-high rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 text-center text-error space-y-3">
          <span className="material-symbols-outlined text-[48px]">cloud_off</span>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold">Failed to load notifications</h3>
            <p className="font-body-md text-body-md mt-1">
              There was an issue connecting to the server. Please try again.
              Please check if backend server is online.
            </p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        // Empty State per Stitch design
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[36px]">notifications_off</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary font-bold">All caught up!</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              You don't have any notifications right now.
            </p>
          </div>
        </div>
      ) : (
        // Notifications list
        <div className="space-y-3">
          {sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative border rounded-2xl p-5 flex items-start gap-4 transition-all shadow-sm ${
                notif.read
                  ? 'bg-surface-container-lowest border-outline-variant/60 opacity-85'
                  : 'bg-surface-container-lowest border-primary/30 pl-4 border-l-4 border-l-primary'
              }`}
            >
              {/* Left Indicator Icon */}
              <div className="mt-0.5 shrink-0">
                {notif.read ? (
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-[22px]">
                    drafts
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-primary text-[22px] font-bold">
                    mail
                  </span>
                )}
              </div>

              {/* Message, Time and Single Mark Read */}
              <div className="flex-1 space-y-2 text-left">
                <p className={`font-body-md text-[15px] leading-relaxed text-on-surface ${!notif.read ? 'font-semibold' : ''}`}>
                  {notif.message}
                </p>
                
                <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant/70 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  
                  {!notif.read && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notif.id)}
                      disabled={markAsReadMutation.isPending}
                      className="text-primary hover:underline font-label-md text-[13px] flex items-center gap-1 cursor-pointer select-none"
                    >
                      <span className="material-symbols-outlined text-[16px]">done</span>
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
