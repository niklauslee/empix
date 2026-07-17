import * as React from "react";
import type { IconProps } from "./type";

const SvgRectangle = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect width="3" height="21" fill="currentColor" />
    <rect x="18" width="3" height="21" fill="currentColor" />
    <rect x="3" width="15" height="3" fill="currentColor" />
    <rect x="3" y="18" width="15" height="3" fill="currentColor" />
  </svg>
);

export default SvgRectangle;
