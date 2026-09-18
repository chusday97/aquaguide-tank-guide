import type { ComponentProps, CSSProperties } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../layout/LayoutModeProvider';

type AdaptiveTaskContentProps = ComponentProps<typeof DialogContent>;

export function AdaptiveTaskContent({ className, style, ...props }: AdaptiveTaskContentProps) {
  const { isPhoneLayout } = useLayoutMode();

  return (
    <DialogContent
      surface="task"
      data-surface={isPhoneLayout ? 'task-flow-mobile' : 'task-flow-modal'}
      withOverlay={true}
      className={cn(
        'flex flex-col overflow-hidden border-border bg-white p-0 shadow-[0_25px_75px_rgba(15,23,42,0.24)] duration-200',
        isPhoneLayout
          ? 'bottom-0 left-0 right-0 top-auto h-auto max-h-[90dvh] w-full rounded-b-none rounded-t-[32px] border-x-0 border-b-0 border-t border-white/60'
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(640px,calc(100vw-48px))] max-w-[640px] max-h-[min(88dvh,820px)] rounded-[32px] border border-white/80 ring-1 ring-black/5',
        className,
      )}
      style={style}
      {...props}
    />
  );
}
