import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import type { Notification } from '../types';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Poll notifications GET /api/notifications/my every 30 seconds
  const { data: notifications = [], refetch } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axiosClient.get<Notification[]>('/api/notifications/my');
      return response.data;
    },
    refetchInterval: 30000, // 30 seconds polling interval
    enabled: !!user,
  });

  // Calculate unread count client-side using Lombok's serialized name 'read'
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await axiosClient.put(`/api/notifications/${id}/read`);
      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosClient.put('/api/notifications/mark-all-read');
      refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Helper to extract initials for user avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${
      isActive
        ? 'bg-primary text-on-primary shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
    }`;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body">
      {/* Topbar Header */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center justify-between px-6">
        {/* Left: Brand Logo */}
        <Link className="flex items-center gap-2" to="/">
          <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center relative shrink-0">
            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-secondary rounded-full"></div>
            <span className="material-symbols-outlined text-white text-[12px]">search</span>
          </div>
          <span className="font-headline-md text-headline-md tracking-tighter font-extrabold uppercase text-[18px]">
            RECOVERX
          </span>
        </Link>

        {/* Right: Actions (Notifications & Profile) */}
        <div className="flex items-center gap-4">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors relative cursor-pointer"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              type="button"
            >
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant hover:text-primary transition-colors">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-secondary text-white rounded-full flex items-center justify-center text-[10px] font-extrabold px-1 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 z-50">
                <header className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                  <h3 className="font-label-md text-label-md text-primary font-bold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-secondary hover:underline cursor-pointer font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </header>

                <div className="max-h-64 overflow-y-auto py-1">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 text-left transition-colors flex flex-col gap-1 border-b border-outline-variant/30 last:border-b-0 hover:bg-surface-container-low ${
                          !notif.read ? 'bg-surface-container/50' : ''
                        }`}
                      >
                        <p className="font-body-md text-[13px] leading-relaxed text-on-surface">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-on-surface-variant/70">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-[10px] text-primary hover:underline cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-caption text-on-surface-variant">
                      No notifications yet.
                    </div>
                  )}
                </div>

                <footer className="border-t border-outline-variant pt-2 mt-1">
                  <Link
                    to="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="block text-center text-xs text-primary hover:underline py-1.5 font-medium"
                  >
                    View all notifications
                  </Link>
                </footer>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              className="w-10 h-10 rounded-full bg-primary-fixed hover:bg-primary-fixed-dim transition-colors flex items-center justify-center font-bold text-primary font-label-md cursor-pointer border border-outline-variant"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              type="button"
            >
              {user ? getInitials(user.fullName) : 'U'}
            </button>

            {/* Profile Dropdown Popover */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 z-50">
                <div className="px-4 py-3 border-b border-outline-variant text-left">
                  <p className="font-label-md text-label-md text-primary font-bold truncate">
                    {user?.fullName || 'User Profile'}
                  </p>
                  <p className="font-caption text-caption text-on-surface-variant truncate">
                    {user?.email || ''}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-surface-container-low text-primary border border-outline-variant/50 rounded text-[10px] font-bold tracking-wider uppercase">
                    {user?.role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-left text-body-md text-[14px] text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors rounded-lg m-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    My Profile
                  </Link>
                  <Link
                    to="/profile/password"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-left text-body-md text-[14px] text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors rounded-lg m-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    Change Password
                  </Link>

                  {/* Switch to Admin Portal shortcut if user is Admin */}
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-left text-body-md text-[14px] text-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors rounded-lg m-1 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      Admin Portal
                    </Link>
                  )}
                </div>

                <div className="border-t border-outline-variant pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-[calc(100%-8px)] flex items-center gap-3 px-4 py-2.5 text-left text-body-md text-[14px] text-error hover:bg-error-container hover:text-on-error-container transition-colors rounded-lg m-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant p-4 shrink-0 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Dashboard
            </NavLink>
            <NavLink to="/items" className={navLinkClass}>
              <span className="material-symbols-outlined text-[20px]">search</span>
              Browse Items
            </NavLink>
            <NavLink to="/my-items" className={navLinkClass}>
              <span className="material-symbols-outlined text-[20px]">inventory</span>
              My Items
            </NavLink>
            <NavLink to="/items/new" className={navLinkClass}>
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Report Item
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass}>
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              Notifications
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              <span className="material-symbols-outlined text-[20px]">person</span>
              Profile
            </NavLink>
          </nav>

          {/* Footer brand info */}
          <div className="px-4 py-2 border-t border-outline-variant/30 text-left">
            <span className="text-[10px] text-on-surface-variant/50 block">
              RecoverX Lost & Found Platform
            </span>
            <span className="text-[10px] text-on-surface-variant/50">
              © 2026 Campus Recovery
            </span>
          </div>
        </aside>

        {/* Content Outlet Viewport */}
        <main className="flex-1 bg-surface overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
