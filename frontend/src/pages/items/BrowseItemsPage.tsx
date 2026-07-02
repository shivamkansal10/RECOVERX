import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ItemCard from '../../components/ItemCard';
import type { ItemResponse, SpringPage } from '../../types';

// Curated list of categories for consistent data filtering
const CATEGORIES = [
  'Electronics',
  'Documents',
  'Keys',
  'Bags',
  'Clothing',
  'Other',
];

// Curated list of statuses matching backend ItemStatus
const STATUSES = [
  { value: 'LOST', label: 'Lost' },
  { value: 'FOUND', label: 'Found' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'MATCHED', label: 'Matched' },
];

export const BrowseItemsPage: React.FC = () => {
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const size = 6; // Display 6 items per page for a clean 3x2 grid

  // Backend note: GET /api/items is protected by Spring Security's .anyRequest().authenticated()
  // even though it represents a public catalog. This is flagged as a backend gap;
  // the page is secured behind ProtectedRoute for a clean frontend UX.
  const { data, isLoading, error, refetch } = useQuery<SpringPage<ItemResponse>>({
    queryKey: ['items', { category, status, page, size }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sort', 'createdAt,desc'); // Always retrieve latest items first

      const response = await axiosClient.get<SpringPage<ItemResponse>>(`/api/items?${params.toString()}`);
      return response.data;
    },
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(0); // Reset to page 0 on filter change
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(0); // Reset to page 0 on filter change
  };

  const handleClearFilters = () => {
    setCategory('');
    setStatus('');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header and Call to Action */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Browse Items</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Search reported lost and found items on campus.
          </p>
        </div>
        <Link
          to="/items/new"
          className="bg-primary text-on-primary font-label-md px-6 py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 self-start sm:self-center shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Report an Item
        </Link>
      </header>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Category Selector */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="category-select">
              Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={handleCategoryChange}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="status-select">
              Status
            </label>
            <select
              id="status-select"
              value={status}
              onChange={handleStatusChange}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-end self-end md:self-center md:pt-5">
          {(category || status) && (
            <button
              onClick={handleClearFilters}
              className="text-error font-label-md text-[14px] hover:underline flex items-center gap-1 py-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">clear</span>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* NOTE: No free-text title search box is built because ItemService.getItems does not support
          search keywords; the titleContains specification is dead code on the backend. */}

      {/* Main Grid View */}
      {isLoading ? (
        // Loading State: 6 Cards skeleton grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 animate-pulse space-y-4"
            >
              <div className="w-full h-48 bg-surface-container-high rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
                <div className="h-3 bg-surface-container-high rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-xl p-8 text-center space-y-4">
          <span className="material-symbols-outlined text-error text-[48px]">cloud_off</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-error">Failed to load items</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              There was an issue connecting to the server. Please check your connection and try again.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-error text-on-error font-label-md px-6 py-3 rounded-full hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Try Again
          </button>
        </div>
      ) : !data || data.content.length === 0 ? (
        // Empty State
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-[48px]">search_off</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary">No items found</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              There are no reports matching your selected filters. Try broadening your query or report a new item.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-full hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        // Item Grid Display
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.content.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="border-t border-outline-variant/30 pt-6 flex items-center justify-between">
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
    </div>
  );
};

export default BrowseItemsPage;
