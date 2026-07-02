import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import axiosClient from '../../api/axiosClient';
import type { ItemResponse } from '../../types';

// Curated category list
const CATEGORIES = [
  'Electronics',
  'Documents',
  'Keys',
  'Bags',
  'Clothing',
  'Other',
];

// Zod form validation schema
const itemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  category: z.string().optional().or(z.literal('')),
  status: z.enum(['LOST', 'FOUND']),
});

type ItemFormValues = z.infer<typeof itemSchema>;

/**
 * Helper to detect Spring validation flat-map shape (no "error" key, only field errors)
 * and map them to React Hook Form field errors.
 */
const mapValidationErrors = (
  data: any,
  setError: (field: any, error: { type: string; message: string }) => void,
  validFields: string[]
): boolean => {
  if (data && typeof data === 'object' && !data.error) {
    let hasMapped = false;
    Object.keys(data).forEach((key) => {
      if (validFields.includes(key)) {
        setError(key as any, {
          type: 'server',
          message: typeof data[key] === 'string' ? data[key] : String(data[key]),
        });
        hasMapped = true;
      }
    });
    return hasMapped;
  }
  return false;
};

export const ReportItemPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      status: 'LOST',
    },
  });

  const selectedStatus = watch('status');

  // Mutation to create the item
  const createItemMutation = useMutation<ItemResponse, any, ItemFormValues>({
    mutationFn: async (data) => {
      // Map empty string category to undefined/null so backend receives clean optional string
      const payload = {
        ...data,
        category: data.category || undefined,
      };
      const response = await axiosClient.post<ItemResponse>('/api/items', payload);
      return response.data;
    },
    // Do not auto-retry this mutation to avoid submitting duplicate items on transient errors
    retry: false,
    onSuccess: (newItem) => {
      toast.success('Item reported successfully!');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Redirect to the newly created item details page
      navigate(`/items/${newItem.id}`);
    },
    onError: (err: any) => {
      // Check if this is a Spring validation flat-map exception: status 400 with field errors
      if (err.response && err.response.status === 400) {
        const data = err.response.data;
        const validFields = ['title', 'description', 'category', 'status'];
        if (mapValidationErrors(data, setError, validFields)) {
          return; // Errors successfully mapped to form inputs
        }
      }

      // Fallback: toast general errors (like status value violations or general exception payloads)
      const genericMsg = err.response?.data?.error || 'Failed to submit report. Please try again.';
      toast.error(genericMsg);
    },
  });

  const onSubmit = (data: ItemFormValues) => {
    createItemMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-left space-y-1">
        <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold">
          Report Lost or Found Item
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Add details about the item to help coordinate matching and return.
        </p>
      </header>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-sm"
      >
        {/* Status Segmented Control */}
        <div className="space-y-2">
          <label className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Report Type
          </label>
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl border border-outline-variant/30 select-none">
            <button
              type="button"
              onClick={() => setValue('status', 'LOST')}
              className={`py-3 rounded-lg font-label-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedStatus === 'LOST'
                  ? 'bg-surface-container-lowest text-error font-extrabold shadow-sm border border-outline-variant/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">report_problem</span>
              Lost Item
            </button>
            <button
              type="button"
              onClick={() => setValue('status', 'FOUND')}
              className={`py-3 rounded-lg font-label-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedStatus === 'FOUND'
                  ? 'bg-surface-container-lowest text-success font-extrabold shadow-sm border border-outline-variant/20'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Found Item
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Item Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Black Leather Wallet, Keys with Blue Fob"
            disabled={createItemMutation.isPending}
            {...register('title')}
            className={`w-full bg-surface border rounded-xl px-4 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all ${
              errors.title
                ? 'border-error focus:border-error focus:ring-error/5'
                : 'border-outline-variant focus:border-primary'
            }`}
          />
          {errors.title && (
            <p className="text-error font-caption text-caption ml-1">{errors.title.message}</p>
          )}
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Category
          </label>
          <select
            id="category"
            disabled={createItemMutation.isPending}
            {...register('category')}
            className={`w-full bg-surface border rounded-xl px-4 py-3 font-body-md text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all ${
              errors.category
                ? 'border-error focus:border-error focus:ring-error/5'
                : 'border-outline-variant focus:border-primary'
            }`}
          >
            <option value="">Select a category (optional)</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-error font-caption text-caption ml-1">{errors.category.message}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Description details
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe what the item looks like, where it was dropped or recovered, and any unique marks..."
            disabled={createItemMutation.isPending}
            {...register('description')}
            className={`w-full bg-surface border rounded-xl px-4 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all resize-y ${
              errors.description
                ? 'border-error focus:border-error focus:ring-error/5'
                : 'border-outline-variant focus:border-primary'
            }`}
          />
          {errors.description && (
            <p className="text-error font-caption text-caption ml-1">{errors.description.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
          <Link
            to="/items"
            className="flex-1 border border-outline-variant text-on-surface font-label-md py-3.5 rounded-xl hover:bg-surface-container transition-colors text-center cursor-pointer select-none"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createItemMutation.isPending}
            className="flex-1 bg-primary text-on-primary font-label-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {createItemMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">send</span>
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportItemPage;
