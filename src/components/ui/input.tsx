import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded border border-input bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground",
        "transition-colors duration-fast hover:border-gray-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-action-600",
        "disabled:cursor-not-allowed disabled:opacity-disabled disabled:bg-sunken",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("mb-1.5 block text-xs font-medium text-gray-700", className)} {...props} />
  )
);
Label.displayName = "Label";

export { Input, Label };
