import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import type { ItemResponse, SpringPage, Notification } from '../types';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query 1: My Items (Fetch size 5, sorted by createdAt descending)
  const {
    data: myItemsPage,
    isLoading: isMyItemsLoading,
    error: myItemsError,
  } = useQuery<SpringPage<ItemResponse>>({
    queryKey: ['my-items', { page: 0, size: 5 }],
    queryFn: async () => {
      const response = await axiosClient.get<SpringPage<ItemResponse>>(
        '/api/items/my-items?page=0&size=5&sort=createdAt,desc'
      );
      return response.data;
    },
  });

  // Query 2: Notifications (Returns a plain array)
  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    error: notificationsError,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axiosClient.get<Notification[]>('/api/notifications/my');
      return response.data;
    },
  });

  // Mutation to mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.put(`/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Failed to update notification.');
    },
  });

  // Stat Card Metrics
  const totalReported = myItemsPage?.totalElements || 0;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  
  // "Items Matched" = client-side filter of my-items where status === "MATCHED"
  const matchedItemsCount = myItemsPage?.content.filter((item) => item.status === 'MATCHED').length || 0;

  // Recent notifications: client-side sorted by createdAt descending & sliced to first 5
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome / Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold">
            Welcome back, {user?.fullName || 'Student'}!
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Coordinate matches, view your items, and read system notifications.
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

      {/* Stat Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat Card 1: My Items */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-left flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
          </div>
          <div>
            <p className="text-caption font-label-md text-on-surface-variant uppercase tracking-wider">
              My Items Reported
            </p>
            <h3 className="text-[28px] font-bold text-primary mt-1">
              {isMyItemsLoading ? (
                <div className="h-8 w-12 bg-surface-container-high rounded animate-pulse"></div>
              ) : (
                totalReported
              )}
            </h3>
          </div>
        </div>

        {/* Stat Card 2: Items Matched */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-left flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-success/5 text-success rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-green-700">handshake</span>
          </div>
          <div>
            <p className="text-caption font-label-md text-on-surface-variant uppercase tracking-wider">
              Items Matched
            </p>
            <h3 className="text-[28px] font-bold text-primary mt-1">
              {isMyItemsLoading ? (
                <div className="h-8 w-12 bg-surface-container-high rounded animate-pulse"></div>
              ) : (
                matchedItemsCount
              )}
            </h3>
          </div>
        </div>

        {/* Stat Card 3: Unread Notifications */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-left flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-error/5 text-error rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-red-600">notifications_active</span>
          </div>
          <div>
            <p className="text-caption font-label-md text-on-surface-variant uppercase tracking-wider">
              Unread Notifications
            </p>
            <h3 className="text-[28px] font-bold text-primary mt-1">
              {isNotificationsLoading ? (
                <div className="h-8 w-12 bg-surface-container-high rounded animate-pulse"></div>
              ) : (
                unreadNotificationsCount
              )}
            </h3>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Recent Items */}
        <section className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-primary">Recent Items Reported</h2>
            <Link
              to="/items"
              className="text-primary font-label-md text-[14px] hover:underline flex items-center gap-1 select-none cursor-pointer"
            >
              View All
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {isMyItemsLoading ? (
            // Skeleton loader for recent items
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex gap-4 animate-pulse"
                >
                  <div className="w-24 h-24 bg-surface-container-high rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                    <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
                    <div className="h-3 bg-surface-container-high rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : myItemsError ? (
            <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-6 text-center text-error">
              Failed to load recent items.
            </div>
          ) : !myItemsPage || myItemsPage.content.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center space-y-4">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-[48px]">search_off</span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                You haven't reported any items yet.
              </p>
              <Link
                to="/items/new"
                className="bg-primary text-on-primary font-label-md px-5 py-2.5 rounded-xl hover:opacity-90 inline-block text-center cursor-pointer select-none"
              >
                Report your first item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myItemsPage.content.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Recent Notifications */}
        <section className="space-y-4 text-left">
          <h2 className="font-headline-md text-headline-md text-primary">Recent Notifications</h2>

          {isNotificationsLoading ? (
            // Skeleton loader for notifications
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 animate-pulse space-y-2"
                >
                  <div className="h-4 bg-surface-container-high rounded w-full"></div>
                  <div className="h-3 bg-surface-container-high rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : notificationsError ? (
            <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-6 text-center text-error">
              Failed to load notifications.
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-[48px] mb-3">
                notifications_off
              </span>
              <p className="font-body-md text-body-md">No notifications found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`border rounded-2xl p-4 flex items-start gap-4 transition-all shadow-sm ${
                    notif.read
                      ? 'bg-surface-container-lowest border-outline-variant/60 opacity-80'
                      : 'bg-surface-container-lowest border-primary/20 hover:border-primary/40'
                  }`}
                >
                  {/* Status marker */}
                  <div className="mt-1 shrink-0">
                    {notif.read ? (
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-[20px]">
                        drafts
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        mail
                      </span>
                    )}
                  </div>

                  {/* Message & Timestamp */}
                  <div className="flex-1 space-y-1.5">
                    <p className={`font-body-md text-[14px] leading-relaxed text-on-surface ${!notif.read ? 'font-semibold' : ''}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant/60">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      
                      {/* Mark as read button */}
                      {!notif.read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notif.id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-primary hover:underline font-label-md text-[12px] flex items-center gap-1 cursor-pointer"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
