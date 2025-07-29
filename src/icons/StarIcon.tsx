import * as React from "react";


interface StarIconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

const StarIcon = ({ filled = false, ...props }: StarIconProps) => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="block"
    {...props}
  >
    <path
      d="M9.99991 3.125L12.2337 7.65114L17.2286 8.37694L13.6142 11.9L14.4675 16.8747L9.99991 14.526L5.53235 16.8747L6.38558 11.9L2.77124 8.37694L7.76613 7.65114L9.99991 3.125Z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default StarIcon;
