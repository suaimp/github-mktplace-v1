export interface ArticleActionProps {
  url: string;
  fileName?: string;
  onDownload?: () => void;
  className?: string;
  textClassName?: string;
  iconSize?: 'small' | 'medium' | 'large';
  label?: string;
  showCopyIcon?: boolean;
}

export interface ArticleActionButtonsProps {
  url: string;
  fileName?: string;
  onDownload?: () => void;
  iconSize?: 'small' | 'medium' | 'large';
  showCopyIcon?: boolean;
}
