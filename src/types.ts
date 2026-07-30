export interface User {
  email: string;
  fullName?: string;
  domain: string;
  loggedInAt: string;
}

export type Language = "bn" | "en";

export type PresetType =
  | "ultra_synthid"
  | "dslr_realism"
  | "mobile_sensor"
  | "meta_facebook_insta"
  | "max_stealth"
  | "custom";

export interface ProcessingSettings {
  preset: PresetType;
  noiseIntensity: number; // 0 to 100
  resampleShift: number; // 0 to 100 (sub-pixel spatial shift)
  chromaticAberration: number; // 0 to 100
  sharpening: number; // 0 to 100
  compressionQuality: number; // 70 to 100
  outputFormat: "image/jpeg" | "image/png" | "image/webp";
  stripMetadata: boolean;
  applyColorDither: boolean;
  metaSocialScale?: boolean; // Resizes long edge to Meta 2048px/1080px HD standard & applies sRGB YCbCr chrominance shift
}

export interface ForensicMetrics {
  synthIdSignal: number; // 0% - 100%
  aiMetadataDetected: boolean;
  metadataTags: string[];
  pixelUniformityScore: number; // 0% - 100%
  overallAiRisk: number; // 0% - 100%
  verdict: "AI_GENERATED" | "SUSPECTED_AI" | "HUMAN_NATURAL";
}

export interface ProcessedImageItem {
  id: string;
  name: string;
  size: number;
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob;
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  beforeMetrics: ForensicMetrics;
  afterMetrics: ForensicMetrics;
  aiInsights?: string;
  processingTimeMs: number;
  createdAt: Date;
  status: "idle" | "processing" | "completed" | "error";
  errorMessage?: string;
}
