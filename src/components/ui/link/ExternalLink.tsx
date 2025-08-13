import React from 'react';
import { generateLinkProps, LINK_PRESETS, LinkConfig } from '../../../utils/linkConfig';

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  preset?: keyof typeof LINK_PRESETS;
  linkConfig?: LinkConfig;
  className?: string;
}

/**
 * Componente para links externos com configuração automática de nofollow
 * Por padrão, todos os links externos são nofollow, noopener e noreferrer
 */
export const ExternalLink: React.FC<ExternalLinkProps> = ({ 
  href, 
  children, 
  preset = 'external',
  linkConfig,
  className = '',
  ...props 
}) => {
  // Usa o preset ou configuração customizada
  const linkProps = linkConfig 
    ? generateLinkProps(href, linkConfig)
    : generateLinkProps(href, LINK_PRESETS[preset]);

  return (
    <a
      {...linkProps}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

export default ExternalLink;
