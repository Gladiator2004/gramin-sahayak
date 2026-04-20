/**
 * LazyImage — IntersectionObserver-based lazy image with skeleton + fallback.
 * Falls back to native loading="lazy" if IO unavailable.
 */
import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  wrapperClassName?: string;
}

const LazyImage = ({ src, alt, fallbackSrc, className, wrapperClassName, ...rest }: LazyImageProps) => {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setCurrentSrc(src);
  }, [src]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setErrored(true);
  };

  return (
    <div ref={ref} className={cn("relative w-full h-full bg-muted overflow-hidden", wrapperClassName)}>
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      {errored ? (
        <div className="flex items-center justify-center h-full w-full">
          <ImageOff className="h-8 w-8 text-muted-foreground/40" />
        </div>
      ) : inView ? (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...rest}
        />
      ) : null}
    </div>
  );
};

export default LazyImage;
