import * as React from "react";
import type { IconProps } from "./type";

const SvgMinus = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect y="9" width="21" height="3" fill="currentColor" />
  </svg>
);

export default SvgMinus;
