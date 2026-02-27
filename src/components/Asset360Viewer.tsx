import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    lastIndex.current = currentIndex;
    hasDragged.current = false;
    e.preventDefault();
  }, [currentIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || images.length <= 1) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 5) hasDragged.current = true;
    const sensitivity = 80;
    const indexDelta = Math.floor(dx / sensitivity);
    const newIndex = ((lastIndex.current + indexDelta) % images.length + images.length) % images.length;
    setCurrentIndex(newIndex);
  }, [isDragging, images.length]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    lastIndex.current = currentIndex;
    hasDragged.current = false;
  }, [currentIndex]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1) return;
    const dx = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(dx) > 5) hasDragged.current = true;
    const sensitivity = 80;
    const indexDelta = Math.floor(dx / sensitivity);
    const newIndex = ((lastIndex.current + indexDelta) % images.length + images.length) % images.length;
    setCurrentIndex(newIndex);
  }, [isDragging, images.length]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const labels = ["Front", "Side", "Back"];

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-xl overflow-hidden border-2 border-border bg-muted select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => { if (!hasDragged.current && onClick) onClick(e); }}
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} - ${labels[currentIndex] || `View ${currentIndex + 1}`}`}
          className="w-full"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
        {overlay}
      </div>

      {/* View indicator + drag hint */}
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
