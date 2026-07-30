import React, { useState } from "react";
import { Language, User } from "../types";
import { checkEmailAddress, EmailCheckResult } from "../lib/disposableEmailChecker";
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  AlertTriangle,
  ArrowRight,
  X,
  Check,
  Building2,
  UserPlus,
  LogIn
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language
}) => {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [validationResult, setValidationResult] = useState<EmailCheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: "signup" | "login") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setValidationResult(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: "fullName" | "email" | "password") => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (field === "fullName") setFullName(e.target.value);
    if (field === "email") {
      setEmail(e.target.value);
      if (validationResult) setValidationResult(null);
    }
    if (field === "password") setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail) {
      setErrorMessage(language === "bn" ? "দয়া করে ইমেইল এড্রেস দিন।" : "Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage(language === "bn" ? "দয়া করে পাসওয়ার্ড দিন।" : "Please enter your password.");
      return;
    }

    // Check disposable email
    const emailResult = checkEmailAddress(cleanEmail);
    setValidationResult(emailResult);

    if (!emailResult.isValid || emailResult.isDisposable) {
      return;
    }

    setIsSubmitting(true);

    // Local account db fallback
    const getLocalAccounts = (): Array<{ email: string; fullName: string; passwordHash: string; domain: string }> => {
      try {
        const stored = localStorage.getItem("app_registered_accounts");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    };

    const saveLocalAccount = (acc: { email: string; fullName: string; passwordHash: string; domain: string }) => {
      try {
        const list = getLocalAccounts();
        list.push(acc);
        localStorage.setItem("app_registered_accounts", JSON.stringify(list));
      } catch (err) {
        console.warn("Failed to save local account:", err);
      }
    };

    if (mode === "signup") {
      if (!cleanName) {
        setErrorMessage(language === "bn" ? "দয়া করে আপনার সম্পূর্ণ নাম দিন।" : "Please enter your full name.");
        setIsSubmitting(false);
        return;
      }

      if (password.length < 4) {
        setErrorMessage(language === "bn" ? "পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।" : "Password must be at least 4 characters long.");
        setIsSubmitting(false);
        return;
      }

      try {
        // Try server API
        const response = await fetch("/api/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: cleanName,
            email: cleanEmail,
            password,
            domain: emailResult.domain
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || (language === "bn" ? "সাইন আপ ব্যর্থ হয়েছে।" : "Signup failed."));
        }

        saveLocalAccount({
          email: cleanEmail,
          fullName: cleanName,
          passwordHash: password,
          domain: emailResult.domain
        });

        const newUser: User = {
          email: cleanEmail,
          fullName: cleanName,
          domain: emailResult.domain,
          loggedInAt: new Date().toISOString()
        };

        localStorage.setItem("remove_synthid_user", JSON.stringify(newUser));
        setSuccessMessage(language === "bn" ? "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" : "Account created successfully!");

        setTimeout(() => {
          setIsSubmitting(false);
          onLoginSuccess(newUser);
          onClose();
        }, 500);

      } catch (err: any) {
        // Fallback for offline client mode
        const existingLocal = getLocalAccounts().find(a => a.email === cleanEmail);
        if (existingLocal) {
          setErrorMessage(language === "bn" 
            ? "এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে! দয়া করে লগইন করুন।" 
            : "An account already exists with this email. Please log in instead.");
          setIsSubmitting(false);
          return;
        }

        saveLocalAccount({
          email: cleanEmail,
          fullName: cleanName,
          passwordHash: password,
          domain: emailResult.domain
        });

        const newUser: User = {
          email: cleanEmail,
          fullName: cleanName,
          domain: emailResult.domain,
          loggedInAt: new Date().toISOString()
        };

        localStorage.setItem("remove_synthid_user", JSON.stringify(newUser));
        setSuccessMessage(language === "bn" ? "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" : "Account created successfully!");

        setTimeout(() => {
          setIsSubmitting(false);
          onLoginSuccess(newUser);
          onClose();
        }, 500);
      }

    } else {
      // LOG IN MODE
      try {
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.code === "ACCOUNT_NOT_FOUND" || response.status === 404) {
            // Check local accounts list before failing
            const localAcc = getLocalAccounts().find(a => a.email === cleanEmail);
            if (!localAcc) {
              setErrorMessage(language === "bn"
                ? "অ্যাকাউন্ট খুঁজে পাওয়া যায়নি! আপনি এখনও সাইন আপ করেননি। অনুগ্রহ করে আগে সাইন আপ করুন।"
                : "Account not found! You must sign up first before logging in.");
              setIsSubmitting(false);
              return;
            }
            if (localAcc.passwordHash !== password) {
              setErrorMessage(language === "bn" ? "ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।" : "Incorrect password!");
              setIsSubmitting(false);
              return;
            }

            const newUser: User = {
              email: localAcc.email,
              fullName: localAcc.fullName,
              domain: localAcc.domain,
              loggedInAt: new Date().toISOString()
            };
            localStorage.setItem("remove_synthid_user", JSON.stringify(newUser));
            onLoginSuccess(newUser);
            onClose();
            return;
          }

          throw new Error(data.error || (language === "bn" ? "লগইন ব্যর্থ হয়েছে।" : "Login failed."));
        }

        const loggedUser: User = {
          email: data.user.email,
          fullName: data.user.fullName || cleanEmail.split("@")[0],
          domain: data.user.domain || emailResult.domain,
          loggedInAt: data.user.loggedInAt || new Date().toISOString()
        };

        localStorage.setItem("remove_synthid_user", JSON.stringify(loggedUser));
        setSuccessMessage(language === "bn" ? "সফলভাবে লগইন হয়েছে!" : "Login successful!");

        setTimeout(() => {
          setIsSubmitting(false);
          onLoginSuccess(loggedUser);
          onClose();
        }, 500);

      } catch (err: any) {
        // Offline / fallback check
        const localAcc = getLocalAccounts().find(a => a.email === cleanEmail);
        if (!localAcc) {
          setErrorMessage(language === "bn"
            ? "অ্যাকাউন্ট খুঁজে পাওয়া যায়নি! আপনি এখনও সাইন আপ করেননি। অনুগ্রহ করে আগে 'সাইন আপ' করুন।"
            : "Account not found! You must sign up first before logging in.");
          setIsSubmitting(false);
          return;
        }

        if (localAcc.passwordHash !== password) {
          setErrorMessage(language === "bn" ? "ভুল পাসওয়ার্ড! দয়া করে আবার চেষ্টা করুন।" : "Incorrect password. Please try again.");
          setIsSubmitting(false);
          return;
        }

        const newUser: User = {
          email: localAcc.email,
          fullName: localAcc.fullName,
          domain: localAcc.domain,
          loggedInAt: new Date().toISOString()
        };

        localStorage.setItem("remove_synthid_user", JSON.stringify(newUser));
        onLoginSuccess(newUser);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop light */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-500/10">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === "signup"
              ? (language === "bn" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create Your Profile")
              : (language === "bn" ? "অ্যাকাউন্টে লগইন করুন" : "Log In to Your Profile")}
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            {mode === "signup"
              ? (language === "bn"
                  ? "প্রথমে সাইন আপ করে আপনার নিজস্ব প্রোফাইল তৈরি করুন।"
                  : "Sign up first to set up your account profile.")
              : (language === "bn"
                  ? "আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।"
                  : "Enter your registered email and password to log in.")}
          </p>
        </div>

        {/* Tab Switcher: Sign Up vs Log In */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => handleModeSwitch("signup")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              mode === "signup"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "সাইন আপ (Sign Up)" : "Sign Up"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("login")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              mode === "login"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "লগইন (Log In)" : "Log In"}</span>
          </button>
        </div>

        {/* Anti Temp-Mail Security Warning Badge */}
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px]">
              {language === "bn" ? "সিকিউর জেনুইন ইমেইল প্রটেকশন" : "Disposable Email Blocked"}
            </p>
            <p className="text-[10px] text-amber-300/80 leading-tight font-medium">
              {language === "bn"
                ? "Temp-Mail বা অস্থায়ী বার্নার ইমেইল ব্লগড। আসল ইমেইল ব্যবহার করুন।"
                : "Burner and disposable emails are blocked. Use a standard email."}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name field (Only in signup mode) */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">
                {language === "bn" ? "আপনার পুরো নাম" : "Your Full Name"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => handleInputChange(e, "fullName")}
                  placeholder={language === "bn" ? "যেমন: তানভীর আহমেদ" : "e.g. John Doe"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
              <span>{language === "bn" ? "ইমেইল এড্রেস" : "Email Address"}</span>
              <span className="text-[11px] text-indigo-400 font-semibold flex items-center space-x-1">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>{language === "bn" ? "সিকিউর" : "Secure"}</span>
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleInputChange(e, "email")}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                  validationResult?.isDisposable
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/30"
                    : validationResult?.isValid && !validationResult.isDisposable
                    ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    : "border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                }`}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              {language === "bn" ? "পাসওয়ার্ড" : "Password"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => handleInputChange(e, "password")}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Disposable Email Block Alert */}
          {validationResult && validationResult.isDisposable && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs space-y-1 animate-shake">
              <div className="flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-200">
                    {language === "bn" ? "অস্থায়ী ইমেইল ব্লকড!" : "Temporary Email Blocked!"}
                  </p>
                  <p className="text-[10px] text-rose-300/90 mt-0.5 font-medium leading-relaxed">
                    {language === "bn" ? validationResult.messageBn : validationResult.messageEn}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-100">
                  {language === "bn" ? "একটি সমস্যা হয়েছে" : "Authentication Error"}
                </p>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Success Box */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-1"
          >
            <span>
              {mode === "signup"
                ? (language === "bn" ? "অ্যাকাউন্ট তৈরি করুন (Sign Up)" : "Create Account")
                : (language === "bn" ? "লগইন করুন (Log In)" : "Log In")}
            </span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>

        {/* Footer Link to toggle mode */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-xs">
          {mode === "signup" ? (
            <p className="text-slate-400">
              {language === "bn" ? "ইতোমধ্যে অ্যাকাউন্ট আছে? " : "Already registered? "}
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                {language === "bn" ? "এখানে লগইন করুন" : "Log In here"}
              </button>
            </p>
          ) : (
            <p className="text-slate-400">
              {language === "bn" ? "আপনার অ্যাকাউন্ট নেই? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => handleModeSwitch("signup")}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                {language === "bn" ? "প্রথমে সাইন আপ করুন" : "Sign Up first"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
