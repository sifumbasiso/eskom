import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#1A4FA0] text-white hover:bg-[#154089] dark:bg-[#5A9FFF] dark:hover:bg-[#7AAFFF]",
        outline:
          "border-[#D6E0F0] bg-white hover:bg-[#F4F6FB] text-[#1A4FA0] dark:border-[#2A3142] dark:bg-[#1A1F2E] dark:hover:bg-[#2A3142] dark:text-[#5A9FFF]",
        secondary:
          "bg-[#00A651] text-white hover:bg-[#008640] dark:bg-[#4BC96F] dark:hover:bg-[#5FD682]",
        ghost:
          "hover:bg-[#F4F6FB] text-[#1A4FA0] dark:hover:bg-[#2A3142] dark:text-[#5A9FFF]",
        destructive:
          "bg-[#8B2500]/10 text-[#8B2500] hover:bg-[#8B2500]/20 focus-visible:border-[#8B2500]/40 focus-visible:ring-[#8B2500]/20 dark:bg-[#FF6B5B]/20 dark:text-[#FF6B5B] dark:hover:bg-[#FF6B5B]/30 dark:focus-visible:ring-[#FF6B5B]/40",
        link: "text-[#0072CE] underline-offset-4 hover:underline dark:text-[#5A9FFF]",
        gradient: "bg-gradient-to-r from-[#1A4FA0] to-[#00A651] text-white hover:from-[#154089] hover:to-[#008640]",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
