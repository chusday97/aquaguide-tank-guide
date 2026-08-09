import { useEffect, useMemo, useState, type ImgHTMLAttributes } from 'react';
import { recordUiFailure } from '../../services/diagnostics/ui-failure.service';

const FALLBACK_IMAGE = '/image-placeholder.svg';

const withRetryToken = (src: string) => {
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}retry=1`;
};

const isRemoteImage = (src: string) => /^https?:\/\//i.test(src);

export function ResilientImage({
  src = '',
  alt = '',
  className = '',
  onLoad,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const remote = useMemo(() => isRemoteImage(src), [src]);

  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
  }, [src]);

  const resolvedSrc = attempt === 0
    ? src
    : remote && attempt === 1
      ? withRetryToken(src)
      : FALLBACK_IMAGE;

  return (
    <span className="relative block h-full w-full overflow-hidden">
      {!loaded && <span className="absolute inset-0 animate-pulse bg-slate-100" aria-hidden="true" />}
      <img
        {...props}
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={`${className} relative z-[1]`}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={() => {
          if (resolvedSrc === FALLBACK_IMAGE) return;

          if (!remote) {
            recordUiFailure({
              kind: 'image',
              page: window.location.pathname,
              resource: src,
              error: new Error('本地图片加载失败'),
            });
            setAttempt(2);
            return;
          }

          if (attempt === 0) {
            setAttempt(1);
            return;
          }

          recordUiFailure({
            kind: 'image',
            page: window.location.pathname,
            resource: src,
            error: new Error('远程图片重试失败'),
          });
          setAttempt(2);
        }}
      />
    </span>
  );
}
