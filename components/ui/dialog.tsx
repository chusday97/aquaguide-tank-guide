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
  const isPhoneViewport = usePhoneViewport()
  const surfaceChildren = typeof children === "function" ? null : children
  const markedSurface = React.useMemo(() => getMarkedSurface(surfaceChildren), [surfaceChildren])
  const isRailSurface = markedSurface === "detail" || markedSurface === "task"
  const resolvedModal = modal ?? (isRailSurface ? isPhoneViewport : true)
  const keepNonModalSurfaceOpen = disablePointerDismissal ?? resolvedModal === false

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
        "fixed inset-0 isolate z-[160] bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
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
  const isRailSurface = resolvedSurface === "detail" || resolvedSurface === "task"
  const resolvedOverlay = withOverlay ?? (!isRailSurface || isPhoneViewport)

  const surfaceClass = resolvedSurface === "blocking"
    ? "top-1/2 left-1/2 w-[min(480px,calc(100vw-32px))] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px]"
    : resolvedSurface === "fullscreen" || resolvedSurface === "media"
      ? "top-1/2 left-1/2 max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px]"
      : resolvedSurface === "detail"
        ? isPhoneViewport
          ? "bottom-0 left-1/2 top-auto h-[68dvh] min-h-[52dvh] max-h-[82dvh] w-[min(100vw,430px)] max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px]"
          : "bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] w-[clamp(480px,42vw,600px)] max-w-[calc(100vw-280px)] translate-x-0 translate-y-0 rounded-l-[28px] rounded-r-none"
        : "bottom-0 left-1/2 top-auto h-[82dvh] max-h-[92dvh] w-[min(100vw,430px)] max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px] md:left-auto md:right-0 md:top-0 md:h-[100dvh] md:max-h-[100dvh] md:w-[min(760px,calc(100vw-320px))] md:max-w-[760px] md:translate-x-0 md:rounded-l-[28px] md:rounded-r-none"

  const motionClass = resolvedSurface === "task"
    ? "data-open:slide-in-from-bottom data-closed:slide-out-to-bottom md:data-open:slide-in-from-right md:data-closed:slide-out-to-right"
    : resolvedSurface === "detail"
      ? isPhoneViewport
        ? "data-open:zoom-in-100 data-open:slide-in-from-bottom data-closed:zoom-out-100 data-closed:slide-out-to-bottom"
        : "data-open:zoom-in-100 data-open:slide-in-from-right data-closed:zoom-out-100 data-closed:slide-out-to-right"
      : "data-open:zoom-in-95 data-closed:zoom-out-95"

  return (
    <DialogPortal>
      {resolvedOverlay && <DialogOverlay />}
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-dialog-surface={resolvedSurface}
        className={cn(
          "modalCard fixed z-[161] gap-0 bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          surfaceClass,
          motionClass,
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
            <XIcon
            />
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
