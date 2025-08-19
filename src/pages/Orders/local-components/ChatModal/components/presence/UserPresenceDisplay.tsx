/**
 * Componente combinado de presença
 * Responsabilidade única: Combinar indicador visual e texto de presença
 */

import { PresenceIndicator } from './PresenceIndicator';
import { PresenceStatusText } from './PresenceStatusText';
import { UserPresenceStatus } from './types';

interface UserPresenceDisplayProps {
  status: UserPresenceStatus;
  isConnected: boolean;
  showUserName?: boolean;
  showIndicator?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UserPresenceDisplay({ 
  status, 
  isConnected,
  showUserName = false,
  showIndicator = true,
  showText = true,
  size = 'md'
}: UserPresenceDisplayProps) {
  return (
    <div className="flex items-center space-x-2">
      {showIndicator && (
        <PresenceIndicator 
          status={status}
          isConnected={isConnected}
          size={size}
        />
      )}
      
      {showText && (
        <PresenceStatusText 
          status={status}
          isConnected={isConnected}
          showUserName={showUserName}
        />
      )}
    </div>
  );
}
