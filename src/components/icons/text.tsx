import * as React from "react";
import type { IconProps } from "./type";

const SvgText = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect x="6" y="21" width="9" height="3" fill="currentColor" />
    <rect width="21" height="3" fill="currentColor" />
    <rect x="18" y="3" width="3" height="3" fill="currentColor" />
    <rect x="9" y="3" width="3" height="18" fill="currentColor" />
    <rect y="3" width="3" height="3" fill="currentColor" />
  </svg>
);

export default SvgText;
