/**
 * Componente MessageGroup para o Chat
 * Responsabilidade única: Agrupar mensagens consecutivas do mesmo usuário
 */

import { chatStyles, MessageType } from '../../styles';
import { Avatar } from './Avatar';

interface MessageData {
  id: string;
  content: string;
  timestamp: string;
}

interface MessageGroupProps {
  type: MessageType;
  messages: MessageData[];
  timestamp: string;
  sender?: {
    name: string;
    avatar: string;
  };
  showAvatar?: boolean;
}

export function MessageGroup({ 
  type, 
  messages, 
  timestamp, 
  sender, 
  showAvatar = true 
}: MessageGroupProps) {
  if (type === 'sent') {
    return (
      <div className={chatStyles.messages.sent.wrapper}>
        {messages.map((message, index) => (
          <div 
            key={message.id}
            className={`${chatStyles.messages.sent.content.bubble} ${
              index > 0 ? 'mt-2' : ''
            }`}
          >
            <p className={chatStyles.messages.sent.content.text}>
              {message.content}
            </p>
          </div>
        ))}
        <p className={chatStyles.messages.sent.content.timestamp}>
          {timestamp}
        </p>
      </div>
    );
  }

  return (
    <div className={chatStyles.messages.received.wrapper}>
      <div className={chatStyles.messages.received.messageGroup}>
        {showAvatar && sender && (
          <Avatar 
            src={sender.avatar} 
            alt={sender.name} 
            size="small" 
          />
        )}

        <div>
          {messages.map((message, index) => (
            <div 
              key={message.id}
              className={`${chatStyles.messages.received.content.bubble} ${
                index > 0 ? 'mt-2' : ''
              }`}
            >
              <p className={chatStyles.messages.received.content.text}>
                {message.content}
              </p>
            </div>
          ))}
          <p className={chatStyles.messages.received.content.timestamp}>
            {sender?.name}, {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
