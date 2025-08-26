/**
 * Componente Message para o Chat
 * Responsabilidade única: Exibir uma mensagem individual do chat
 */

import { ChatAvatar } from './ChatAvatar';
import { useUserAvatar } from '../../hooks/useUserAvatar';
import { useLogos } from '../../../../../../hooks/useLogos';

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

export function Message({ 
  type, 
  content, 
  timestamp, 
  sender, 
  showAvatar = true 
}: MessageProps) {
  // Hook para buscar dados do avatar do sender
  const { avatarData, isLoading: avatarLoading } = useUserAvatar({
    userId: sender?.id || '',
    userName: sender?.name || '',
    enabled: !!sender && showAvatar && type === 'received'
  });

  const { logos } = useLogos();

  if (type === 'sent') {
    return (
      <div className="ml-auto max-w-[350px] text-right">
        <div className="ml-auto max-w-[280px] rounded-lg rounded-tr-sm bg-brand-500 px-3 py-2 dark:bg-brand-500">
          <p className="text-sm text-white dark:text-white/90 break-words">
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
        {showAvatar && sender && (
          <>
            {avatarLoading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700" />
            ) : avatarData ? (
              <ChatAvatar 
                avatarData={avatarData} 
                size="md" 
              />
            ) : (
              // Fallback: Logo da plataforma se for Suporte, senão letra inicial
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                sender.name === 'Suporte' || sender.name === 'Admin' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 p-2' 
                  : 'bg-brand-500'
              }`}>
                {sender.name === 'Suporte' || sender.name === 'Admin' ? (
                  <img 
                    src={logos.icon || "/images/brand/brand-01.svg"} 
                    alt="Logo da Plataforma" 
                    className="w-6 h-6"
                    onError={(e) => {
                      // Fallback para caso a imagem não carregue
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <span class="text-white text-sm font-medium">S</span>
                      `;
                    }}
                  />
                ) : (
                  sender.name.charAt(0).toUpperCase()
                )}
              </div>
            )}
          </>
        )}

        <div>
          <div className="rounded-lg rounded-tl-sm bg-gray-100 px-3 py-2 dark:bg-white/5 max-w-[280px]">
            <p className="text-sm text-gray-800 dark:text-white/90 break-words">
              {content}
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {avatarData?.realName || sender?.name}, {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
