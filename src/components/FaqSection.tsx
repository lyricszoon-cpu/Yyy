import React, { useState } from "react";
import { Language } from "../types";
import { translations } from "../lib/translations";
import { HelpCircle, ChevronDown, ShieldCheck, Sparkles, Cpu } from "lucide-react";

interface FaqSectionProps {
  language: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ language }) => {
  const t = translations[language];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: t.faqQ1,
      a: t.faqA1,
      icon: Cpu,
    },
    {
      q: t.faqQ2,
      a: t.faqA2,
      icon: ShieldCheck,
    },
    {
      q: t.faqQ3,
      a: t.faqA3,
      icon: Sparkles,
    },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-2xl space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
        <HelpCircle className="w-5 h-5 text-indigo-400" />
        <h3 className="text-base font-bold text-white">{t.faqTitle}</h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const Icon = faq.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 text-left font-bold text-slate-200 hover:text-white flex items-center justify-between space-x-3 cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm">{faq.q}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${
                    isOpen ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-2 text-xs text-slate-300 border-t border-slate-800/80 leading-relaxed font-medium bg-slate-900/90">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
