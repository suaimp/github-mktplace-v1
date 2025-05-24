// src/components/ServicePackages/cards/cardColors.ts

import { useState } from "react";

export type CardColors = {
  border: string;
  bg: string;
  borderDark: string;
  bgDark: string;
  title: string;
  titleDark: string;
  price: string;
  priceDark: string;
  period: string;
  periodDark: string;
  benefit: string;
  benefitDark: string;
  notBenefit: string;
  divider: string;
  dividerDark: string;
  button: string;
  buttonHover: string;
  buttonDark: string;
  buttonDarkHover: string;
};

export const defaultCardColors: CardColors = {
  border: "border-gray-200",
  bg: "bg-white",
  borderDark: "dark:border-gray-800",
  bgDark: "dark:bg-white/[0.03]",
  title: "text-gray-800",
  titleDark: "dark:text-white/90",
  price: "text-gray-800",
  priceDark: "dark:text-white/90",
  period: "text-gray-500",
  periodDark: "dark:text-gray-400",
  benefit: "text-gray-500",
  benefitDark: "dark:text-gray-400",
  notBenefit: "text-gray-400",
  divider: "bg-gray-200",
  dividerDark: "dark:bg-gray-800",
  button: "bg-gray-800",
  buttonHover: "hover:bg-brand-500",
  buttonDark: "dark:bg-white/10",
  buttonDarkHover: "dark:hover:bg-brand-600"
};

export const mainCardColors: CardColors = {
  border: "border-gray-800",
  bg: "bg-gray-800",
  borderDark: "dark:border-white/10",
  bgDark: "dark:bg-white/10",
  title: "text-white",
  titleDark: "text-white",
  price: "text-white",
  priceDark: "text-white",
  period: "text-white/70",
  periodDark: "text-white/70",
  benefit: "text-white/80",
  benefitDark: "text-white/80",
  notBenefit: "text-gray-300",
  divider: "bg-white/20",
  dividerDark: "bg-white/20",
  button: "bg-brand-500",
  buttonHover: "hover:bg-brand-600",
  buttonDark: "dark:hover:bg-brand-600",
  buttonDarkHover: "dark:hover:bg-brand-600"
};

export function useCardColors() {
  return useState<CardColors>(defaultCardColors);
}
