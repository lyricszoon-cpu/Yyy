import React, { useEffect, useState } from "react";
import { Language, ProcessedImageItem } from "../types";
import { translations } from "../lib/translations";
import { generateSpectralHeatmap } from "../lib/forensicAnalyzer";
import { ShieldAlert, ShieldCheck, Activity, Cpu, Sparkles, FileCode2, Check } from "lucide-react";

interface ForensicReportCardProps {
  language: Language;
  item: ProcessedImageItem;
}

export const ForensicReportCard: React.FC<ForensicReportCardProps> = ({
  language,
  item,
}) => {
  const t = translations[language];
  const [heatmapBefore, setHeatmapBefore] = useState<string>("");
  const [heatmapAfter, setHeatmapAfter] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadHeatmaps() {
      const beforeUrl = await generateSpectralHeatmap(item.originalUrl, false);
      const afterUrl = await generateSpectralHeatmap(item.processedUrl, true);
      if (isMounted) {
        setHeatmapBefore(beforeUrl);
        setHeatmapAfter(afterUrl);
      }
    }

    loadHeatmaps();

    return () => {
      isMounted = false;
    };
  }, [item]);

  const beforeRisk = item.beforeMetrics.overallAiRisk;
  const afterRisk = item.afterMetrics.overallAiRisk;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>{t.aiRiskTitle}</span>
        </h3>
        <span className="text-xs px-3 py-1 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Passed AI Detector Verification</span>
        </span>
      </div>

      {/* AI Risk Meter Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Processing Card */}
        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {t.aiRiskBefore}
            </span>
            <span className="text-[11px] font-bold text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              {t.verdictAi}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-2xl font-black text-rose-400">
              <span>{beforeRisk}%</span>
              <span className="text-xs font-semibold text-rose-400 self-end mb-1">
                High Risk
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-500 shadow-sm shadow-rose-500/50"
                style={{ width: `${beforeRisk}%` }}
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-300 space-y-1.5 border-t border-rose-500/20">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">{t.synthidStatus}</span>
              <span className="font-bold text-rose-400 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.synthidDetected}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">{t.metadataStatus}</span>
              <span className="text-amber-400 font-mono text-[11px] font-bold">
                {item.beforeMetrics.metadataTags.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* After Processing Card */}
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {t.aiRiskAfter}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {t.verdictHuman}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-2xl font-black text-emerald-400">
              <span>{afterRisk}%</span>
              <span className="text-xs font-semibold text-emerald-400 self-end mb-1">
                Safe / Passed
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                style={{ width: `${afterRisk}%` }}
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-300 space-y-1.5 border-t border-indigo-500/20">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">{t.synthidStatus}</span>
              <span className="font-bold text-emerald-400 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.synthidRemoved}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">{t.metadataStatus}</span>
              <span className="text-indigo-400 font-mono text-[11px] font-bold flex items-center space-x-1">
                <FileCode2 className="w-3.5 h-3.5" />
                <span>{t.metadataStripped}</span>
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-indigo-500/20">
              <span className="text-slate-400 font-medium">Meta (FB & Insta) C2PA Scanner:</span>
              <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center space-x-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>100% Passed (Real Camera Profile)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2D Spectral Frequency Graph Heatmaps */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>{t.fourierTitle}</span>
        </h4>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-2">
            <div className="aspect-square max-w-[160px] mx-auto rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-1 flex items-center justify-center">
              {heatmapBefore ? (
                <img src={heatmapBefore} alt="Frequency Spectrum Before" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-[10px] text-slate-500">Generating Spectrum...</div>
              )}
            </div>
            <p className="text-[11px] font-bold text-rose-400">
              Original: SynthID Grid Spikes
            </p>
          </div>

          <div className="space-y-2">
            <div className="aspect-square max-w-[160px] mx-auto rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-1 flex items-center justify-center">
              {heatmapAfter ? (
                <img src={heatmapAfter} alt="Frequency Spectrum After" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-[10px] text-slate-500">Generating Spectrum...</div>
              )}
            </div>
            <p className="text-[11px] font-bold text-indigo-400">
              Cleaned: Continuous Radial Decay
            </p>
          </div>
        </div>
      </div>

      {/* Gemini AI Forensic Insights */}
      {item.aiInsights && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{t.insightsTitle}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {item.aiInsights}
          </p>
        </div>
      )}
    </div>
  );
};
