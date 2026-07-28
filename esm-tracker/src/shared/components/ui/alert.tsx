import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        variant === "default" &&
          "bg-white text-black border-gray-200",
        variant === "destructive" &&
          "border-red-200 bg-red-50 text-red-700",
        variant === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        className
      )}
      {...props}
    />
  )
);

Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };