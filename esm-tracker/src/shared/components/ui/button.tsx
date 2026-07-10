import type { ButtonHTMLAttributes } from "react";

import * as React from "react";
import clsx from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "danger-outline"
  | "ghost"
  | "outline";

type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "icon";

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>(({ children, variant = "primary", size = "md", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",

        // Sizes
        {
          "px-3 py-1.5 text-sm":
            size === "sm",

          "px-4 py-2 text-sm":
            size === "md",

          "px-6 py-3 text-base":
            size === "lg",

          "h-9 w-9 p-0":
            size === "icon",
        },

        // Variants
        {
          "bg-blue-600 text-white hover:bg-blue-700":
            variant === "primary",

          "bg-gray-200 text-gray-900 hover:bg-gray-300":
            variant === "secondary",

          "bg-emerald-100 text-emerald-900 hover:bg-emerald-200":
            variant === "success",

          "bg-red-600 text-white hover:bg-red-700":
            variant === "danger",

          "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100":
            variant === "danger-outline",

          "bg-transparent hover:bg-gray-100":
            variant === "ghost",

          "border border-gray-300 bg-white hover:bg-gray-50":
            variant === "outline",
        },

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";