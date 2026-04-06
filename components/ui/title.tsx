import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const titleVariants = cva("font-display font-medium tracking-tight text-foreground", {
  variants: {
    size: {
      default: "text-4xl md:text-5xl lg:text-7xl", // generic H1
      xs: "text-xl md:text-2xl", // Section Intros
      sm: "text-2xl md:text-3xl", // Subheads
      md: "text-3xl md:text-4xl", // H2
      lg: "text-5xl md:text-6xl lg:text-8xl", // Massive Hero Statement
      xl: "text-6xl lg:text-9xl", // Decorative large numbers
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    size: "default",
    weight: "medium",
  },
})

export interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div"
}

export function Title({ className, size, weight, as: Comp = "h1", ...props }: TitleProps) {
  return <Comp className={cn(titleVariants({ size, weight, className }))} {...props} />
}
