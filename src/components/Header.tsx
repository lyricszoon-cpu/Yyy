import React from "react";
import { Language, User } from "../types";
import { translations } from "../lib/translations";
import { ShieldCheck, Zap, User as UserIcon, LogOut, UserCheck, Users, Languages, Lock } from "lucide-react";

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenProfile?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  currentUser,
  onOpenLogin,
  onOpenProfile,
  onLogout,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-50">
      {/* Top Pro Status Banner */}
      <div className="bg-slate-950 text-slate-200 text-xs py-1.5 px-4 font-medium border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">
              {language === "bn" ? "ফেসবুক ও ইনস্টাগ্রাম AI ডিটেকশন ডিফেন্স একটিভ" : "Meta (FB & Instagram) AI Detection Defense Active"}
            </span>
            <span className="text-slate-400 hidden md:inline">• C2PA & SynthID Signal Neutralizer v2.4</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-300">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>{language === "bn" ? "১০০% ক্লায়েন্ট-সাইড প্রাইভেসি" : "100% Client-Side Memory Privacy"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Dark Glass Header */}
      <div className="backdrop-blur-xl bg-slate-900/90 border-b border-slate-800/90 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-white">
                  RemoveSynth<span className="text-indigo-400">ID</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-indigo-400" />
                  <span>v2.4 PRO</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {language === "bn" ? "এআই ওয়াটারমার্ক নিউট্রালাইজার ও ফটো হিউম্যানাইজার" : "AI Watermark Neutralizer & Photo Humanizer Engine"}
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Account Login / Profile Status */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-950 p-1.5 pl-2.5 pr-2.5 rounded-full border border-slate-800 shadow-sm">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center space-x-2 cursor-pointer group text-left"
                  title={language === "bn" ? "প্রোফাইল বিবরণী ও ইতিহাস দেখুন" : "View Profile & Processing History"}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black uppercase ring-1 ring-indigo-400/30 shrink-0 group-hover:scale-105 transition-transform">
                    {(currentUser.fullName || currentUser.email).charAt(0)}
                  </div>
                  <div className="flex flex-col max-w-[120px] sm:max-w-[160px]">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate leading-tight">
                      {currentUser.fullName || currentUser.email.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold truncate leading-tight flex items-center space-x-1">
                      <UserCheck className="w-2.5 h-2.5 inline mr-0.5 text-emerald-400" />
                      <span>{language === "bn" ? "প্রোফাইল দেখুন" : "View Profile"}</span>
                    </span>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title={language === "bn" ? "লগআউট করুন" : "Sign Out"}
                  className="p-1.5 ml-1 rounded-full bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5 text-white" />
                <span>{language === "bn" ? "সাইন আপ / লগইন" : "Sign Up / Log In"}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-full border border-slate-800">
              <button
                onClick={() => onLanguageChange("bn")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  language === "bn"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>বাংলা</span>
              </button>
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center space-x-1 ${
                  language === "en"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Languages className="w-3.5 h-3.5 mr-0.5" />
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


