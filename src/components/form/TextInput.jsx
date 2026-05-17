import { useState } from "react";
import { Icon } from "@iconify/react";

function TextInput({ label, type = "text", placeholder = "", error, className = "", disabled = false, ...rest }) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  function togglePasswordVisibility() {
    setShowPassword((currentValue) => !currentValue);
  }

  const inputClassName = [
    "h-12 w-full rounded-xl border bg-card px-4 text-sm text-text transition",
    "placeholder:text-text/50",
    "focus:border-accent-1 focus:outline-none focus:ring-2 focus:ring-accent-1/20",
    "disabled:cursor-not-allowed disabled:opacity-60",
    error ? "border-accent-2 ring-2 ring-accent-2/15" : "border-border",
    isPassword ? "pr-12" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-text">{label}</label>}

      <div className="relative">
        <input type={inputType} placeholder={placeholder} disabled={disabled} className={inputClassName} {...rest} />

        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-text/60 transition hover:bg-background hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="size-5" />
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm font-medium text-accent-2">{error}</p>}
    </div>
  );
}

export default TextInput;
