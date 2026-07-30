import React from "react";
import { Language, ProcessedImageItem, User } from "../types";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  LogOut,
  X,
  FileCheck2,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  HardDrive
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  items: ProcessedImageItem[];
  onLogout: () => void;
  onDownloadItem: (item: ProcessedImageItem) => void;
  onDeleteItem: (id: string) => void;
  language: Language;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  items,
  onLogout,
  onDownloadItem,
  onDeleteItem,
  language
}) => {
  if (!isOpen || !currentUser) return null;

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const joinDate = currentUser.loggedInAt
    ? new Date(currentUser.loggedInAt).toLocaleDateString(
        language === "bn" ? "bn-BD" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      )
    : new Date().toLocaleDateString();

  const joinTime = currentUser.loggedInAt
    ? new Date(currentUser.loggedInAt).toLocaleTimeString(
        language === "bn" ? "bn-BD" : "en-US",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      )
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop light */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400/20">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {language === "bn" ? "ব্যবহারকারীর প্রোফাইল" : "User Profile & Dashboard"}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {language === "bn" ? "আপনার অ্যাকাউন্ট বিবরণী ও প্রক্রিয়াজাত ছবির ইতিহাস" : "Account details & processed image history"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* User Profile Card */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800/90 relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-indigo-600/25 ring-4 ring-indigo-500/10 shrink-0">
                  {(currentUser.fullName || currentUser.email).charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {currentUser.fullName || currentUser.email.split("@")[0]}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{language === "bn" ? "সক্রিয় সদস্য" : "Verified Active"}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{currentUser.email}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>
                      {language === "bn" ? "যুক্ত হয়েছেন: " : "Joined / Logged in: "}
                      <span className="text-slate-200 font-semibold">{joinDate}</span>
                      {joinTime && <span className="ml-1 text-slate-400">({joinTime})</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button in Profile Card */}
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2.5 rounded-2xl bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === "bn" ? "লগআউট করুন" : "Log Out"}</span>
              </button>
            </div>

            {/* Account Quick Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center">
                <p className="text-lg font-black text-white">{items.length}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === "bn" ? "প্রক্রিয়াজাত ছবি" : "Processed Images"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center">
                <p className="text-lg font-black text-emerald-400">100%</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === "bn" ? "SynthID রিমুভাল" : "SynthID Neutralized"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center">
                <p className="text-lg font-black text-indigo-400">
                  {currentUser.domain.toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === "bn" ? "ডোমেইন টাইপ" : "Email Provider"}
                </p>
              </div>
            </div>
          </div>

          {/* Past Processed Image Sessions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{language === "bn" ? "পূর্ববর্তী প্রক্রিয়াজাত ছবির ইতিহাস" : "Processed Image Session History"}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  {items.length}
                </span>
              </h4>
            </div>

            {items.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-300">
                  {language === "bn" ? "এখনও কোনো ছবি প্রক্রিয়াজাত করা হয়নি" : "No processed image history found"}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {language === "bn"
                    ? "আপনার প্রথম এআই ছবি ড্রপ-জোনে আপলোড করে SynthID ও C2PA ওয়াটারমার্ক মুক্ত করুন।"
                    : "Upload your AI image in the main dropzone to strip SynthID watermarks."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Thumbnail & File Details */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                        <img
                          src={item.processedUrl || item.originalUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                          {item.name}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          <span className="text-emerald-400 font-semibold flex items-center">
                            <ShieldCheck className="w-3 h-3 inline mr-0.5" />
                            {language === "bn" ? "SynthID মুক্ত" : "Cleaned"}
                          </span>
                          <span>•</span>
                          <span>{(item.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => onDownloadItem(item)}
                        title={language === "bn" ? "ডাউনলোড করুন" : "Download Clean Image"}
                        className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        title={language === "bn" ? "মুছে ফেলুন" : "Remove from History"}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-400 font-medium text-[11px] flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === "bn" ? "১০০% প্রাইভেট ক্লায়েন্ট-সাইড মেমোরি" : "100% Private Client-Side Storage"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {language === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
