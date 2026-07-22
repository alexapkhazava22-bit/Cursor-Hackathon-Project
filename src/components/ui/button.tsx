import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "ac-btn--primary",
  secondary: "ac-btn--secondary",
  outline: "ac-btn--outline",
  ghost: "ac-btn--ghost",
  danger: "ac-btn--danger",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "",
  sm: "ac-btn--sm",
  lg: "ac-btn--lg",
  icon: "ac-btn--sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      type,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "ac-btn",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        ref={ref}
        {...props}
        type={asChild ? undefined : type ?? "button"}
      />
    );
  },
);
Button.displayName = "Button";
