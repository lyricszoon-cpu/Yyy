import React from "react";
import { Language, ProcessedImageItem } from "../types";
import { translations } from "../lib/translations";
import JSZip from "jszip";
import { Download, Trash2, CheckCircle, FileArchive, Clock } from "lucide-react";

interface BatchGalleryProps {
  language: Language;
  items: ProcessedImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onDownload: (item: ProcessedImageItem) => void;
}

export const BatchGallery: React.FC<BatchGalleryProps> = ({
  language,
  items,
  selectedId,
  onSelect,
  onDelete,
  onClearAll,
  onDownload,
}) => {
  const t = translations[language];

  if (items.length === 0) return null;

  const completedItems = items.filter((item) => item.status === "completed");

  const handleDownloadZip = async () => {
    if (completedItems.length === 0) return;

    const zip = new JSZip();
    completedItems.forEach((item, index) => {
      const extension = item.processedBlob.type.includes("png")
        ? "png"
        : item.processedBlob.type.includes("webp")
        ? "webp"
        : "jpg";
      const fileName = `humanized_${index + 1}_${item.name.replace(/\.[^/.]+$/, "")}.${extension}`;
      zip.file(fileName, item.processedBlob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `RemoveSynthID_Cleaned_Photos_${Date.now()}.zip`;
    link.click();
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            {t.historyTitle} ({items.length})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {completedItems.length > 1 && (
            <button
              onClick={handleDownloadZip}
              className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
            >
              <FileArchive className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.downloadAllZip}</span>
            </button>
          )}

          <button
            onClick={onClearAll}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 transition-all cursor-pointer border border-slate-700"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center space-x-3 relative group ${
                isSelected
                  ? "bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
              }`}
            >
              <img
                src={item.processedUrl || item.originalUrl}
                alt={item.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-800"
              />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {item.name}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-medium">
                  <span className="font-mono">{Math.round(item.size / 1024)} KB</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>SynthID Cleaned</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(item);
                  }}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title={t.downloadImage}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-rose-600 hover:text-white border border-slate-700 text-slate-400 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
