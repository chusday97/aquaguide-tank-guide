import type { ComponentProps } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../layout/LayoutModeProvider';

type AdaptiveDetailContentProps = ComponentProps<typeof DialogContent> & {
  /** Desktop browsing details stay open as a non-modal right rail. */
  workspace?: boolean;
  workspaceOpen?: boolean;
};

export function AdaptiveDetailContent({ className, workspace = false, workspaceOpen = false, children, ...props }: AdaptiveDetailContentProps) {
  const { isPhoneLayout } = useLayoutMode();

  if (workspace && !isPhoneLayout && !workspaceOpen) return null;

  return (
    <DialogContent
      surface="detail"
      data-surface={isPhoneLayout ? 'bottom-sheet' : 'floating-app-modal'}
      data-detail-viewport={isPhoneLayout ? 'phone-sheet' : 'desktop-modal'}
      data-detail-behavior={isPhoneLayout ? 'bottom-sheet' : 'floating-modal'}
      withOverlay={true}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden border-border bg-white p-0 duration-200',
        isPhoneLayout
          ? 'bottom-0 left-0 right-0 top-auto h-auto max-h-[90dvh] w-full max-w-full -translate-x-0 translate-y-0 rounded-b-none rounded-t-[32px] shadow-[0_-16px_56px_rgba(15,23,42,0.22)] border-x-0 border-b-0 border-t border-white/60'
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(880px,calc(100vw-48px))] max-w-[880px] h-[86dvh] max-h-[min(88dvh,880px)] rounded-[32px] shadow-[0_28px_85px_rgba(15,23,42,0.28)] border border-white/80 ring-1 ring-black/5',
        className,
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

(AdaptiveDetailContent as typeof AdaptiveDetailContent & { dialogSurface?: 'detail' }).dialogSurface = 'detail';
