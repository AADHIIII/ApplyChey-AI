import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Lazy loading image component with IntersectionObserver
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E',
  threshold = 0.01,
  rootMargin = '50px',
  onLoad,
  onError,
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(imageRef);

    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc(placeholder);
    onError?.();
  };

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...props}
      data-testid="lazy-image"
    />
  );
};

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  lazy?: boolean;
}

/**
 * Responsive image component with srcSet support
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  srcSet,
  sizes = '100vw',
  alt,
  lazy = true,
  className = '',
  ...props
}) => {
  if (lazy) {
    return (
      <LazyImage
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

/**
 * Background image component with lazy loading
 */
interface LazyBackgroundProps {
  src: string;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export const LazyBackground: React.FC<LazyBackgroundProps> = ({
  src,
  placeholder,
  className = '',
  children
}) => {
  const [backgroundImage, setBackgroundImage] = useState(placeholder ? `url(${placeholder})` : 'none');
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload the image
            const img = new Image();
            img.onload = () => {
              setBackgroundImage(`url(${src})`);
              setIsLoaded(true);
            };
            img.src = src;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '50px'
      }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [src]);

  return (
    <div
      ref={elementRef}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-70'} ${className}`}
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {children}
    </div>
  );
};

/**
 * Utility to get optimal image format based on browser support
 */
export const getOptimalImageFormat = (): 'webp' | 'avif' | 'jpeg' => {
  if (typeof window === 'undefined') return 'jpeg';

  // Check for AVIF support
  const canvas = document.createElement('canvas');
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }

  // Check for WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  return 'jpeg';
};

/**
 * Generate srcSet for responsive images
 */
export const generateSrcSet = (
  basePath: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return widths
    .map(width => `${basePath}?w=${width} ${width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (
  breakpoints: { maxWidth: string; size: string }[]
): string => {
  return breakpoints
    .map(bp => `(max-width: ${bp.maxWidth}) ${bp.size}`)
    .join(', ');
};
