import React from 'react';
import { SponsoredBadge, LinkTypeBadge } from '../badges';
import { detectValueType } from './valueTypeDetection';

/**
 * Unified service for badge rendering
 * Resolves inconsistencies in Sim/Não value rendering
 */

export interface BadgeRenderResult {
  shouldRenderBadge: boolean;
  badgeComponent?: React.ReactElement;
  fallbackValue?: string;
}

/**
 * Determines if a value should be rendered as a badge and returns the appropriate component
 */
export function getBadgeRenderer(
  value: any, 
  fieldType: string, 
  fieldLabel?: string
): BadgeRenderResult {
  
  if (value === null || value === undefined) {
    return {
      shouldRenderBadge: false,
      fallbackValue: "-"
    };
  }

  const valueType = detectValueType(value, fieldType, fieldLabel);
  const stringValue = value.toString();

  switch (valueType) {
    case "sponsored":
      return {
        shouldRenderBadge: true,
        badgeComponent: <SponsoredBadge value={stringValue} />,
        fallbackValue: stringValue
      };

    case "linkType":
      return {
        shouldRenderBadge: true,
        badgeComponent: <LinkTypeBadge value={stringValue} />,
        fallbackValue: stringValue
      };

    default:
      return {
        shouldRenderBadge: false,
        fallbackValue: stringValue
      };
  }
}

/**
 * Simplified function for direct use in rendering
 */
export function renderUnifiedBadge(
  value: any, 
  fieldType: string, 
  fieldLabel?: string
): React.ReactElement | string {
  
  const result = getBadgeRenderer(value, fieldType, fieldLabel);
  
  if (result.shouldRenderBadge && result.badgeComponent) {
    return result.badgeComponent;
  }
  
  return result.fallbackValue || value?.toString() || "-";
}

/**
 * Helper functions for specific badge types
 */
export const renderSponsoredBadge = (value: string) => {
  return <SponsoredBadge value={value} />;
};

export const renderLinkTypeBadge = (value: string) => {
  return <LinkTypeBadge value={value} />;
};
