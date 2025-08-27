import React from 'react';
import { DownloadIcon, ExternalLinkIcon, CopyIcon } from './Icons';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { downloadFile, openExternalLink } from '../utils/fileActions';
import { ArticleActionButtonsProps } from '../types';

export const ArticleActionButtons: React.FC<ArticleActionButtonsProps> = ({
  url,
  fileName,
  onDownload,
  iconSize = 'medium',
  showCopyIcon = true
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      downloadFile(url, fileName);
    }
  };

  const handleExternalLink = () => {
    openExternalLink(url);
  };

  const handleCopy = () => {
    copyToClipboard(url);
  };

  const isExternalUrl = url.includes('http');

  return (
    <div className="flex items-center gap-1 ml-1">
      {/* Download/External Link Icon */}
      <button
        onClick={isExternalUrl ? handleExternalLink : handleDownload}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title={isExternalUrl ? "Abrir link externo" : "Baixar arquivo"}
      >
        {isExternalUrl ? (
          <ExternalLinkIcon size={iconSize} />
        ) : (
          <DownloadIcon size={iconSize} />
        )}
      </button>

      {/* Copy Icon */}
      {showCopyIcon && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={copied ? "Copiado!" : "Copiar URL"}
        >
          <CopyIcon 
            size={iconSize}
            className={copied ? "text-green-600 dark:text-green-400" : ""} 
          />
        </button>
      )}
    </div>
  );
};
