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
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startRotation = useRef(0);
  const hasDragged = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    startRotation.current = rotationY;
    hasDragged.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotationY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 3) hasDragged.current = true;
    setRotationY(startRotation.current + dx * 0.5);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasDragged.current && onClick) onClick(e);
  }, [onClick]);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-xl overflow-hidden border-2 border-border bg-muted select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        style={{ perspective: "800px" }}
      >
        <div style={{ transform: `rotateY(${rotationY}deg)`, transition: isDragging ? "none" : "transform 0.3s ease-out" }}>
          <img
            src={images[0]}
            alt={alt}
            className="w-full pointer-events-none"
            draggable={false}
          />
        </div>
        {overlay}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <RotateCcw className="w-3 h-3" />
        <span>Drag to rotate 360°</span>
      </div>
    </div>
  );
};

export default Asset360Viewer;
