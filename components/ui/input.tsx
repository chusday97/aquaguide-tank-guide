import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  uiSize?: "compact" | "touch"
}

function Input({ className, type, uiSize = "compact", ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-ui-size={uiSize}
      className={cn(
        "w-full min-w-0 border border-input bg-transparent transition-[border-color,box-shadow,background-color] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-emerald-500 focus-visible:ring-3 focus-visible:ring-emerald-500/18 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        uiSize === "touch"
          ? "min-h-11 rounded-[var(--ui-radius-control,12px)] px-3 py-2 text-[var(--type-body-size,0.9375rem)] leading-6"
          : "h-8 rounded-lg px-2.5 py-1 text-base md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
