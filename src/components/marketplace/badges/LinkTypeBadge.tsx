interface LinkTypeBadgeProps {
  value: string;
}

export function LinkTypeBadge({ value }: LinkTypeBadgeProps) {
  const isDofollow = value?.toLowerCase() === 'dofollow';
  const badgeClass = isDofollow ? "badge-link-dofollow" : "badge-link-nofollow";
  
  return (
    <span className={badgeClass}>
      {value}
    </span>
  );
}
