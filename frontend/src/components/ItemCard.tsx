import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthImage from './AuthImage';
import type { ItemResponse } from '../types';

interface ItemCardProps {
  item: ItemResponse;
}

export const getStatusBadgeClass = (itemStatus: string) => {
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

export const formatStatus = (itemStatus: string) => {
  return itemStatus.replace('_', ' ').toLowerCase();
};

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/items/${item.id}`)}
      className="bg-surface-container-lowest border border-outline-variant hover:border-primary/30 rounded-xl p-4 transition-all hover:shadow-md cursor-pointer flex flex-col group text-left"
    >
      {/* Auth-Aware Thumbnail Card Image */}
      <AuthImage
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-48 rounded-lg object-cover bg-surface mb-4 border border-outline-variant/30"
      />

      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">
              {item.category || 'Uncategorized'}
            </span>
            {/* Status Badge */}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider select-none shrink-0 ${getStatusBadgeClass(
                item.status
              )}`}
            >
              {formatStatus(item.status)}
            </span>
          </div>

          <h2 className="font-headline-md text-[18px] text-primary truncate group-hover:text-secondary transition-colors font-semibold">
            {item.title}
          </h2>

          <p className="font-body-md text-[14px] text-on-surface-variant line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Card Footer Detail */}
        <div className="border-t border-outline-variant/30 pt-3 flex items-center justify-between text-caption font-caption text-on-surface-variant/70">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">person</span>
            {item.reporterName}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
