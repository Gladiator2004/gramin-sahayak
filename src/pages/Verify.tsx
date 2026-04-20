/**
 * Verify — Fact checker with WhatsApp-style UI, voice input, sample message, and share
 */
import { useState, useRef } from "react";
import {
  ShieldCheck, Search, XCircle, CheckCircle, AlertTriangle,
  Loader2, History, Clipboard, Mic, MicOff, Zap, Share2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useVoice } from "@/hooks/useVoice";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { TranslationKey } from "@/i18n/translations";
import { fetchWithRetry, friendlyErrorMessage, cacheGet, cacheSet, isRateLimited } from "@/lib/network";

interface VerifyResult {
  verdict: "true" | "false" | "uncertain";
  confidence: number;
  explanation: string;
  signals?: string[];
}

function getSessionId(): string {
  let id = localStorage.getItem("gs-session-id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("gs-session-id", id); }
  return id;
}

const sampleMessages: Record<string, string> = {
  en: "URGENT!! Government giving ₹15,000 to everyone!! Forward to 10 people to claim!! Limited time offer!! 🚨🚨🚨",
  hi: "जरूरी!! सरकार सबको ₹15,000 दे रही है!! 10 लोगों को भेजो!! सीमित समय!! 🚨🚨🚨",
  pa: "ਜ਼ਰੂਰੀ!! ਸਰਕਾਰ ਸਭ ਨੂੰ ₹15,000 ਦੇ ਰਹੀ ਹੈ!! 10 ਲੋਕਾਂ ਨੂੰ ਭੇਜੋ!! 🚨🚨🚨",
  bn: "জরুরি!! সরকার সবাইকে ₹15,000 দিচ্ছে!! 10 জনকে পাঠান!! 🚨🚨🚨",
  ta: "அவசரம்!! அரசு அனைவருக்கும் ₹15,000 தருகிறது!! 10 பேருக்கு அனுப்புங்கள்!! 🚨🚨🚨",
};

const Verify = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<VerifyResult[]>([]);
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const voice = useVoice({
    language,
    onTranscript: (transcript) => {
      setText(transcript);
      // Auto-trigger verify after voice input
      setTimeout(() => handleVerify(transcript), 500);
    },
  });

  const handleVerify = async (overrideText?: string) => {
    const checkText = (overrideText ?? text).trim();
    if (!checkText || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const VERIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify`;
      const resp = await fetch(VERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: checkText, session_id: getSessionId() }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      const data: VerifyResult = await resp.json();
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 5));
    } catch (e) {
      console.error("Verify error:", e);
      toast({ title: "Error", description: e instanceof Error ? e.message : "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = () => {
    inputRef.current?.focus();
    navigator.clipboard?.readText?.().then((clipText) => {
      if (clipText) setText(clipText);
    }).catch(() => {
      // Clipboard not available, just focus
    });
  };

  const handleSample = () => {
    const sample = sampleMessages[language] || sampleMessages.en;
    setText(sample);
    setTimeout(() => handleVerify(sample), 300);
  };

  const handleShare = () => {
    if (!result) return;
    const verdictLabel = t(verdictConfig[result.verdict].labelKey);
    const shareText = `${t("verifyTitle")}: ${verdictLabel} (${result.confidence}%)\n${result.explanation}\n\n— Gramin Sahayak`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const verdictConfig = {
    true: {
      bg: "bg-primary/10 border-primary",
      textColor: "text-primary",
      icon: <CheckCircle className="h-14 w-14 text-primary" />,
      labelKey: "verifyLikelyTrue" as const,
    },
    false: {
      bg: "bg-destructive/10 border-destructive",
      textColor: "text-destructive",
      icon: <XCircle className="h-14 w-14 text-destructive" />,
      labelKey: "verifyLikelyFalse" as const,
    },
    uncertain: {
      bg: "bg-warning/10 border-warning",
      textColor: "text-warning",
      icon: <AlertTriangle className="h-14 w-14 text-warning" />,
      labelKey: "verifyNotSure" as const,
    },
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">{t("verifyTitle")}</h2>
            <p className="text-xs opacity-80">{t("verifySubtitle")}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handlePaste}
            className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-left hover:bg-primary/10 transition-colors active:scale-[0.98]"
          >
            <div className="rounded-full bg-primary/20 p-3">
              <Clipboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{t("verifyPasteBtn" as TranslationKey)}</p>
              <p className="text-xs text-muted-foreground">{t("verifyPasteDesc" as TranslationKey)}</p>
            </div>
          </button>

          {voice.hasRecognition && (
            <button
              onClick={voice.isListening ? voice.stopListening : voice.startListening}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors active:scale-[0.98] ${
                voice.isListening
                  ? "border-destructive bg-destructive/5 animate-pulse"
                  : "border-accent/30 bg-accent/5 hover:bg-accent/10"
              }`}
            >
              <div className={`rounded-full p-3 ${voice.isListening ? "bg-destructive/20" : "bg-accent/20"}`}>
                {voice.isListening ? <MicOff className="h-6 w-6 text-destructive" /> : <Mic className="h-6 w-6 text-accent" />}
              </div>
              <div>
                <p className="text-base font-bold text-foreground">
                  {voice.isListening ? t("voiceListening" as TranslationKey) : t("verifySpeakBtn" as TranslationKey)}
                </p>
                <p className="text-xs text-muted-foreground">{t("verifySpeakDesc" as TranslationKey)}</p>
              </div>
            </button>
          )}

          <button
            onClick={handleSample}
            disabled={isLoading}
            className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-left hover:bg-secondary/10 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            <div className="rounded-full bg-secondary/20 p-3">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{t("verifySampleBtn" as TranslationKey)}</p>
              <p className="text-xs text-muted-foreground">{t("verifySampleDesc" as TranslationKey)}</p>
            </div>
          </button>
        </div>

        {/* Text Input — WhatsApp-style */}
        <div className="space-y-3">
          <div className="rounded-xl border border-input bg-card overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
              <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{t("verifyForwarded" as TranslationKey)}</span>
            </div>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("verifyPlaceholder")}
              rows={4}
              maxLength={2000}
              className="w-full bg-transparent p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={!text.trim() || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-4 text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            {isLoading ? t("verifyChecking") : t("verifyButton")}
          </button>
        </div>

        {/* Voice listening indicator */}
        {voice.isListening && (
          <div className="flex items-center justify-center gap-2 text-sm text-destructive font-semibold animate-fade-in">
            <div className="flex gap-0.5">
              {[0, 100, 200, 300, 400].map((d) => (
                <span key={d} className="h-3 w-1 rounded-full bg-destructive animate-pulse" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            {t("voiceListening" as TranslationKey)}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`animate-fade-in rounded-xl p-6 shadow-lg text-center border-2 ${verdictConfig[result.verdict].bg}`}>
            <div className="flex justify-center mb-3">{verdictConfig[result.verdict].icon}</div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">{t("verifyResult")}</h3>
            <p className={`text-lg font-bold mb-2 ${verdictConfig[result.verdict].textColor}`}>
              {t(verdictConfig[result.verdict].labelKey)}
            </p>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">{t("verifyConfidence")}: {result.confidence}%</p>
              <Progress value={result.confidence} className="h-3" />
            </div>

            <div className="rounded-lg bg-card p-4 text-left">
              <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
            </div>

            {result.signals && result.signals.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {result.signals.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {s.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            {/* Share to WhatsApp */}
            <button
              onClick={handleShare}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/30 px-5 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {t("verifyShareWhatsApp" as TranslationKey)}
            </button>
          </div>
        )}

        {/* Advice */}
        {result && (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground text-center animate-fade-in">
            <p className="font-semibold">{t("verifyAdvice")}</p>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <History className="h-4 w-4" /> {t("verifyRecentChecks")}
            </h3>
            {history.slice(1).map((h, i) => (
              <div key={i} className={`rounded-lg border p-3 text-sm ${verdictConfig[h.verdict].bg}`}>
                <span className={`font-bold ${verdictConfig[h.verdict].textColor}`}>
                  {t(verdictConfig[h.verdict].labelKey)}
                </span>
                <span className="text-muted-foreground ml-2">({h.confidence}%)</span>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">
          <p className="font-semibold mb-1">{t("verifyHow")}</p>
          <p>{t("verifyHowDesc")}</p>
        </div>
      </main>
    </div>
  );
};

export default Verify;
