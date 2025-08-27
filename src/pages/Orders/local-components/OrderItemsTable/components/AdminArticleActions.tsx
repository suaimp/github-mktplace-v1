import React from 'react';
import { ExternalLinkIcon } from './Icons';
import { AdminDropdownMenu } from './AdminDropdownMenu';
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

      {/* Admin Dropdown Menu */}
      <AdminDropdownMenu
        url={url}
        onEdit={onEdit}
        iconSize={iconSize}
      />
    </div>
  );
};
