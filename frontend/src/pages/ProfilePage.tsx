import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

// Zod schema for profile validation (fullName & phoneNumber required, non-blank)
const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Full name cannot be blank'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Phone number cannot be blank')
    .refine((val) => /^\d+$/.test(val), 'Phone number must contain only digits'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();

  // Query: Get current profile details, stripping password hash immediately
  const { data: profileUser, isLoading, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axiosClient.get<any>('/api/users/profile');
      // Destructure immediately to discard the password hash
      const { password, ...cleanedUser } = response.data;
      return cleanedUser;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
    },
  });

  // Re-sync form inputs when profileUser completes loading
  useEffect(() => {
    if (profileUser) {
      reset({
        fullName: profileUser.fullName,
        phoneNumber: profileUser.phoneNumber || '',
      });
    }
  }, [profileUser, reset]);

  // Mutation: Update profile (name & phone only)
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Send raw Map<String,String> containing only fullName and phoneNumber
      const payload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      };
      const response = await axiosClient.put<string>('/api/users/profile', payload);
      return response.data;
    },
    onSuccess: async (msg) => {
      // Show success toast
      toast.success(msg || 'Profile updated successfully.');
      
      // Refetch page query details
      await refetch();
      
      // Refresh user details in AuthContext so sidebar/topbar initials update
      await refreshUser();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Failed to update profile. Please try again.';
      toast.error(errMsg);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    if (profileUser) {
      reset({
        fullName: profileUser.fullName,
        phoneNumber: profileUser.phoneNumber || '',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-pulse text-left">
        <div className="h-6 bg-surface-container-high rounded w-24"></div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 space-y-6 h-64"></div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="bg-[#FFF5F5] border border-[#FFE0E0] rounded-2xl p-8 text-center text-error space-y-3 max-w-xl mx-auto">
        <span className="material-symbols-outlined text-[48px]">cloud_off</span>
        <div>
          <h3 className="font-headline-md text-headline-md font-bold">Failed to load profile details</h3>
          <p className="font-body-md text-body-md mt-1">
            Could not retrieve profile information from the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-left space-y-1">
        <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold">My Profile</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage your personal details and contact information.
        </p>
      </header>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-sm"
      >
        {/* Email Field (Disabled / Read-Only) */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wide">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={profileUser.email}
            disabled
            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-3 font-body-md text-[14px] text-on-surface-variant opacity-85 cursor-not-allowed select-none focus:outline-none"
          />
          <p className="text-caption font-caption text-on-surface-variant/70 ml-1">
            Email address cannot be changed.
          </p>
        </div>

        {/* Full Name Input */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            disabled={updateProfileMutation.isPending}
            {...register('fullName')}
            className={`w-full bg-surface border rounded-xl px-4 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all ${
              errors.fullName
                ? 'border-error focus:border-error focus:ring-error/5'
                : 'border-outline-variant focus:border-primary'
            }`}
          />
          {errors.fullName && (
            <p className="text-error font-caption text-caption ml-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="space-y-1.5">
          <label htmlFor="phoneNumber" className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="text"
            placeholder="e.g. 1234567890"
            disabled={updateProfileMutation.isPending}
            {...register('phoneNumber')}
            className={`w-full bg-surface border rounded-xl px-4 py-3 font-body-md text-[14px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all ${
              errors.phoneNumber
                ? 'border-error focus:border-error focus:ring-error/5'
                : 'border-outline-variant focus:border-primary'
            }`}
          />
          {errors.phoneNumber && (
            <p className="text-error font-caption text-caption ml-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateProfileMutation.isPending || !isDirty}
            className="flex-1 border border-outline-variant text-on-surface font-label-md py-3.5 rounded-xl hover:bg-surface-container transition-colors text-center cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateProfileMutation.isPending || !isDirty}
            className="flex-1 bg-primary text-on-primary font-label-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {updateProfileMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
