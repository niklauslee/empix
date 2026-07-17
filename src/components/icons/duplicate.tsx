import * as React from "react";
import type { IconProps } from "./type";

const SvgDuplicate = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect x="9" y="21" width="3" height="3" fill="currentColor" />
    <rect x="21" y="6" width="3" height="18" fill="currentColor" />
    <rect x="6" y="6" width="3" height="18" fill="currentColor" />
    <rect x="12" y="21" width="9" height="3" fill="currentColor" />
    <rect width="3" height="18" fill="currentColor" />
    <rect x="3" y="15" width="3" height="3" fill="currentColor" />
    <rect x="6" y="12" width="3" height="3" fill="currentColor" />
    <rect x="3" width="15" height="3" fill="currentColor" />
    <rect x="15" y="3" width="3" height="3" fill="currentColor" />
    <rect x="9" y="6" width="12" height="3" fill="currentColor" />
  </svg>
);

export default SvgDuplicate;
