import * as React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const Logo = ({ size = 1, ...props }: LogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 56 18"
    width={56 * size}
    height={18 * size}
    fill="none"
    {...props}
  >
    <rect width="3" height="15" fill="currentColor" />
    <rect x="3" width="6" height="3" fill="currentColor" />
    <rect x="3" y="6" width="6" height="3" fill="currentColor" />
    <rect x="3" y="12" width="6" height="3" fill="currentColor" />
    <rect x="12" y="6" width="3" height="9" fill="currentColor" />
    <rect x="18" y="6" width="3" height="9" fill="currentColor" />
    <rect x="24" y="6" width="3" height="9" fill="currentColor" />
    <rect x="21" y="6" width="3" height="3" fill="currentColor" />
    <rect x="15" y="6" width="3" height="3" fill="currentColor" />
    <rect x="29" y="6" width="3" height="12" fill="currentColor" />
    <rect x="32" y="12" width="3" height="3" fill="currentColor" />
    <rect x="32" y="6" width="3" height="3" fill="currentColor" />
    <rect x="35" y="6" width="3" height="9" fill="currentColor" />
    <rect x="41" y="6" width="3" height="9" fill="currentColor" />
    <rect x="41" width="3" height="3" fill="currentColor" />
    <rect x="47" y="6" width="3" height="3" fill="currentColor" />
    <rect x="50" y="9" width="3" height="3" fill="currentColor" />
    <rect x="53" y="12" width="3" height="3" fill="currentColor" />
    <rect x="47" y="12" width="3" height="3" fill="currentColor" />
    <rect x="53" y="6" width="3" height="3" fill="currentColor" />
  </svg>
);

export default Logo;
