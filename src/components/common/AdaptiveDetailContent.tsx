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
      data-surface={isPhoneLayout ? 'bottom-sheet' : 'detail-rail'}
      data-detail-viewport={isPhoneLayout ? 'phone-sheet' : 'desktop-rail'}
      data-detail-behavior={isPhoneLayout ? 'bottom-sheet' : 'persistent-browse-rail'}
      withOverlay={isPhoneLayout}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden border-border bg-[#FDFCF8] p-0 duration-200',
        isPhoneLayout
          ? 'bottom-0 left-1/2 top-auto h-[68dvh] min-h-[52dvh] max-h-[82dvh] !w-[min(100vw,430px)] !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px] shadow-[0_-18px_56px_rgba(15,23,42,0.18)] data-open:zoom-in-100 data-open:slide-in-from-bottom data-closed:zoom-out-100 data-closed:slide-out-to-bottom'
          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] w-[clamp(480px,42vw,600px)] max-w-[calc(100vw-280px)] translate-x-0 translate-y-0 rounded-l-[28px] rounded-r-none border-y-0 border-r-0 shadow-[-22px_0_64px_rgba(15,23,42,0.16)] data-open:zoom-in-100 data-open:slide-in-from-right data-closed:zoom-out-100 data-closed:slide-out-to-right',
        className,
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

(AdaptiveDetailContent as typeof AdaptiveDetailContent & { dialogSurface?: 'detail' }).dialogSurface = 'detail';
