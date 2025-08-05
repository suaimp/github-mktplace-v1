interface SponsoredBadgeProps {
  value: any; // Changed from boolean to any to accept different types
}

export function SponsoredBadge({ value }: SponsoredBadgeProps) {
  // Convert value to boolean robustly
  // Accepts both boolean and string "Sim"/"Não"
  let booleanValue: boolean;
  let displayValue: string;
  
  if (typeof value === 'string') {
    booleanValue = value === 'Sim';
    displayValue = value;
  } else {
    booleanValue = Boolean(value);
    displayValue = booleanValue ? "Sim" : "Não";
  }
  
  const badgeClass = booleanValue ? "badge-sponsored-yes" : "badge-sponsored-no";
  
  return (
    <span className={badgeClass}>
      {displayValue}
    </span>
  );
}
