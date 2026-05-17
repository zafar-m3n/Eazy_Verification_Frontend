import SelectLib from "react-select";

function Select({
  value = "",
  onChange,
  options = [],
  placeholder = "Select",
  error,
  label,
  isDisabled = false,
  isClearable = false,
  ...rest
}) {
  const selectedValue = options.find((option) => option.value === value) || null;

  function handleChange(selectedOption) {
    onChange(selectedOption?.value || "");
  }

  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-text font-figtree">{label}</label>}

      <SelectLib
        unstyled
        options={options}
        value={selectedValue}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={isClearable}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        classNamePrefix="react-select"
        classNames={{
          control: ({ isFocused }) =>
            [
              "h-12 rounded-xl border bg-card px-3 text-sm text-text transition",
              "hover:border-accent-1 font-figtree",
              isFocused ? "border-accent-1 ring-2 ring-accent-1/20" : "border-border",
              error ? "border-accent-2 ring-2 ring-accent-2/15" : "",
              isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            ].join(" "),

          valueContainer: () => "h-full py-0",

          singleValue: () => "text-sm font-medium text-text",

          placeholder: () => "text-sm text-text/50",

          input: () => "text-sm text-text",

          menuPortal: () => "z-[9999]",

          menu: () => "z-[9999] mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg font-figtree",

          menuList: () => "app-scrollbar max-h-64 overflow-y-auto p-1",

          option: ({ isFocused, isSelected }) =>
            [
              "cursor-pointer rounded-lg px-3 py-2 text-sm transition",
              isSelected ? "bg-accent-1 text-card" : isFocused ? "bg-background text-text" : "bg-card text-text",
            ].join(" "),

          indicatorsContainer: () => "h-full gap-1 text-text/60",

          dropdownIndicator: ({ isFocused }) =>
            ["px-1 transition", isFocused ? "text-accent-2" : "text-text/60"].join(" "),

          clearIndicator: () => "px-1 text-text/60 transition hover:text-accent-2",

          indicatorSeparator: () => "mx-2 bg-border",

          noOptionsMessage: () => "px-3 py-4 text-sm text-text/60",

          loadingMessage: () => "px-3 py-4 text-sm text-text/60",
        }}
        {...rest}
      />

      {error && <p className="mt-2 text-sm font-medium text-accent-2">{error}</p>}
    </div>
  );
}

export default Select;
