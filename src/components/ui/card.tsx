import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card Strata v1.1 (padrão Stripe/Linear/Vercel):
 * — superfície branca, borda gray-200, raio 8px (--radius-md);
 * — profundidade por borda; sombra APENAS no hover de card clicável (discreta);
 * — padding no grid de 8px: 24px padrão (`p-6`), 16px em variação compacta;
 * — título discreto (14px medium gray-700) para o VALOR ser o protagonista;
 * — transições nos tokens de motion; dark-ready (só tokens semânticos).
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border bg-surface shadow-sm",
      interactive &&
        "cursor-pointer transition-[border-color,box-shadow,transform] duration-fast ease-standard hover:-translate-y-px hover:border-action-600/60 hover:shadow-md active:translate-y-0 active:shadow-xs",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-start justify-between gap-3 px-6 pb-3 pt-5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

/** Título discreto — o dado é o protagonista, não o rótulo. */
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-sm font-medium leading-5 text-gray-700", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between border-t px-6 py-3", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
