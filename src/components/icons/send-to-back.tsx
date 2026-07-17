import * as React from "react";
import type { IconProps } from "./type";

const SvgSendToBack = ({ size = 24, strokeWidth = 2, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <rect width="3" height="18" fill="currentColor" />
    <rect x="15" width="3" height="18" fill="currentColor" />
    <rect x="3" width="12" height="3" fill="currentColor" />
    <rect x="3" y="15" width="12" height="3" fill="currentColor" />
    <rect x="18" y="6" width="6" height="18" fill="currentColor" />
    <rect x="6" y="18" width="12" height="6" fill="currentColor" />
  </svg>
);

export default SvgSendToBack;
