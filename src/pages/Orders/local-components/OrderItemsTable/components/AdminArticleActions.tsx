import React from 'react';
import { ExternalLinkIcon } from './Icons';
import { PencilIcon } from '../../../../../icons';
import { openExternalLink } from '../utils/fileActions';

interface AdminArticleActionsProps {
  url: string;
  onEdit: () => void;
  iconSize?: 'small' | 'medium' | 'large';
  className?: string;
}

export const AdminArticleActions: React.FC<AdminArticleActionsProps> = ({
  url,
  onEdit,
  iconSize = 'medium',
  className = ""
}) => {
  const handleExternalLink = () => {
    openExternalLink(url);
  };

  const iconSizeClass = iconSize === 'small' ? 'w-3 h-3' : iconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {/* External Link Icon */}
      <button
        onClick={handleExternalLink}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Abrir link externo"
      >
        <ExternalLinkIcon size={iconSize} />
      </button>

      {/* Edit Button - Only for Admin */}
      <button
        onClick={onEdit}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Editar URL"
      >
        <PencilIcon className={`${iconSizeClass} text-gray-500 hover:text-brand-500`} />
      </button>
    </div>
  );
};
