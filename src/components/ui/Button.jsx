import { Icon } from "@iconify/react";

function Button({ children, variant = "primary", icon = null, iconPosition = "left", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-medium transition-all duration-200 select-none";

  const variants = {
    primary: `
      text-black
      bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)]
      hover:brightness-110
      hover:shadow-[0_0_30px_rgba(163,230,53,0.35)]
      active:scale-[0.98]
    `,

    secondary: `
      text-[var(--color-text)]
      bg-[var(--color-card)]
      border border-[var(--color-border)]
      hover:border-[var(--color-accent-1)]
      hover:shadow-[0_0_18px_rgba(163,230,53,0.2)]
      active:scale-[0.98]
    `,
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {icon && iconPosition === "left" && <Icon icon={icon} width={18} />}

      {children}

      {icon && iconPosition === "right" && <Icon icon={icon} width={18} />}
    </button>
  );
}

export default Button;
