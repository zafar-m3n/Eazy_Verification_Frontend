import { useState } from "react";
import Icon from "@/components/ui/Icon";

function Rate({ value = 0, count = 5, onChange = () => {}, allowHalf = false, interactive = false, size = 24 }) {
  const [hoverValue, setHoverValue] = useState(0);

  function getStarType(index) {
    if (hoverValue && interactive) {
      return index <= hoverValue ? "full" : "empty";
    }

    if (interactive) {
      return index <= value ? "full" : "empty";
    }

    const intPart = Math.floor(value);

    if (index <= intPart) {
      return "full";
    }

    if (allowHalf && index === intPart + 1 && value % 1 >= 0.5) {
      return "half";
    }

    return "empty";
  }

  function handleMouseEnter(index) {
    if (interactive) {
      setHoverValue(index);
    }
  }

  function handleMouseLeave() {
    if (interactive) {
      setHoverValue(0);
    }
  }

  function handleClick(index) {
    if (interactive) {
      onChange(Math.ceil(index));
    }
  }

  function renderStars() {
    const stars = [];

    for (let index = 1; index <= count; index += 1) {
      const starType = getStarType(index);

      stars.push(
        <button
          type="button"
          key={index}
          disabled={!interactive}
          className={`flex items-center justify-center transition ${interactive ? "cursor-pointer" : "cursor-default"}`}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        >
          {starType === "full" ? (
            <Icon icon="material-symbols:star" className="text-accent-1" width={size} />
          ) : starType === "half" ? (
            <Icon icon="material-symbols:star-half" className="text-accent-1" width={size} />
          ) : (
            <Icon icon="material-symbols:star" className="text-border" width={size} />
          )}
        </button>,
      );
    }

    return stars;
  }

  return <div className="flex items-center">{renderStars()}</div>;
}

export default Rate;
