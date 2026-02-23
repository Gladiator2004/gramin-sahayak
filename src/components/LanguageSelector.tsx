import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { type Language, languageNames } from "@/i18n/translations";
import { Globe } from "lucide-react";

const languages: { code: Language; label: string; greeting: string }[] = [
  { code: "hi", label: "हिन्दी", greeting: "नमस्ते" },
  { code: "en", label: "English", greeting: "Hello" },
  { code: "pa", label: "ਪੰਜਾਬੀ", greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ" },
  { code: "bn", label: "বাংলা", greeting: "নমস্কার" },
  { code: "ta", label: "தமிழ்", greeting: "வணக்கம்" },
];

const LanguageSelector = () => {
  const { language, setLanguage, t, markLanguageChosen } = useLanguage();
  const [selected, setSelected] = useState<Language>(language);

  const handleContinue = () => {
    setLanguage(selected);
    markLanguageChosen();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-6 py-10 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <span className="text-5xl">🌾</span>
        </div>

        <h1 className="text-2xl font-extrabold text-foreground mb-2">
          {t("chooseLang")}
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          {t("chooseLangDesc")}
        </p>

        {/* Language buttons */}
        <div className="space-y-3 mb-8">
          {languages.map(({ code, label, greeting }) => (
            <button
              key={code}
              onClick={() => setSelected(code)}
              className={`w-full flex items-center justify-between rounded-2xl px-6 py-4 text-left transition-all border-2 ${
                selected === code
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div>
                <span className="text-xl font-bold text-foreground">{label}</span>
                <span className="ml-3 text-sm text-muted-foreground">{greeting}</span>
              </div>
              {selected === code && (
                <span className="text-primary text-xl">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          {t("continueLang")} →
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
