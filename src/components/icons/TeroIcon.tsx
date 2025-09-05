import * as React from "react";
import { SVGProps } from "react";

export const TeroIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a4 4 0 0 0-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 0 0-4-4z" />
    <path d="M15.5 8.5C18 11 22 12 22 12s-4-1-6.5-3.5" />
    <path d="M8.5 8.5C6 11 2 12 2 12s4-1 6.5-3.5" />
    <path d="M12 14v7" />
    <path d="M9 21h6" />
  </svg>
);
