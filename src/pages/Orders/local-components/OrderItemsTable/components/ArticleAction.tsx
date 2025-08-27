import React from 'react';
import { CheckIcon } from './Icons';
import { ArticleActionButtons } from './ArticleActionButtons';
import { ArticleActionProps } from '../types';

export const ArticleAction: React.FC<ArticleActionProps> = ({
  url,
  fileName,
  onDownload,
  className = "",
  textClassName = "",
  iconSize = 'medium',
  label = "Artigo",
  showCopyIcon
}) => {
  const isExternalUrl = url.includes('http');
  
  // Se showCopyIcon não for especificado, só mostra para URLs externas
  const shouldShowCopyIcon = showCopyIcon !== undefined ? showCopyIcon : isExternalUrl;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center lg:w-5 lg:h-5 max-[1023px]:w-[12px] max-[1023px]:h-[12px]">
        <CheckIcon size="small" />
      </div>
      <span className={`text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium ${textClassName}`}>
        {label}
      </span>
      <ArticleActionButtons
        url={url}
        fileName={fileName}
        onDownload={onDownload}
        iconSize={iconSize}
        showCopyIcon={shouldShowCopyIcon}
      />
    </div>
  );
};
