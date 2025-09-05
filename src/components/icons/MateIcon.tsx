import * as React from "react";
import { SVGProps } from "react";

export const MateIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10 21a5 5 0 0 1-5-5c0-1.8.98-3.37 2.45-4.22" />
    <path d="M14 21a5 5 0 0 0 5-5c0-1.8-.98-3.37-2.45-4.22" />
    <path d="M12 11a2.5 2.5 0 0 1-2.5-2.5V3h5v5.5A2.5 2.5 0 0 1 12 11z" />
    <path d="M12 11v10" />
    <path d="m16 8-4-2-4 2" />
    <path d="M12 3V1" />
  </svg>
);
