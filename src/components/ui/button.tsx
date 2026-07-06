import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Estados padronizados (Sprint 1.1): hover = 1 passo de cor · active = passo
  // extra + micro-press · focus = anel único do produto · disabled = token.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-disabled [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-action-600 text-white shadow-xs hover:bg-action-700 hover:shadow-sm active:bg-action-700 active:shadow-xs",
        navy: "bg-inverse text-white shadow-xs hover:bg-inverse/90 active:bg-inverse/80",
        outline: "border border-input bg-surface text-foreground hover:bg-gray-100/70 active:bg-gray-100",
        ghost: "text-action-600 hover:bg-action-100/60 active:bg-action-100",
        destructive: "border border-danger text-danger hover:bg-danger-bg active:bg-danger-bg",
        subtle: "bg-sunken text-foreground hover:bg-gray-200 active:bg-gray-300/70",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-body-sm",
        lg: "h-12 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
