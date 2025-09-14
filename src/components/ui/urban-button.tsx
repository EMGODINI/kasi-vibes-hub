import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const urbanButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-neon text-white hover:shadow-neon hover:scale-105 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_20px_hsl(var(--destructive)/0.5)]",
        outline:
          "border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-glow hover:border-neon-purple/50",
        secondary:
          "bg-gradient-urban text-white hover:shadow-glow hover:scale-105",
        ghost: "hover:bg-white/10 hover:text-neon-purple hover:shadow-neon",
        link: "text-primary underline-offset-4 hover:underline hover:text-neon-purple",
        neon: "bg-black/20 border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 hover:shadow-neon hover:border-neon-purple",
        cyber: "bg-gradient-to-r from-neon-cyan/20 to-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:shadow-glow hover:scale-105"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface UrbanButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof urbanButtonVariants> {
  asChild?: boolean
  glowEffect?: boolean
}

const UrbanButton = React.forwardRef<HTMLButtonElement, UrbanButtonProps>(
  ({ className, variant, size, asChild = false, glowEffect = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(urbanButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {glowEffect && (
          <div className="absolute inset-0 bg-gradient-neon opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl" />
        )}
        <span className="relative z-10">{children}</span>
      </Comp>
    )
  }
)
UrbanButton.displayName = "UrbanButton"

export { UrbanButton, urbanButtonVariants }