import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Selo compacto (Strata v1.2): tipografia menor, respiro reduzido e raio
 * discreto — leitura de etiqueta editorial, não de "pill" de dashboard.
 * Superfícies translúcidas para funcionar em claro e escuro.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-1.5 py-px text-[11px] font-medium leading-[1.45] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-700",
        success: "bg-success-bg text-success-fg",
        warning: "bg-warning-bg text-warning-fg",
        danger: "bg-danger-bg text-danger-fg",
        info: "bg-info-bg text-info-fg",
        navy: "bg-navy-100 text-navy-900",
        copper: "bg-copper-500/[0.12] text-copper-500",
        outline: "border text-gray-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1 w-1 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
