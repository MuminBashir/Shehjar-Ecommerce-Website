import React, { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

const ProductImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDetailView, setIsDetailView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // Handle no images case
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-md bg-gray-200">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  const openDetailView = () => {
    setIsDetailView(true);
    // Reset zoom and pan when opening detail view
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const closeDetailView = () => {
    setIsDetailView(false);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel((prevZoom) => Math.min(prevZoom + 0.5, 3));
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel((prevZoom) => Math.max(prevZoom - 0.5, 1));
      // Reset pan position if zooming out to 1
      if (zoomLevel <= 1.5) {
        setPanPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Calculate boundaries to prevent dragging too far
      const maxX = ((zoomLevel - 1) * (imageRef.current?.offsetWidth || 0)) / 2;
      const maxY =
        ((zoomLevel - 1) * (imageRef.current?.offsetHeight || 0)) / 2;

      setPanPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;

      // Calculate boundaries to prevent dragging too far
      const maxX = ((zoomLevel - 1) * (imageRef.current?.offsetWidth || 0)) / 2;
      const maxY =
        ((zoomLevel - 1) * (imageRef.current?.offsetHeight || 0)) / 2;

      setPanPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      });

      // Prevent default to stop page scrolling while panning
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset zoom and pan when changing image
  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  return (
    <div className="product-carousel relative">
      {/* Main Image */}
      <div
        className="mb-4 cursor-pointer overflow-hidden rounded-lg border"
        onClick={openDetailView}
      >
        <img
          src={images[currentImageIndex]}
          alt="Product"
          className="h-auto w-full object-cover"
        />
      </div>

      {/* Thumbnail Images - Horizontal Scrolling */}
      {images.length > 1 && (
        <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded border ${
                index === currentImageIndex
                  ? "border-blue-500 ring-2 ring-blue-300"
                  : "border-gray-200"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img
                src={image}
                alt={`Product thumbnail ${index + 1}`}
                className="aspect-square h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Detail View Modal (not full screen) */}
      {isDetailView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-h-screen w-full max-w-4xl overflow-hidden rounded-lg bg-white">
            {/* Header with close button */}
            <div className="absolute top-0 right-0 z-10 m-2 flex gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className={`rounded-full bg-white p-2 shadow-md ${
                  zoomLevel <= 1
                    ? "text-gray-400"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className={`rounded-full bg-white p-2 shadow-md ${
                  zoomLevel >= 3
                    ? "text-gray-400"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={closeDetailView}
                className="rounded-full bg-white p-2 text-gray-800 shadow-md hover:bg-gray-100"
                aria-label="Close detail view"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main image container */}
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden bg-gray-100"
              style={{
                cursor: zoomLevel > 1 ? "move" : "default",
                touchAction: zoomLevel > 1 ? "none" : "auto",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                ref={imageRef}
                src={images[currentImageIndex]}
                alt="Product detail view"
                className="max-h-full max-w-full object-contain transition-transform"
                style={{
                  transform: `scale(${zoomLevel}) translate(${
                    panPosition.x / zoomLevel
                  }px, ${panPosition.y / zoomLevel}px)`,
                  transformOrigin: "center center",
                }}
                draggable="false"
              />
            </div>

            {/* Navigation arrows if there are multiple images */}
            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 transform justify-between px-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange(
                      currentImageIndex === 0
                        ? images.length - 1
                        : currentImageIndex - 1
                    );
                  }}
                  className="pointer-events-auto rounded-full bg-white bg-opacity-70 p-2 text-gray-800 shadow-md transition-opacity hover:bg-opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange(
                      currentImageIndex === images.length - 1
                        ? 0
                        : currentImageIndex + 1
                    );
                  }}
                  className="pointer-events-auto rounded-full bg-white bg-opacity-70 p-2 text-gray-800 shadow-md transition-opacity hover:bg-opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* Thumbnail navigation in detail view */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 bg-white bg-opacity-75 py-2">
                <div className="flex justify-center gap-2 overflow-x-auto px-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded border-2 ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-transparent opacity-70"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageChange(index);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
