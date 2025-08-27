interface IconProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const getSizeClasses = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return 'w-3 h-3 lg:w-3 lg:h-3 max-[1023px]:w-[15px] max-[1023px]:h-[15px]';
    case 'medium':
      return 'w-4 h-4 lg:w-4 lg:h-4 max-[1023px]:w-[15px] max-[1023px]:h-[15px]';
    case 'large':
      return 'w-5 h-5 lg:w-5 lg:h-5 max-[1023px]:w-[15px] max-[1023px]:h-[15px]';
    default:
      return 'w-4 h-4 lg:w-4 lg:h-4 max-[1023px]:w-[15px] max-[1023px]:h-[15px]';
  }
};

const getCheckIconSizeClasses = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return 'w-3 h-3 lg:w-3 lg:h-3 max-[1023px]:w-[12px] max-[1023px]:h-[12px]';
    case 'medium':
      return 'w-4 h-4 lg:w-4 lg:h-4 max-[1023px]:w-[12px] max-[1023px]:h-[12px]';
    case 'large':
      return 'w-5 h-5 lg:w-5 lg:h-5 max-[1023px]:w-[12px] max-[1023px]:h-[12px]';
    default:
      return 'w-4 h-4 lg:w-4 lg:h-4 max-[1023px]:w-[12px] max-[1023px]:h-[12px]';
  }
};

export const DownloadIcon = ({ className = "", size = 'medium' }: IconProps) => (
  <svg 
    className={`${getSizeClasses(size)} text-gray-700 dark:text-gray-300 ${className}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
    />
  </svg>
);

export const ExternalLinkIcon = ({ className = "", size = 'medium' }: IconProps) => (
  <svg 
    className={`${getSizeClasses(size)} text-gray-700 dark:text-gray-300 ${className}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
    />
  </svg>
);

export const CopyIcon = ({ className = "", size = 'medium' }: IconProps) => (
  <svg 
    className={`${getSizeClasses(size)} text-gray-700 dark:text-gray-300 ${className}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
    />
  </svg>
);

export const CheckIcon = ({ className = "", size = 'medium' }: IconProps) => (
  <svg 
    className={`${getCheckIconSizeClasses(size)} text-white ${className}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M5 13l4 4L19 7" 
    />
  </svg>
);
