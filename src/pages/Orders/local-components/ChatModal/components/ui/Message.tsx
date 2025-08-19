/**
 * Componente Message para o Chat
 * Responsabilidade única: Exibir uma mensagem individual do chat
 */

import { useMemo } from 'react';

interface MessageProps {
  type: 'sent' | 'received';
  content: string;
  timestamp: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  showAvatar?: boolean;
}

// Avatar background colors (mesmas do UserAvatar)
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

function generateColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function Message({ 
  type, 
  content, 
  timestamp, 
  sender, 
  showAvatar = true 
}: MessageProps) {
  const avatarData = useMemo(() => {
    if (!sender) return null;
    
    const initials = sender.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
      
    const backgroundColor = generateColor(sender.id || sender.name);
    
    return {
      initials,
      backgroundColor
    };
  }, [sender]);

  if (type === 'sent') {
    return (
      <div className="ml-auto max-w-[350px] text-right">
        <div className="ml-auto max-w-max rounded-lg rounded-tr-sm bg-brand-500 px-3 py-2 dark:bg-brand-500">
          <p className="text-sm text-white dark:text-white/90">
            {content}
          </p>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {timestamp}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[350px]">
      <div className="flex items-start gap-4">
        {showAvatar && sender && avatarData && (
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${avatarData.backgroundColor}`}>
            <span className="text-xs font-medium text-white">
              {avatarData.initials}
            </span>
          </div>
        )}

        <div>
          <div className="rounded-lg rounded-tl-sm bg-gray-100 px-3 py-2 dark:bg-white/5">
            <p className="text-sm text-gray-800 dark:text-white/90">
              {content}
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {sender?.name}, {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
