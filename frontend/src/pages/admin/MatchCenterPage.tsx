import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import AuthImage from '../../components/AuthImage';
import type { ItemResponse } from '../../types';

export const MatchCenterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedLostId, setSelectedLostId] = useState<number | null>(null);
  const [selectedFoundId, setSelectedFoundId] = useState<number | null>(null);

  // Client-side search filters for pickers
  const [lostSearch, setLostSearch] = useState('');
  const [foundSearch, setFoundSearch] = useState('');

  // Query: Fetch all LOST items (page size 100)
  const { data: lostData, isLoading: isLoadingLost, error: errorLost } = useQuery<{
    content: ItemResponse[];
  }>({
    queryKey: ['matchLostItems'],
    queryFn: async () => {
      const response = await axiosClient.get<any>('/api/items', {
        params: { status: 'LOST', size: 100 },
      });
      return response.data;
    },
  });

  // Query: Fetch all FOUND items (page size 100)
  const { data: foundData, isLoading: isLoadingFound, error: errorFound } = useQuery<{
    content: ItemResponse[];
  }>({
    queryKey: ['matchFoundItems'],
    queryFn: async () => {
      const response = await axiosClient.get<any>('/api/items', {
        params: { status: 'FOUND', size: 100 },
      });
      return response.data;
    },
  });

  // Mutation: Confirm match pairing
  const confirmMatchMutation = useMutation({
    mutationFn: async ({ lostId, foundId }: { lostId: number; foundId: number }) => {
      // POST /api/admin/confirm-match?lostId={lostId}&foundId={foundId}
      const response = await axiosClient.post<string>('/api/admin/confirm-match', null, {
        params: { lostId, foundId },
      });
      return response.data;
    },
    onSuccess: (msg) => {
      toast.success(msg || 'Match successfully confirmed!');
      setSelectedLostId(null);
      setSelectedFoundId(null);
      // Invalidate queries so that matched items disappear
      queryClient.invalidateQueries({ queryKey: ['matchLostItems'] });
      queryClient.invalidateQueries({ queryKey: ['matchFoundItems'] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Failed to confirm match.';
      toast.error(errMsg);
    },
  });

  // Filter pickers list based on search query
  const filteredLostItems = useMemo(() => {
    const items = lostData?.content || [];
    const query = lostSearch.toLowerCase().trim();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
    );
  }, [lostData, lostSearch]);

  const filteredFoundItems = useMemo(() => {
    const items = foundData?.content || [];
    const query = foundSearch.toLowerCase().trim();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
    );
  }, [foundData, foundSearch]);

  // Selected item detail objects
  const selectedLostItem = useMemo(() => {
    return lostData?.content.find((i) => i.id === selectedLostId) || null;
  }, [lostData, selectedLostId]);

  const selectedFoundItem = useMemo(() => {
    return foundData?.content.find((i) => i.id === selectedFoundId) || null;
  }, [foundData, selectedFoundId]);

  const handleConfirmPairing = () => {
    if (selectedLostId === null || selectedFoundId === null) return;
    confirmMatchMutation.mutate({
      lostId: selectedLostId,
      foundId: selectedFoundId,
    });
  };

  const isPending = confirmMatchMutation.isPending;
  const isButtonDisabled = selectedLostId === null || selectedFoundId === null || isPending;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <header className="space-y-1.5">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md select-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Admin Center
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold pt-2">
          Match Settlement Center
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Pair reported lost items with found items to resolve matches and notify owners.
        </p>
      </header>

      {errorLost || errorFound ? (
        <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-3xl p-8 text-center text-error space-y-3">
          <span className="material-symbols-outlined text-[48px]">gpp_bad</span>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold">Authorization Error</h3>
            <p className="font-body-md text-body-md mt-1">
              Verify you have administrative rights or that the backend service is running.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Lost Items Picker (Span 4) */}
          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-sm space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pl-1">
              <h2 className="font-title-lg text-[18px] text-[#D32F2F] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                Lost Items Picker
              </h2>
              <span className="px-2.5 py-0.5 bg-[#FFF5F5] text-[#D32F2F] text-[11px] font-bold rounded-full border border-[#FFE0E0]">
                {filteredLostItems.length} listed
              </span>
            </div>

            {/* Filter */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search lost items..."
                value={lostSearch}
                onChange={(e) => setLostSearch(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl pl-9 pr-3 py-2 font-body-md text-[13px] text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingLost ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-16 bg-surface-container-low rounded-xl animate-pulse"></div>
                ))
              ) : filteredLostItems.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant/45">
                  <span className="material-symbols-outlined text-[36px]">find_in_page</span>
                  <p className="font-body-sm text-body-sm mt-1">No lost items available</p>
                </div>
              ) : (
                filteredLostItems.map((item) => {
                  const isSelected = selectedLostId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedLostId(isSelected ? null : item.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 select-none cursor-pointer ${
                        isSelected
                          ? 'border-[#D32F2F] bg-[#FFF5F5]/35 shadow-sm'
                          : 'border-outline-variant/60 hover:bg-surface-container-low/40 hover:border-outline-variant'
                      }`}
                    >
                      <AuthImage
                        src={item.imageUrl || undefined}
                        alt={item.title}
                        className="w-11 h-11 object-cover rounded-lg shrink-0 border border-outline-variant/40"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body-md text-[13px] text-on-surface font-semibold truncate">
                          {item.title}
                        </h4>
                        <span className="font-caption text-caption text-on-surface-variant/75 block">
                          ID: {item.id} • {item.category || 'Other'}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#D32F2F] text-[20px] font-bold shrink-0">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Found Items Picker (Span 4) */}
          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-sm space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pl-1">
              <h2 className="font-title-lg text-[18px] text-[#2E7D32] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Found Items Picker
              </h2>
              <span className="px-2.5 py-0.5 bg-[#F0FAF0] text-[#2E7D32] text-[11px] font-bold rounded-full border border-[#D0ECD0]">
                {filteredFoundItems.length} listed
              </span>
            </div>

            {/* Filter */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search found items..."
                value={foundSearch}
                onChange={(e) => setFoundSearch(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl pl-9 pr-3 py-2 font-body-md text-[13px] text-on-surface placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingFound ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-16 bg-surface-container-low rounded-xl animate-pulse"></div>
                ))
              ) : filteredFoundItems.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant/45">
                  <span className="material-symbols-outlined text-[36px]">find_in_page</span>
                  <p className="font-body-sm text-body-sm mt-1">No found items available</p>
                </div>
              ) : (
                filteredFoundItems.map((item) => {
                  const isSelected = selectedFoundId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedFoundId(isSelected ? null : item.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 select-none cursor-pointer ${
                        isSelected
                          ? 'border-[#2E7D32] bg-[#F0FAF0]/35 shadow-sm'
                          : 'border-outline-variant/60 hover:bg-surface-container-low/40 hover:border-outline-variant'
                      }`}
                    >
                      <AuthImage
                        src={item.imageUrl || undefined}
                        alt={item.title}
                        className="w-11 h-11 object-cover rounded-lg shrink-0 border border-outline-variant/40"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body-md text-[13px] text-on-surface font-semibold truncate">
                          {item.title}
                        </h4>
                        <span className="font-caption text-caption text-on-surface-variant/75 block">
                          ID: {item.id} • {item.category || 'Other'}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#2E7D32] text-[20px] font-bold shrink-0">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* MIDDLE / CONSOLE: Preview Panel & Confirm action (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Comparison Overview Container */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-sm space-y-6">
              <h3 className="font-title-lg text-[16px] text-primary font-bold pl-0.5">
                Match Comparison Console
              </h3>

              {selectedLostItem || selectedFoundItem ? (
                <div className="space-y-4">
                  {/* Left (Lost) Preview */}
                  {selectedLostItem && (
                    <div className="p-3.5 bg-[#FFF5F5]/30 border border-[#FFE0E0] rounded-2xl flex gap-3">
                      <AuthImage
                        src={selectedLostItem.imageUrl || undefined}
                        alt={selectedLostItem.title}
                        className="w-14 h-14 object-cover rounded-xl shrink-0 border border-[#FFE0E0]"
                      />
                      <div className="min-w-0">
                        <span className="px-2 py-0.5 bg-[#FFF5F5] text-[#D32F2F] text-[9px] font-bold rounded uppercase tracking-wider block w-fit mb-1 border border-[#FFE0E0]">
                          LOST
                        </span>
                        <h4 className="font-body-md text-[13px] text-on-surface font-bold truncate">
                          {selectedLostItem.title}
                        </h4>
                        <p className="font-caption text-caption text-on-surface-variant line-clamp-2 mt-0.5">
                          {selectedLostItem.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Icon Divider */}
                  {selectedLostItem && selectedFoundItem && (
                    <div className="flex justify-center items-center text-on-surface-variant/35">
                      <span className="material-symbols-outlined text-[24px]">swap_vert</span>
                    </div>
                  )}

                  {/* Right (Found) Preview */}
                  {selectedFoundItem && (
                    <div className="p-3.5 bg-[#F0FAF0]/30 border border-[#D0ECD0] rounded-2xl flex gap-3">
                      <AuthImage
                        src={selectedFoundItem.imageUrl || undefined}
                        alt={selectedFoundItem.title}
                        className="w-14 h-14 object-cover rounded-xl shrink-0 border border-[#D0ECD0]"
                      />
                      <div className="min-w-0">
                        <span className="px-2 py-0.5 bg-[#F0FAF0] text-[#2E7D32] text-[9px] font-bold rounded uppercase tracking-wider block w-fit mb-1 border border-[#D0ECD0]">
                          FOUND
                        </span>
                        <h4 className="font-body-md text-[13px] text-on-surface font-bold truncate">
                          {selectedFoundItem.title}
                        </h4>
                        <p className="font-caption text-caption text-on-surface-variant line-clamp-2 mt-0.5">
                          {selectedFoundItem.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-outline-variant/65 rounded-2xl text-on-surface-variant/40 space-y-2">
                  <span className="material-symbols-outlined text-[36px]">point_of_sale</span>
                  <p className="font-body-sm text-[13px]">
                    Select one lost item and one found item to verify similarities.
                  </p>
                </div>
              )}

              {/* Confirm Pairing Action Button */}
              <button
                type="button"
                onClick={handleConfirmPairing}
                disabled={isButtonDisabled}
                className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-on-primary font-label-md py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:pointer-events-none select-none"
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Executing Match...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">handshake</span>
                    Confirm Pairing Match
                  </>
                )}
              </button>
            </div>

            {/* Admin match safety brief */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/50 text-[12px] text-on-surface-variant leading-relaxed space-y-1">
              <strong className="text-on-surface block mb-0.5 font-bold uppercase tracking-wider text-[10px]">
                Administrative Rules
              </strong>
              <p>
                Confirming a match will instantly mark both listings as <strong>MATCHED</strong>.
              </p>
              <p>
                This automatically triggers email notifications to both users with their mutual contact information to facilitate return.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCenterPage;
