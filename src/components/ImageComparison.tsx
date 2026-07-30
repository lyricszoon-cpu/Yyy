import React, { useState, useRef } from "react";
import { Language, ProcessedImageItem } from "../types";
import { translations } from "../lib/translations";
import { SlidersHorizontal, Download, ZoomIn, Eye, Sparkles } from "lucide-react";

interface ImageComparisonProps {
  language: Language;
  item: ProcessedImageItem;
  onDownload: (item: ProcessedImageItem) => void;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  language,
  item,
  onDownload,
}) => {
  const t = translations[language];
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setSliderPosition((x / rect.width) * 100);

    if (isZooming) {
      setZoomPos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.touches[0].clientX - rect.left));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-2xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
          <h3 className="text-sm font-bold text-white truncate max-w-xs">
            {item.name}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            ({item.processedWidth}x{item.processedHeight}px • {Math.round(item.size / 1024)} KB)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsZooming(!isZooming)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center space-x-1.5 cursor-pointer ${
              isZooming
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Pixel Lens Zoom</span>
          </button>

          <button
            onClick={() => onDownload(item)}
            className="px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadImage}</span>
          </button>
        </div>
      </div>

      {/* Interactive Split Screen Comparison Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 select-none cursor-ew-resize group"
      >
        {/* Processed (After) Image - Full width under */}
        <img
          src={item.processedUrl}
          alt="Humanized Output"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Original (Before) Image - Clipped by slider */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={item.originalUrl}
            alt="Original AI Image"
            className="absolute inset-0 w-full h-full object-contain max-w-none"
            style={{
              width: containerRef.current ? containerRef.current.clientWidth : "100%",
              height: "100%",
            }}
          />
        </div>

        {/* Slider Divider Bar */}
        <div
          className="absolute inset-y-0 w-0.5 bg-indigo-500 shadow-md pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shadow-lg">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Labels Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[11px] font-bold shadow-xs flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>{t.beforeText} (SynthID)</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{t.afterText} (Human Photo)</span>
          </span>
        </div>

        {/* Zoom Lens Magnifying Overlay */}
        {isZooming && (
          <div
            className="absolute w-40 h-40 rounded-full border-2 border-indigo-600 overflow-hidden pointer-events-none shadow-2xl z-30 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${zoomPos.x}%`,
              top: `${zoomPos.y}%`,
            }}
          >
            <div
              className="w-full h-full bg-no-repeat bg-cover"
              style={{
                backgroundImage: `url(${item.processedUrl})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: "400%",
              }}
            />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
              4x Magnify
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-500 flex items-center justify-center space-x-2 font-medium">
        <Eye className="w-3.5 h-3.5 text-indigo-600" />
        <span>{t.compareSlider}</span>
      </p>
    </div>
  );
};
