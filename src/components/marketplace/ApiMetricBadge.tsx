import { useState, useEffect } from 'react';

interface ApiMetricBadgeProps {
  value: number;
  fieldType: string;
}

export default function ApiMetricBadge({
  value,
  fieldType
}: ApiMetricBadgeProps) {
  // Hook para detectar mudanças no dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Get score letter and colors based on value and theme
  const getScoreInfo = (
    value: number
  ): { letter: string; bgColor: string; textColor: string } => {
    if (value >= 80) {
      return {
        letter: "A",
        bgColor: isDarkMode ? "#065f46" : "#9EF2C9", // Dark: darker green, Light: original
        textColor: isDarkMode ? "#10b981" : "#007C65"  // Dark: lighter green, Light: original
      };
    } else if (value >= 60) {
      return {
        letter: "B",
        bgColor: isDarkMode ? "#1e3a8a" : "#C4E5FE", // Dark: darker blue, Light: original
        textColor: isDarkMode ? "#3b82f6" : "#006DCA"  // Dark: lighter blue, Light: original
      };
    } else if (value >= 40) {
      return {
        letter: "C",
        bgColor: isDarkMode ? "#581c87" : "#EDD9FF", // Dark: darker purple, Light: original
        textColor: isDarkMode ? "#a855f7" : "#8649E1" // Dark: lighter purple, Light: original
      };
    } else if (value >= 20) {
      return {
        letter: "D",
        bgColor: isDarkMode ? "#92400e" : "#FCE081", // Dark: darker amber, Light: original
        textColor: isDarkMode ? "#f59e0b" : "#A75800" // Dark: lighter amber, Light: original
      };
    } else {
      return {
        letter: "F",
        bgColor: isDarkMode ? "#991b1b" : "#f9b4b4", // Dark: darker red, Light: original
        textColor: isDarkMode ? "#ef4444" : "#b84f53" // Dark: lighter red, Light: original
      };
    }
  };

  // Only show score badge for metrics that use 0-100 scale
  const shouldShowScore = ["moz_da", "semrush_as", "ahrefs_dr"].includes(
    fieldType
  );

  if (!shouldShowScore) return null;

  // Parse value and ensure it's a number between 0-100
  const numValue = parseInt(value.toString().replace(/,/g, ""));
  if (isNaN(numValue) || numValue < 0 || numValue > 100) return null;

  const { letter, bgColor, textColor } = getScoreInfo(numValue);

  return (
    <div
      className="inline-flex items-center justify-center w-5 h-5 rounded-sm font-bold ml-2 transition-colors duration-200"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize: '13px'
      }}
      title={`Score ${letter}`}
    >
      {letter}
    </div>
  );
}
