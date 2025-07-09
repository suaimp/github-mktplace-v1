interface ApiMetricBadgeProps {
  value: number;
  fieldType: string;
}

export default function ApiMetricBadge({
  value,
  fieldType
}: ApiMetricBadgeProps) {
  // Get score letter and colors based on value
  const getScoreInfo = (
    value: number
  ): { letter: string; bgColor: string; textColor: string } => {
    if (value >= 80) {
      return {
        letter: "A",
        bgColor: "#9EF2C9",
        textColor: "#007C65"
      };
    } else if (value >= 60) {
      return {
        letter: "B",
        bgColor: "#C4E5FE",
        textColor: "#006DCA"
      };
    } else if (value >= 40) {
      return {
        letter: "C",
        bgColor: "#EDD9FF",
        textColor: "#8649E1"
      };
    } else if (value >= 20) {
      return {
        letter: "D",
        bgColor: "#FCE081",
        textColor: "#A75800"
      };
    } else {
      return {
        letter: "F",
        bgColor: "#f9b4b4",
        textColor: "#b84f53"
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
      className="inline-flex items-center justify-center w-5 h-5 rounded-sm font-bold ml-2"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize: '10px'
      }}
      title={`Score ${letter}`}
    >
      {letter}
    </div>
  );
}
