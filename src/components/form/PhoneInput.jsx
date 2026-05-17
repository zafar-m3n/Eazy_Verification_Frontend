import { PhoneInput as IntlPhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

function PhoneInput({
  value = "",
  onChange,
  error = "",
  className = "",
  label,
  defaultCountry = "gb",
  placeholder = "7400 123456",
  ...rest
}) {
  const containerClassName = [
    "react-international-phone-input-container",
    "phone-input-container",
    error ? "phone-input-container-error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="phone-input-wrapper">
      {label && <label className="phone-input-label">{label}</label>}

      <IntlPhoneInput
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={containerClassName}
        inputClassName="react-international-phone-input"
        countrySelectorStyleProps={{
          buttonClassName: "react-international-phone-country-selector-button",
          dropdownStyleProps: {
            className: "react-international-phone-country-selector-dropdown",
            listClassName: "react-international-phone-country-selector-dropdown__list",
          },
        }}
        {...rest}
      />

      {error && <p className="phone-input-error">{error}</p>}
    </div>
  );
}

export default PhoneInput;
