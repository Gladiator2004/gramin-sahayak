import { useState } from "react";
import { verifyNews } from "@/data/api";
import { ShieldCheck, AlertTriangle, Search } from "lucide-react";

const Verify = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    status: string;
    explanation: string;
  } | null>(null);

  // ML integration here later — will use trained NLP model
  const handleVerify = () => {
    if (!text.trim()) return;
    const res = verifyNews(text);
    setResult(res);
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">🛡 Check News</h2>
            <p className="text-xs opacity-80">Verify if a news message is real or fake</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Input */}
        <div className="space-y-3">
          <label className="block text-base font-bold text-foreground">
            📝 Paste the news message below:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a WhatsApp message or news text here..."
            rows={5}
            className="w-full rounded-lg border border-input bg-background p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <button
            onClick={handleVerify}
            disabled={!text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
          >
            <Search className="h-5 w-5" />
            Check Now
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="animate-fade-in rounded-lg border-2 border-secondary bg-card p-5 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-8 w-8 text-secondary" />
              <h3 className="text-lg font-extrabold text-card-foreground">
                Result
              </h3>
            </div>
            <div className="rounded-md bg-secondary/10 p-3 mb-3">
              <p className="text-base font-bold text-foreground">
                ⚠️ {result.status}
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.explanation}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-semibold mb-1">ℹ️ How does this work?</p>
          <p>
            This is a demo version. In the future, this will use a trained ML
            model to detect fake news with high accuracy. For now, all inputs
            return a placeholder response.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Verify;
