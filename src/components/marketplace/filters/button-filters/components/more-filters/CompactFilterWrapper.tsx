/**
 * Wrapper para filtros compactos em dropdown
 * Responsabilidade: Renderizar filtros em formato expansível para o modal
 */

import React from 'react';
import { ExpandableFilterItem } from './ExpandableFilterItem';

interface CompactFilterWrapperProps {
  title: string;
  children: React.ReactNode;
}

export const CompactFilterWrapper: React.FC<CompactFilterWrapperProps> = ({
  title,
  children
}) => {
  return (
    <ExpandableFilterItem title={title}>
      <div className="pt-2">
        {children}
      </div>
    </ExpandableFilterItem>
  );
};
