import type { ComponentProps } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../layout/LayoutModeProvider';

type AdaptiveTaskContentProps = ComponentProps<typeof DialogContent>;

export function AdaptiveTaskContent({ className, ...props }: AdaptiveTaskContentProps) {
  const { isPhoneLayout } = useLayoutMode();
  return (
    <DialogContent
      data-surface="task-flow"
      className={cn(
        'flex flex-col overflow-hidden border-border bg-[#FDFCF8] p-0 shadow-[0_24px_70px_rgba(15,23,42,0.18)] duration-200',
        isPhoneLayout
          ? 'bottom-0 left-0 right-auto top-0 h-[100dvh] max-h-[100dvh] w-full max-w-[430px] translate-x-0 translate-y-0 rounded-none data-open:zoom-in-100 data-open:slide-in-from-bottom data-closed:zoom-out-100 data-closed:slide-out-to-bottom'
          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] w-[min(860px,calc(100vw-76px))] max-w-[860px] translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 data-open:zoom-in-100 data-open:slide-in-from-right data-closed:zoom-out-100 data-closed:slide-out-to-right',
        className,
      )}
      {...props}
    />
  );
}
