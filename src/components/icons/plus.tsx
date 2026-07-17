import * as React from "react";
import type { IconProps } from "./type";

const SvgPlus = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect x="9" width="3" height="21" fill="currentColor" />
    <rect y="9" width="9" height="3" fill="currentColor" />
    <rect x="12" y="9" width="9" height="3" fill="currentColor" />
  </svg>
);

export default SvgPlus;
