import type { ComponentProps } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../layout/LayoutModeProvider';

type AdaptiveDetailContentProps = ComponentProps<typeof DialogContent>;

export function AdaptiveDetailContent({ className, ...props }: AdaptiveDetailContentProps) {
  const { isPhoneLayout } = useLayoutMode();
  return (
    <DialogContent
      data-surface={isPhoneLayout ? 'bottom-sheet' : 'detail-drawer'}
      className={cn(
        'flex flex-col overflow-hidden border-border bg-[#FDFCF8] p-0 shadow-[0_20px_60px_rgba(15,23,42,0.16)] duration-200',
        isPhoneLayout
          ? 'bottom-0 left-1/2 top-auto h-[92dvh] max-h-[92dvh] !w-full !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px] data-open:zoom-in-100 data-open:slide-in-from-bottom data-closed:zoom-out-100 data-closed:slide-out-to-bottom'
          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] w-[min(720px,calc(100vw-76px))] max-w-[720px] translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 data-open:zoom-in-100 data-open:slide-in-from-right data-closed:zoom-out-100 data-closed:slide-out-to-right',
        className,
      )}
      {...props}
    />
  );
}
