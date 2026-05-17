import { Icon } from "@iconify/react";

function IconComponent({ icon, className = "", width, rotate, hFlip, vFlip }) {
  return <Icon width={width} rotate={rotate} hFlip={hFlip} icon={icon} className={className} vFlip={vFlip} />;
}

export default IconComponent;
