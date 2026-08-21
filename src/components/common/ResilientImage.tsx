import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { recordUiFailure } from '../../services/diagnostics/ui-failure.service';

const FALLBACK_IMAGE = '/image-placeholder.svg';

const withRetryToken = (src: string) => {
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}retry=1`;
};

type ResilientImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  loadingSurface?: 'neutral' | 'transparent';
};

export function ResilientImage({ src = '', alt = '', className = '', onLoad, loadingSurface = 'neutral', ...props }: ResilientImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const resolvedSrc = attempt === 0 ? src : attempt === 1 ? withRetryToken(src) : FALLBACK_IMAGE;
  const transparentFailure = loadingSurface === 'transparent' && failed;

  return (
    <span className={`relative block h-full w-full overflow-hidden ${loadingSurface === 'transparent' ? 'resilient-image-transparent' : ''}`}>
      {!loaded && !transparentFailure && <span className={`${loadingSurface === 'transparent' ? 'resilient-image-transparent-loader' : 'absolute inset-0 animate-pulse bg-slate-100'}`} aria-hidden="true" />}
      {transparentFailure ? <span className="resilient-image-transparent-fallback" role="img" aria-label={alt || '图片暂不可用'}>◌</span> : <img
        {...props}
        src={resolvedSrc}
        alt={alt}
        className={`${className} relative z-[1]`}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={() => {
          if (attempt < 1) {
            setAttempt(value => value + 1);
          } else if (loadingSurface === 'transparent') {
            recordUiFailure({ kind: 'image', page: window.location.pathname, resource: src, error: new Error('透明场景图片重试失败') });
            setFailed(true);
          } else if (attempt < 2) {
            setAttempt(value => value + 1);
          }
        }}
      />}
    </span>
  );
}
