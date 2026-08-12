import type { ComponentProps, CSSProperties } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../layout/LayoutModeProvider';

type AdaptiveTaskContentProps = ComponentProps<typeof DialogContent>;

export function AdaptiveTaskContent({ className, style, ...props }: AdaptiveTaskContentProps) {
  const { isPhoneLayout } = useLayoutMode();
  const desktopWidth = 'min(var(--adaptive-task-width, var(--surface-editing-width, 560px)), calc(100vw - var(--desktop-sidebar-width, 280px) - 48px))';
  const desktopGeometry: CSSProperties | undefined = isPhoneLayout
    ? undefined
    : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 'auto',
        width: desktopWidth,
        maxWidth: desktopWidth,
        height: '100dvh',
        maxHeight: '100dvh',
        transform: 'none',
      };

  return (
    <DialogContent
      data-surface={isPhoneLayout ? 'task-flow-mobile' : 'task-flow-drawer'}
      className={cn(
        'flex flex-col overflow-hidden border-border bg-white p-0 shadow-[0_24px_70px_rgba(15,23,42,0.16)] duration-200',
        isPhoneLayout
          ? 'bottom-0 left-0 right-auto top-0 h-[100dvh] max-h-[100dvh] w-full max-w-[430px] translate-x-0 translate-y-0 rounded-none'
          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] min-w-0 translate-x-0 translate-y-0 rounded-none rounded-l-[24px] data-open:slide-in-from-right-full data-closed:slide-out-to-right-full',
        className,
      )}
      style={{ ...desktopGeometry, ...style }}
      {...props}
    />
  );
}
