import type { ComponentProps } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../layout/LayoutModeProvider';

type AdaptiveDetailContentProps = ComponentProps<typeof DialogContent>;

export function AdaptiveDetailContent({ className, style, ...props }: AdaptiveDetailContentProps) {
  const { isPhoneLayout } = useLayoutMode();
  const desktopWidth = 'min(var(--adaptive-surface-width, var(--surface-reading-width, 520px)), calc(100vw - var(--desktop-sidebar-width, 280px) - 48px))';
  const surfaceStyle = isPhoneLayout
    ? style
    : {
        ...style,
        position: 'fixed' as const,
        inset: '0 0 0 auto',
        width: desktopWidth,
        maxWidth: desktopWidth,
        height: '100dvh',
        maxHeight: '100dvh',
        transform: 'none',
      };

  return (
    <DialogContent
      data-surface={isPhoneLayout ? 'bottom-sheet' : 'right-drawer'}
      className={cn(
        'flex flex-col overflow-hidden border-border bg-white p-0 shadow-[0_20px_60px_rgba(15,23,42,0.16)] duration-200',
        isPhoneLayout
          ? 'bottom-0 left-1/2 top-auto h-[92dvh] max-h-[92dvh] !w-full !max-w-[430px] -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-[28px]'
          : 'bottom-0 left-auto right-0 top-0 h-[100dvh] max-h-[100dvh] min-w-0 translate-x-0 translate-y-0 rounded-none rounded-l-[24px]',
        className,
      )}
      style={surfaceStyle}
      {...props}
    />
  );
}
