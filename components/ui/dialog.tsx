import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { useLayoutMode } from "../../src/components/layout/LayoutModeProvider"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

export type DialogSurfaceKind = "auto" | "detail" | "task" | "blocking" | "fullscreen" | "media"
type ResolvedDialogSurface = Exclude<DialogSurfaceKind, "auto">
type MarkedElementType = { dialogSurface?: "detail" | "task" }

type SurfaceAwareChildProps = {
  surface?: DialogSurfaceKind
  showCloseButton?: boolean
  className?: string
  children?: React.ReactNode
}

let activeModalBodyLocks = 0

function acquireModalBodyLock() {
  if (typeof document === "undefined") return () => undefined
  activeModalBodyLocks += 1
  document.body.classList.add("modal-open")
  return () => {
    activeModalBodyLocks = Math.max(0, activeModalBodyLocks - 1)
    if (activeModalBodyLocks === 0) document.body.classList.remove("modal-open")
  }
}

function inferSurface(surface: DialogSurfaceKind): ResolvedDialogSurface {
  return surface === "auto" ? "task" : surface
}

function getMarkedSurface(children: React.ReactNode): ResolvedDialogSurface | null {
  let result: ResolvedDialogSurface | null = null
  React.Children.forEach(children, child => {
    if (result || !React.isValidElement(child)) return
    const childProps = child.props as SurfaceAwareChildProps
    if (child.type === DialogContent) {
      result = inferSurface(childProps.surface ?? "auto")
      return
    }
    const childType = child.type as MarkedElementType
    if (childType && typeof childType !== "string" && childType.dialogSurface) {
      result = childType.dialogSurface
      return
    }
    if (childProps.children) result = getMarkedSurface(childProps.children)
  })
  return result
}

function usePhoneViewport() {
  return useLayoutMode().isPhoneLayout
}

function Dialog({ modal, disablePointerDismissal, children, ...props }: DialogPrimitive.Root.Props) {
  const resolvedModal = modal ?? true
  const keepNonModalSurfaceOpen = disablePointerDismissal ?? false

  React.useEffect(() => {
    if (!props.open || !resolvedModal) return
    return acquireModalBodyLock()
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

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-[160] bg-slate-950/45 backdrop-blur-sm duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  withOverlay,
  surface = "auto",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  withOverlay?: boolean
  surface?: DialogSurfaceKind
}) {
  const { t } = useTranslation()
  const isPhoneViewport = usePhoneViewport()
  const resolvedSurface = inferSurface(surface)
  const resolvedOverlay = withOverlay ?? true

  // App Modal Surface Classes:
  // Mobile: iOS-style Bottom Sheet with rounded top corners
  // Desktop: Centered Floating App Card with all-around rounded corners and deep floating shadow
  const surfaceClass = isPhoneViewport
    ? "bottom-0 left-0 right-0 top-auto h-auto max-h-[90dvh] w-full max-w-full -translate-x-0 translate-y-0 rounded-b-none rounded-t-[32px] shadow-[0_-16px_48px_rgba(15,23,42,0.22)] border-x-0 border-b-0 border-t border-white/60"
    : resolvedSurface === "blocking"
      ? "top-1/2 left-1/2 w-[min(480px,calc(100vw-32px))] max-w-[calc(100vw-32px)] max-h-[85dvh] -translate-x-1/2 -translate-y-1/2 rounded-[32px] shadow-[0_24px_70px_rgba(15,23,42,0.25)] border border-white/80"
      : resolvedSurface === "fullscreen" || resolvedSurface === "media"
        ? "top-1/2 left-1/2 w-[min(1120px,calc(100vw-48px))] max-w-[calc(100vw-48px)] max-h-[92dvh] -translate-x-1/2 -translate-y-1/2 rounded-[32px] shadow-[0_25px_80px_rgba(15,23,42,0.28)] border border-white/80"
        : resolvedSurface === "detail"
          ? "top-1/2 left-1/2 w-[min(840px,calc(100vw-48px))] max-w-[840px] max-h-[min(88dvh,860px)] -translate-x-1/2 -translate-y-1/2 rounded-[32px] shadow-[0_25px_80px_rgba(15,23,42,0.28)] border border-white/80"
          : "top-1/2 left-1/2 w-[min(640px,calc(100vw-48px))] max-w-[640px] max-h-[min(88dvh,820px)] -translate-x-1/2 -translate-y-1/2 rounded-[32px] shadow-[0_25px_80px_rgba(15,23,42,0.28)] border border-white/80"

  const motionClass = isPhoneViewport
    ? "data-open:slide-in-from-bottom data-closed:slide-out-to-bottom duration-250"
    : "data-open:zoom-in-95 data-closed:zoom-out-95 data-open:fade-in-0 data-closed:fade-out-0 duration-200"

  return (
    <DialogPortal>
      {resolvedOverlay && <DialogOverlay />}
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-dialog-surface={resolvedSurface}
        className={cn(
          "modalCard fixed z-[161] flex flex-col overflow-hidden bg-popover text-sm text-popover-foreground ring-1 ring-black/5 outline-none data-open:animate-in data-closed:animate-out",
          surfaceClass,
          motionClass,
          className,
        )}
        {...props}
      >
        {/* iOS Grab Handle for mobile bottom sheet */}
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-ink/15 md:hidden" />
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute right-3.5 top-3.5 z-20 h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 text-ink/70 backdrop-blur-md shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
                size="icon"
              />
            }
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">{t("common.close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "modalFooter flex flex-col-reverse gap-2 border-t bg-white/95 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          关闭
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
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
