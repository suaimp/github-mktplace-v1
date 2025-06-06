import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface UserAvatarProps {
  userId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  onImageChange?: () => void;
  editable?: boolean;
}

// Avatar background colors
const AVATAR_COLORS = [
  'bg-brand-500',   // Blue
  'bg-success-500', // Green
  'bg-error-500',   // Red
  'bg-warning-500', // Orange
  'bg-purple-500',  // Purple
  'bg-pink-500',    // Pink
  'bg-cyan-500',    // Cyan
  'bg-amber-500',   // Amber
  'bg-emerald-500', // Emerald
  'bg-indigo-500',  // Indigo
];

// Get consistent color based on user ID
const getColorForUser = (userId: string) => {
  const charSum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[charSum % AVATAR_COLORS.length];
};

// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .filter((_, index, arr) => index === 0 || index === arr.length - 1)
    .join('')
    .toUpperCase();
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'w-8 h-8 text-sm';
    case 'lg':
      return 'w-16 h-16 text-xl';
    default:
      return 'w-12 h-12 text-base';
  }
};

export default function UserAvatar({ userId, name, size = 'md', onImageChange, editable = false }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTable, setUserTable] = useState<'admins' | 'platform_users' | null>(null);

  useEffect(() => {
    loadAvatar();
  }, [userId]);

  async function getUserTable(id: string): Promise<'admins' | 'platform_users'> {
    // Check if user exists in admins table
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (adminData) {
      return 'admins';
    }

    // If not admin, must be platform user
    return 'platform_users';
  }

  async function loadAvatar() {
    try {
      // First determine which table to use
      const table = await getUserTable(userId);
      setUserTable(table);

      // Then load avatar data
      const { data: avatarData } = await supabase
        .from(table)
        .select('avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (avatarData?.avatar_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(avatarData.avatar_url);
          
        setImageUrl(publicUrl);
      }
    } catch (err) {
      console.error('Error loading avatar:', err);
      setImageUrl(null);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userTable) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update user record
      const { error: updateError } = await supabase
        .from(userTable)
        .update({ avatar_url: fileName })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Reload avatar
      await loadAvatar();
      
      if (onImageChange) {
        onImageChange();
      }

    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = getSizeClasses(size);
  const bgColor = getColorForUser(userId);
  const initials = getInitials(name);

  return (
    <div className="relative group">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeClasses} ${bgColor} rounded-full flex items-center justify-center text-white font-medium`}>
          {initials}
        </div>
      )}

      {editable && (
        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
          <svg 
            className="w-6 h-6 text-white"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </label>
      )}

      {error && (
        <div className="absolute top-full mt-1 text-sm text-error-500">
          {error}
        </div>
      )}
    </div>
  );
}