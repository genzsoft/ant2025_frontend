import React, { useState, useRef } from 'react';

export function ProductDetailsZoom({ src, alt }) {
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, show: false });
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLensPos({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setLensPos((prev) => ({ ...prev, show: false }));
  };

  const zoomLevel = 2; // zoom strength
  const lensSize = 220; // circle size (increased)

  return (
    <div
      className="relative inline-block"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height: '100%' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        style={{ display: 'block', width: '100%', height: '100%' }}
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600'; }}
      />
      {/* Circle zoom lens */}
      {lensPos.show && imgRef.current && (
        <div
          className="absolute rounded-full border border-gray-400 pointer-events-none shadow-lg"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            top: `${lensPos.y - lensSize / 2}px`,
            left: `${lensPos.x - lensSize / 2}px`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${imgRef.current.offsetWidth * zoomLevel}px ${imgRef.current.offsetHeight * zoomLevel}px`,
            backgroundPosition: `-${lensPos.x * zoomLevel - lensSize / 2}px -${lensPos.y * zoomLevel - lensSize / 2}px`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
