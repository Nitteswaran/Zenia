import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px relative overflow-visible",
  {
    variants: {
      variant: {
        default: "text-accent bg-transparent border-none hover:text-accent-foreground group",
        secondary: "border border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background",
        ghost: "border-none bg-transparent text-muted-foreground hover:text-foreground group",
        destructive: "border border-destructive text-destructive bg-transparent hover:bg-destructive hover:text-destructive-foreground",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-12 w-12",
        nav: "h-auto px-0 py-0 text-base normal-case tracking-normal font-medium" // special variant for links
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const buttonClass = cn(buttonVariants({ variant, size, className }))

    // When asChild, Slot must receive exactly one child (React 19 counts false as a child)
    if (asChild) {
      return (
        <Slot className={buttonClass} ref={ref} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <button className={buttonClass} ref={ref} {...props}>
        {children}
        {variant === "default" && (
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent origin-center scale-x-100 transition-transform duration-150 ease-out group-hover:scale-x-110" />
        )}
        {variant === "ghost" && (
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-foreground origin-left scale-x-0 transition-transform duration-150 ease-out group-hover:scale-x-100" />
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
