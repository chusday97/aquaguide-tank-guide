import type { ComponentProps, ReactNode } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../layout/LayoutModeProvider';

type AdaptiveDetailContentProps = ComponentProps<typeof DialogContent> & {
  /** Desktop details that must participate in the page grid, never a fixed portal. */
  workspace?: boolean;
  workspaceOpen?: boolean;
};

export function AdaptiveDetailContent({ className, workspace = false, workspaceOpen = false, children, ...props }: AdaptiveDetailContentProps) {
  const { isPhoneLayout } = useLayoutMode();
  if (workspace && !isPhoneLayout) {
    if (!workspaceOpen) return null;
    return (
      <section
        data-surface="split-workspace-detail"
        role="region"
        aria-label="Detail workspace"
        className={cn('relative flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden border-l border-border/70 bg-[#FDFCF8]', className)}
      >
        {children as ReactNode}
      </section>
    );
  }
  return (
    <DialogContent
      data-surface={isPhoneLayout ? 'bottom-sheet' : workspace ? 'split-workspace-detail' : 'split-workspace-panel'}
      withOverlay={isPhoneLayout}
      className={cn(
        'flex flex-col overflow-hidden border-border bg-[#FDFCF8] p-0 shadow-[0_20px_60px_rgba(15,23,42,0.16)] duration-200',
        isPhoneLayout
          ? 'bottom-0 left-1/2 top-auto h-[92dvh] max-h-[92dvh] !w-full !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px] data-open:zoom-in-100 data-open:slide-in-from-bottom data-closed:zoom-out-100 data-closed:slide-out-to-bottom'
          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] w-[48vw] min-w-[560px] max-w-none translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 data-open:zoom-in-100 data-open:slide-in-from-right data-closed:zoom-out-100 data-closed:slide-out-to-right max-[1023px]:w-[58vw] max-[1023px]:min-w-0',
        className,
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}
