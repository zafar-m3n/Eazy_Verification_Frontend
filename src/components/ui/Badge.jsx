import Icon from "@/components/ui/Icon";

function Badge({ text, color = "default", size = "md", icon = null, rounded = "rounded-full" }) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const colorClasses = {
    default: "border-border bg-background text-text",
    pending: "border-accent-1 bg-accent-1/15 text-text",
    approved: "border-accent-1 bg-accent-1 text-card",
    rejected: "border-accent-2 bg-accent-2 text-card",
    accent: "border-accent-1 bg-accent-1 text-card",
    muted: "border-border bg-card text-text/70",
  };

  return (
    <span
      className={`inline-flex items-center border font-medium capitalize ${sizeClasses[size]} ${
        colorClasses[color] || colorClasses.default
      } ${rounded}`}
    >
      {icon && <Icon icon={icon} className="me-2 size-4" />}
      {text}
    </span>
  );
}

export default Badge;
