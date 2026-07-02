import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

interface AuthImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const AuthImage: React.FC<AuthImageProps> = ({ src, alt, className }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setObjectUrl(null);
      return;
    }

    if (src.startsWith('http')) {
      setObjectUrl(src);
      setLoading(false);
      setError(false);
      return;
    }

    let active = true;
    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axiosClient.get(src, {
          responseType: 'blob',
        });
        if (active) {
          const url = URL.createObjectURL(response.data);
          setObjectUrl((prevUrl) => {
            // Revoke the old URL to prevent memory leaks
            if (prevUrl && prevUrl.startsWith('blob:')) {
              URL.revokeObjectURL(prevUrl);
            }
            return url;
          });
        }
      } catch (err) {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      active = false;
    };
  }, [src]);

  // Clean up remaining object URL when the component completely unmounts
  useEffect(() => {
    return () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (!src || error) {
    return (
      <div className={`bg-surface-container flex flex-col items-center justify-center text-on-surface-variant/40 ${className}`}>
        <span className="material-symbols-outlined text-[36px]">image_not_supported</span>
        <span className="text-[10px] font-caption mt-1">No Photo</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-surface-container flex items-center justify-center ${className}`}>
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return objectUrl ? (
    <img src={objectUrl} alt={alt} className={className} />
  ) : (
    <div className={`bg-surface-container ${className}`}></div>
  );
};

export default AuthImage;
