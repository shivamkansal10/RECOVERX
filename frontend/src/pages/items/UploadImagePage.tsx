import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import type { ItemResponse } from '../../types';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const UploadImagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Fetch item details to verify ownership
  const { data: item, isLoading: isItemLoading, error: itemError } = useQuery<ItemResponse>({
    queryKey: ['item', id],
    queryFn: async () => {
      const response = await axiosClient.get<ItemResponse>(`/api/items/${id}`);
      return response.data;
    },
    retry: false,
  });

  // Verify ownership once item loading finishes
  useEffect(() => {
    if (!isItemLoading && user) {
      if (itemError || !item) {
        toast.error('Could not fetch item details.');
        navigate('/items');
        return;
      }
      
      const isOwner = item.reporterId === user.id;
      if (!isOwner) {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [item, isItemLoading, user, itemError, navigate]);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    // Validate MIME type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG, GIF, WEBP) are allowed.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size (2MB)
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 2MB limit. Please upload a smaller image.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop an image file first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // POST to backend upload endpoint with longer timeout & progress tracking
      await axiosClient.post(`/api/items/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const percentage = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentage);
        },
      });

      toast.success('Image uploaded successfully!');
      
      // Invalidate cache for this item to show the new image immediately
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      
      navigate(`/items/${id}`);
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(null);

      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 400 && data && data.error === 'File Upload Error') {
          // Map backend custom FileStorageException payload onto file error state
          setError(data.message || 'File is empty.');
        } else if (status === 403) {
          // Toast 403 Forbidden details without forcing logout
          toast.error(data.error || 'You do not have permission to modify this item.');
        } else {
          const errMsg = data.error || 'Failed to upload photo. Please try again.';
          toast.error(errMsg);
        }
      } else {
        toast.error('Network error or request timeout. Please check your connection.');
      }
    }
  };

  if (isItemLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-surface-container-high rounded w-32"></div>
        <div className="h-[300px] bg-surface-container-high rounded-2xl"></div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <header className="text-left space-y-1">
        <Link
          to={`/items/${id}`}
          className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md select-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Item
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-primary font-extrabold pt-2">
          Upload Item Photo
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Add an authentic photo for "{item.title}" to help with identification and matches.
        </p>
      </header>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-sm"
      >
        {/* Upload Zone / Drop area */}
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-primary font-bold uppercase tracking-wide">
            Select Photo
          </label>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[220px] select-none ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Selected Preview"
                  className="max-h-[160px] object-contain rounded-lg shadow-sm border border-outline-variant/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setError(null);
                  }}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-label-md text-[13px] rounded-lg transition-colors cursor-pointer select-none"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center cursor-pointer">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/60">
                  cloud_upload
                </span>
                <div>
                  <label htmlFor="file-input" className="text-primary font-semibold hover:underline cursor-pointer">
                    Click to upload
                  </label>
                  <span className="text-on-surface-variant"> or drag and drop</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant/60">
                  PNG, JPG, JPEG, GIF or WEBP (Max 2MB)
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Form field error mapping */}
          {error && (
            <p className="text-error font-caption text-caption ml-1 mt-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && uploadProgress !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-caption font-label-md text-on-surface-variant">
              <span>Uploading photo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
          <Link
            to={`/items/${id}`}
            className="flex-1 border border-outline-variant text-on-surface font-label-md py-3.5 rounded-xl hover:bg-surface-container transition-colors text-center cursor-pointer select-none"
            style={{ pointerEvents: isUploading ? 'none' : 'auto' }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isUploading || !file}
            className="flex-1 bg-primary text-on-primary font-label-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">publish</span>
                Upload Photo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadImagePage;
