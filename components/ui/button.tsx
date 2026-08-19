import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-center text-sm font-medium whitespace-normal [text-wrap:balance] transition-[transform,background-color,border-color,color,box-shadow] outline-none select-none focus-visible:border-emerald-500 focus-visible:ring-3 focus-visible:ring-emerald-500/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        action:
          "bg-emerald-800 text-white shadow-[0_8px_22px_rgba(27,77,62,0.14)] hover:bg-emerald-900 hover:shadow-[0_12px_28px_rgba(27,77,62,0.18)]",
        "action-outline":
          "border-emerald-200 bg-white text-emerald-800 shadow-[0_2px_10px_rgba(27,77,62,0.04)] hover:border-emerald-300 hover:bg-emerald-50",
        "action-ghost":
          "bg-transparent text-ink/62 hover:bg-emerald-50 hover:text-emerald-800",
        "action-danger":
          "border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 focus-visible:border-red-400 focus-visible:ring-red-400/20",
        "icon-quiet":
          "bg-transparent text-ink/55 hover:bg-emerald-50 hover:text-emerald-800",
        "icon-surface":
          "border-white/80 bg-white text-ink/58 shadow-[0_4px_14px_rgba(15,23,42,0.06)] hover:border-emerald-100 hover:text-emerald-800 hover:shadow-[0_7px_18px_rgba(27,77,62,0.09)]",
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
        touch:
          "min-h-11 gap-2 rounded-[var(--ui-radius-control,12px)] px-4 py-2.5 text-[var(--type-action-size,0.9375rem)] font-semibold leading-snug",
        "touch-sm":
          "min-h-11 gap-1.5 rounded-[var(--ui-radius-control,12px)] px-3 py-2 text-[var(--type-meta-size,0.8125rem)] font-semibold leading-snug",
        "icon-touch":
          "size-11 rounded-[var(--ui-radius-control,12px)] [&_svg:not([class*='size-'])]:size-5",
        "icon-touch-lg":
          "size-12 rounded-[var(--ui-radius-control,12px)] [&_svg:not([class*='size-'])]:size-5",
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
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
