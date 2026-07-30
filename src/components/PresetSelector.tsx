import React from "react";
import { Language, PresetType, ProcessingSettings } from "../types";
import { translations } from "../lib/translations";
import { Zap, Camera, Smartphone, ShieldCheck, Sliders, Settings2, Globe } from "lucide-react";

interface PresetSelectorProps {
  language: Language;
  settings: ProcessingSettings;
  onSettingsChange: (newSettings: ProcessingSettings) => void;
}

export const PRESET_CONFIGS: Record<
  PresetType,
  Omit<ProcessingSettings, "preset">
> = {
  ultra_synthid: {
    noiseIntensity: 18,
    resampleShift: 25,
    chromaticAberration: 10,
    sharpening: 20,
    compressionQuality: 96,
    outputFormat: "image/jpeg",
    stripMetadata: true,
    applyColorDither: true,
    metaSocialScale: false,
  },
  dslr_realism: {
    noiseIntensity: 45,
    resampleShift: 40,
    chromaticAberration: 35,
    sharpening: 45,
    compressionQuality: 94,
    outputFormat: "image/jpeg",
    stripMetadata: true,
    applyColorDither: true,
    metaSocialScale: false,
  },
  mobile_sensor: {
    noiseIntensity: 30,
    resampleShift: 30,
    chromaticAberration: 15,
    sharpening: 55,
    compressionQuality: 92,
    outputFormat: "image/jpeg",
    stripMetadata: true,
    applyColorDither: true,
    metaSocialScale: false,
  },
  meta_facebook_insta: {
    noiseIntensity: 48,
    resampleShift: 45,
    chromaticAberration: 28,
    sharpening: 50,
    compressionQuality: 88,
    outputFormat: "image/jpeg",
    stripMetadata: true,
    applyColorDither: true,
    metaSocialScale: true,
  },
  max_stealth: {
    noiseIntensity: 65,
    resampleShift: 60,
    chromaticAberration: 50,
    sharpening: 60,
    compressionQuality: 92,
    outputFormat: "image/jpeg",
    stripMetadata: true,
    applyColorDither: true,
    metaSocialScale: true,
  },
  custom: {
    noiseIntensity: 35,
    resampleShift: 35,
    chromaticAberration: 25,
    sharpening: 35,
    compressionQuality: 95,
    outputFormat: "image/jpeg",
    stripMetadata: true,
    applyColorDither: true,
    metaSocialScale: false,
  },
};

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  language,
  settings,
  onSettingsChange,
}) => {
  const t = translations[language];

  const presets = [
    {
      id: "ultra_synthid" as PresetType,
      title: t.presetUltraTitle,
      desc: t.presetUltraDesc,
      icon: Zap,
      badge: "Fastest",
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    },
    {
      id: "dslr_realism" as PresetType,
      title: t.presetDslrTitle,
      desc: t.presetDslrDesc,
      icon: Camera,
      badge: "Most Realistic",
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "mobile_sensor" as PresetType,
      title: t.presetMobileTitle,
      desc: t.presetMobileDesc,
      icon: Smartphone,
      badge: "Smartphone Look",
      color: "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "meta_facebook_insta" as PresetType,
      title: t.presetMetaTitle,
      desc: t.presetMetaDesc,
      icon: Globe,
      badge: "100% FB & Insta Safe",
      color: "from-blue-600/20 to-indigo-600/10 text-indigo-600 border-indigo-500/30",
    },
    {
      id: "max_stealth" as PresetType,
      title: t.presetStealthTitle,
      desc: t.presetStealthDesc,
      icon: ShieldCheck,
      badge: "Maximum Bypass",
      color: "from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      id: "custom" as PresetType,
      title: t.presetCustomTitle,
      desc: t.presetCustomDesc,
      icon: Sliders,
      badge: "Manual Control",
      color: "from-slate-500/20 to-slate-700/10 text-slate-300 border-slate-600/30",
    },
  ];

  const handleSelectPreset = (presetId: PresetType) => {
    if (presetId === "custom") {
      onSettingsChange({
        ...settings,
        preset: "custom",
      });
    } else {
      onSettingsChange({
        preset: presetId,
        ...PRESET_CONFIGS[presetId],
      });
    }
  };

  const updateField = (field: keyof ProcessingSettings, value: any) => {
    onSettingsChange({
      ...settings,
      preset: "custom",
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <span>{t.presetTitle}</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Select an optimized humanization profile or customize fine parameters
          </p>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = settings.preset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${isSelected ? "text-indigo-400" : "text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-slate-800/80 text-slate-400"}`}>
                    {p.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{p.title}</h4>
                <p className="text-[11px] text-slate-400 leading-tight font-medium">
                  {p.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fine-Tuning Controls Slider Panel */}
      <div className="pt-2">
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {t.fineTuningTitle}
            </span>
            <span className="text-xs text-indigo-400 font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Mode: {settings.preset.toUpperCase()}
            </span>
          </div>

          {/* Meta Social Optimization Feature Banner Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-md flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">
                  {t.metaSocialToggle}
                </h5>
                <p className="text-[11px] text-slate-400 font-medium">
                  Scales image to Meta long-edge limits & applies YCbCr sRGB chrominance shift for 100% FB & Instagram bypass
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
              <input
                type="checkbox"
                checked={!!settings.metaSocialScale}
                onChange={(e) => updateField("metaSocialScale", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Noise Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{t.noiseSlider}</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {settings.noiseIntensity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.noiseIntensity}
                onChange={(e) => updateField("noiseIntensity", Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Resample Shift Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{t.resampleSlider}</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {settings.resampleShift}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.resampleShift}
                onChange={(e) => updateField("resampleShift", Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Chromatic Aberration Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{t.chromaticSlider}</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {settings.chromaticAberration}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.chromaticAberration}
                onChange={(e) => updateField("chromaticAberration", Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Sharpening Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{t.sharpenSlider}</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {settings.sharpening}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sharpening}
                onChange={(e) => updateField("sharpening", Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Quality Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{t.qualitySlider}</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {settings.compressionQuality}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={settings.compressionQuality}
                onChange={(e) => updateField("compressionQuality", Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Output Format Picker */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{t.formatLabel}</span>
                <span className="font-mono text-indigo-400 font-bold uppercase">
                  {settings.outputFormat.replace("image/", "")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => updateField("outputFormat", fmt)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      settings.outputFormat === fmt
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {fmt.replace("image/", "").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
