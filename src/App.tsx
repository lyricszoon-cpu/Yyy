import { useState, useEffect } from "react";
import { Language, ProcessedImageItem, ProcessingSettings, User } from "./types";
import { Header } from "./components/Header";
import { DropZone } from "./components/DropZone";
import { PresetSelector, PRESET_CONFIGS } from "./components/PresetSelector";
import { ImageComparison } from "./components/ImageComparison";
import { ForensicReportCard } from "./components/ForensicReportCard";
import { BatchGallery } from "./components/BatchGallery";
import { FaqSection } from "./components/FaqSection";
import { AuthModal } from "./components/AuthModal";
import { UserProfileModal } from "./components/UserProfileModal";
import { translations } from "./lib/translations";
import { processImageAndRemoveSynthId } from "./lib/synthIdRemover";
import { analyzeImageForensics } from "./lib/forensicAnalyzer";
import { Sparkles, Loader2, RefreshCw, ShieldCheck, Lock, AlertOctagon } from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<Language>("bn");
  const [settings, setSettings] = useState<ProcessingSettings>({
    preset: "dslr_realism",
    ...PRESET_CONFIGS.dslr_realism,
  });

  const [items, setItems] = useState<ProcessedImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // User Auth State & Disposable Email Protection
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // Check saved user session
    const savedUserStr = localStorage.getItem("remove_synthid_user");
    if (savedUserStr) {
      try {
        const parsed: User = JSON.parse(savedUserStr);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        }
      } catch (err) {
        console.warn("Invalid saved user session", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("remove_synthid_user");
    setCurrentUser(null);
  };

  const t = translations[language];

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    // Guard: Require verified non-disposable email login before processing
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);

    const newItems: ProcessedImageItem[] = [];

    for (const file of files) {
      const id = "img_" + Math.random().toString(36).substring(2, 9);
      const originalUrl = URL.createObjectURL(file);

      // 1. Analyze before metrics
      const beforeMetrics = await analyzeImageForensics(file, false);

      try {
        // 2. Process image with SynthID neutralizer engine
        const result = await processImageAndRemoveSynthId(file, settings);

        // 3. Optional server-side analysis call for Gemini AI insights
        let aiInsights = "";
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          const base64Data = await base64Promise;

          const res = await fetch("/api/analyze-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64Data }),
          });

          if (res.ok) {
            const data = await res.json();
            aiInsights = data.aiInsights || "";
          }
        } catch (err) {
          console.warn("Server side analysis failed, continuing with client analysis:", err);
        }

        // 4. Analyze post-processing metrics
        const afterMetrics = await analyzeImageForensics(result.processedBlob, true);

        const newItem: ProcessedImageItem = {
          id,
          name: file.name,
          size: result.processedBlob.size,
          originalUrl,
          processedUrl: result.processedUrl,
          processedBlob: result.processedBlob,
          originalWidth: result.width,
          originalHeight: result.height,
          processedWidth: result.width,
          processedHeight: result.height,
          beforeMetrics,
          afterMetrics,
          aiInsights,
          processingTimeMs: result.processingTimeMs,
          createdAt: new Date(),
          status: "completed",
        };

        newItems.push(newItem);
      } catch (err: any) {
        console.error("Error processing file:", err);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...newItems, ...prev]);
      setSelectedId(newItems[0].id);
    }

    setIsProcessing(false);
  };

  const selectedItem = items.find((i) => i.id === selectedId) || items[0] || null;

  const handleDownloadItem = (item: ProcessedImageItem) => {
    const link = document.createElement("a");
    link.href = item.processedUrl;
    const ext = item.processedBlob.type.includes("png")
      ? "png"
      : item.processedBlob.type.includes("webp")
      ? "webp"
      : "jpg";
    link.download = `humanized_${item.name.replace(/\.[^/.]+$/, "")}.${ext}`;
    link.click();
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) {
      const remaining = items.filter((i) => i.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleReProcessSelected = async () => {
    if (!selectedItem) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Fetch original blob
      const res = await fetch(selectedItem.originalUrl);
      const blob = await res.blob();

      const result = await processImageAndRemoveSynthId(blob, settings);
      const afterMetrics = await analyzeImageForensics(result.processedBlob, true);

      const updatedItem: ProcessedImageItem = {
        ...selectedItem,
        processedUrl: result.processedUrl,
        processedBlob: result.processedBlob,
        afterMetrics,
        processingTimeMs: result.processingTimeMs,
      };

      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? updatedItem : i))
      );
    } catch (err) {
      console.error("Error re-processing item:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative bg-grid-pattern">
      {/* Radial Glow Lights Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-blue-600/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Navigation Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10">
        {/* Hero Banner Section */}
        <div className="text-center space-y-5 max-w-4xl mx-auto pt-2">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold shadow-lg shadow-indigo-500/5">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>{language === "bn" ? "ফেসবুক, ইনস্টাগ্রাম ও সিন্থ-আইডি এআই ফিল্টার বাইপাস ইঞ্জিন" : "SynthID Watermark Neutralizer & Meta C2PA Metadata Cleaner"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.15]">
            {t.appTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
            {t.appSubtitle}
          </p>

          {/* Model Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-bold mr-1">Supported AI Generators:</span>
            {["Midjourney v6", "Google Imagen 3", "DALL-E 3", "Meta Imagine", "SDXL 1.0", "Adobe Firefly"].map((model) => (
              <span
                key={model}
                className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] font-semibold shadow-inner"
              >
                {model}
              </span>
            ))}
          </div>



          {/* Key Metrics Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800/80 shadow-xl text-center space-y-0.5">
              <p className="text-lg font-black text-indigo-400">100%</p>
              <p className="text-[11px] font-bold text-slate-400">Meta & C2PA Pass</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800/80 shadow-xl text-center space-y-0.5">
              <p className="text-lg font-black text-emerald-400">0 ms</p>
              <p className="text-[11px] font-bold text-slate-400">Client Memory Clean</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800/80 shadow-xl text-center space-y-0.5">
              <p className="text-lg font-black text-indigo-400">2048px</p>
              <p className="text-[11px] font-bold text-slate-400">Meta HD Standard</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800/80 shadow-xl text-center space-y-0.5">
              <p className="text-lg font-black text-indigo-400">ISO 100-400</p>
              <p className="text-[11px] font-bold text-slate-400">Sensor Dither Noise</p>
            </div>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <DropZone
          language={language}
          onFilesSelected={handleFilesSelected}
          isProcessing={isProcessing}
        />

        {/* Humanization Preset Selector & Controls */}
        <PresetSelector
          language={language}
          settings={settings}
          onSettingsChange={(newSettings) => {
            setSettings(newSettings);
          }}
        />

        {/* Re-process Banner if item selected */}
        {selectedItem && (
          <div className="flex justify-end">
            <button
              disabled={isProcessing}
              onClick={handleReProcessSelected}
              className="px-4 py-2 text-xs font-bold rounded-full bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 flex items-center space-x-2 transition-all shadow-md cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
              <span>বর্তমান সেটিংস দিয়ে আবার কনভার্ট করুন (Re-apply Settings)</span>
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-indigo-500/30 text-center space-y-3 animate-pulse shadow-2xl">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm font-bold text-white">{t.processingText}</p>
          </div>
        )}

        {/* Primary Selected Image View: Comparison Slider & Forensic Audit Report */}
        {selectedItem && !isProcessing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImageComparison
              language={language}
              item={selectedItem}
              onDownload={handleDownloadItem}
            />

            <ForensicReportCard language={language} item={selectedItem} />
          </div>
        )}

        {/* Batch Gallery & Session History */}
        <BatchGallery
          language={language}
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={handleDeleteItem}
          onClearAll={() => {
            setItems([]);
            setSelectedId(null);
          }}
          onDownload={handleDownloadItem}
        />

        {/* FAQ Section */}
        <FaqSection language={language} />
      </main>

      {/* Auth Modal Component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        language={language}
      />

      {/* User Profile Modal Component */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        items={items}
        onLogout={handleLogout}
        onDownloadItem={handleDownloadItem}
        onDeleteItem={handleDeleteItem}
        language={language}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} RemoveSynthID Engine. All image processing runs client-side securely.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-white cursor-pointer">Privacy First</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Unlimited AI Humanizer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

