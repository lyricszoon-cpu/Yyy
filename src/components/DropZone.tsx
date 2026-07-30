import React, { useRef, useState } from "react";
import { Language } from "../types";
import { translations } from "../lib/translations";
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface DropZoneProps {
  language: Language;
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

// Built-in sample AI generated images for immediate testing
const SAMPLE_IMAGES = [
  {
    id: "portrait",
    name: "AI Portrait (Midjourney v6)",
    tag: "SynthID Detected",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "landscape",
    name: "AI Cyberpunk City (Imagen 3)",
    tag: "C2PA Tagged",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "anime",
    name: "AI Artwork (Stable Diffusion XL)",
    tag: "High AI Risk",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
  },
];

export const DropZone: React.FC<DropZoneProps> = ({
  language,
  onFilesSelected,
  isProcessing,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = (Array.from(e.dataTransfer.files) as File[]).filter((file) =>
        file.type.startsWith("image/")
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = (Array.from(e.target.files) as File[]).filter((file) =>
        file.type.startsWith("image/")
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleSampleClick = async (sample: typeof SAMPLE_IMAGES[0]) => {
    try {
      setLoadingSample(sample.id);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const sampleFile = new Blob([blob], { type: "image/jpeg" }) as File;
      Object.defineProperty(sampleFile, "name", {
        value: `${sample.id}_sample_ai.jpg`,
        writable: true,
        configurable: true,
      });
      onFilesSelected([sampleFile]);
    } catch (err) {
      console.error("Error loading sample image:", err);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center backdrop-blur-xl ${
          isDragOver
            ? "border-indigo-500 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/10"
            : "border-slate-800 hover:border-indigo-500/50 bg-slate-900/60 hover:bg-indigo-950/15"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />

        <div className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/20 via-indigo-500/10 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:border-indigo-400 transition-all duration-300 shadow-inner">
            <UploadCloud className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.dropzoneTitle}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto font-medium">
              {t.dropzoneSubtitle}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-xs flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>SynthID Neutralizer</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-xs flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>C2PA / EXIF Strip</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-xs flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>ISO Sensor Grain</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample AI Test Images */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-slate-800/80 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>নমুনা এআই ছবি দিয়ে দ্রুত চেষ্টা করে দেখুন (Quick Test Samples)</span>
          </span>
          <span className="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">১-ক্লিকে টেস্ট করুন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              disabled={isProcessing || loadingSample !== null}
              onClick={() => handleSampleClick(sample)}
              className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-950/60 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/40 transition-all text-left group cursor-pointer shadow-sm"
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-800 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                  {sample.name}
                </p>
                <span className="inline-block text-[10px] text-indigo-400 font-semibold">
                  {sample.tag}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors mr-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
