import { useState, useRef, useCallback } from "react";
import { RotateCcw } from "lucide-react";

interface Asset360ViewerProps {
  images: string[];
  alt: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  overlay?: React.ReactNode;
}

const Asset360Viewer = ({ images, alt, className = "", onClick, overlay }: Asset360ViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const lastIndex = useRef(0);
  const hasDragged = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const labels = ["Front", "Side", "Back", "View 4", "View 5", "View 6"];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    lastIndex.current = currentIndex;
    hasDragged.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [currentIndex]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || images.length <= 1) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 5) hasDragged.current = true;
    // Lower sensitivity = easier to rotate through all angles
    const sensitivity = 60;
    const indexDelta = Math.round(dx / sensitivity);
    const newIndex = ((lastIndex.current - indexDelta) % images.length + images.length) % images.length;
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  }, [isDragging, images.length, currentIndex]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasDragged.current && onClick) onClick(e);
  }, [onClick]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className={`relative rounded-xl overflow-hidden border-2 border-border bg-muted select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        {/* Stack all images, show current with crossfade */}
        <div className="relative">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${alt} - ${labels[i] || `View ${i + 1}`}`}
              className="w-full pointer-events-none"
              draggable={false}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: 0,
                left: 0,
                opacity: i === currentIndex ? 1 : 0,
                transition: "opacity 0.25s ease",
              }}
            />
          ))}
        </div>
        {overlay}
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="w-3 h-3" />
            <span>Drag to rotate • {labels[currentIndex] || `View ${currentIndex + 1}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asset360Viewer;
