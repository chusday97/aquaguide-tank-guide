import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

export type DialogSurfaceKind = "auto" | "detail" | "task" | "blocking" | "fullscreen" | "media"

type SurfaceMarker = Exclude<DialogSurfaceKind, "auto" | "blocking" | "fullscreen" | "media">
type MarkedElementType = { dialogSurface?: SurfaceMarker }

function getMarkedSurface(children: React.ReactNode): SurfaceMarker | null {
  let result: SurfaceMarker | null = null
  React.Children.forEach(children, child => {
    if (result || !React.isValidElement(child)) return
    const type = child.type as MarkedElementType
    if (type && typeof type !== "string" && type.dialogSurface) {
      result = type.dialogSurface
      return
    }
    const nestedChildren = (child.props as { children?: React.ReactNode })?.children
    if (nestedChildren) result = getMarkedSurface(nestedChildren)
  })
  return result
}

function usePhoneViewport() {
  const getSnapshot = React.useCallback(() => (
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  ), [])
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => undefined
    const query = window.matchMedia("(max-width: 767px)")
    query.addEventListener("change", onStoreChange)
    return () => query.removeEventListener("change", onStoreChange)
  }, [])
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}

function Dialog({ modal, disablePointerDismissal, children, ...props }: DialogPrimitive.Root.Props) {
  const isPhoneViewport = usePhoneViewport()
  const markedSurface = React.useMemo(() => getMarkedSurface(children), [children])
  const resolvedModal = modal ?? (markedSurface === "detail" ? isPhoneViewport : true)
  const keepNonModalSurfaceOpen = disablePointerDismissal ?? resolvedModal === false

  React.useEffect(() => {
    if (!props.open || !resolvedModal) return
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [props.open, resolvedModal])

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      modal={resolvedModal}
      disablePointerDismissal={keepNonModalSurfaceOpen}
      {...props}
    >
      {children}
    </DialogPrimitive.Root>
  )
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-[160] bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  )
}

function inferSurface(surface: DialogSurfaceKind, showCloseButton: boolean, className?: string) {
  if (surface !== "auto") return surface
  if (showCloseButton === false) return "blocking"
  if (className?.includes("max-w-[1180px]") || className?.includes("max-w-[1480px]")) return "fullscreen"
  return "task"
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  withOverlay = true,
  surface = "auto",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  withOverlay?: boolean
  surface?: DialogSurfaceKind
}) {
  const { t } = useTranslation()
  const resolvedSurface = inferSurface(surface, showCloseButton, className)
  const surfaceClass = resolvedSurface === "blocking"
    ? "top-1/2 left-1/2 w-[min(480px,calc(100vw-32px))] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px]"
    : resolvedSurface === "fullscreen" || resolvedSurface === "media"
      ? "top-1/2 left-1/2 max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px]"
      : resolvedSurface === "detail"
        ? "bottom-0 left-auto right-0 top-0 translate-x-0 translate-y-0"
        : "bottom-0 left-1/2 top-auto h-[82dvh] max-h-[92dvh] w-[min(100vw,430px)] max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px] md:left-auto md:right-0 md:top-0 md:h-[100dvh] md:max-h-[100dvh] md:w-[min(760px,calc(100vw-320px))] md:max-w-[760px] md:translate-x-0 md:rounded-l-[28px] md:rounded-r-none"

  return (
    <DialogPortal>
      {withOverlay && <DialogOverlay />}
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-dialog-surface={resolvedSurface}
        className={cn(
          "modalCard fixed z-[161] gap-0 bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          surfaceClass,
          resolvedSurface === "task" ? "data-open:slide-in-from-bottom data-closed:slide-out-to-bottom md:data-open:slide-in-from-right md:data-closed:slide-out-to-right" : "data-open:zoom-in-95 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute right-3 top-3 z-10 h-11 w-11 rounded-full bg-background/90 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
                size="icon"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{t("common.close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("modalFooter flex flex-col-reverse gap-2 border-t bg-white/95 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>关闭</DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("font-heading text-base leading-none font-medium", className)} {...props} />
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
