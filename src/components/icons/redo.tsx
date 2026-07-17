import * as React from "react";
import type { IconProps } from "./type";

const SvgRedo = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect x="15" width="3" height="3" fill="currentColor" />
    <rect x="18" y="9" width="3" height="3" fill="currentColor" />
    <rect x="18" y="3" width="3" height="3" fill="currentColor" />
    <rect x="15" y="12" width="3" height="3" fill="currentColor" />
    <rect x="3" y="12" width="3" height="12" fill="currentColor" />
    <rect x="6" y="9" width="3" height="3" fill="currentColor" />
    <rect x="9" y="6" width="15" height="3" fill="currentColor" />
  </svg>
);

export default SvgRedo;
