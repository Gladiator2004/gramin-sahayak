/**
 * EligibilityChecker — Step-by-step eligibility wizard for government schemes
 * Dynamically generates questions based on scheme eligibility keys
 */
import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import type { NewsItem } from "@/data/api";
import { Progress } from "@/components/ui/progress";

/** Map scheme IDs to their required document questions */
const schemeQuestions: Record<number, { questionKey: string; requiredDoc: string }[]> = {
  // PM Kisan
  1: [
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
    { questionKey: "eligQ_bankAccount", requiredDoc: "eligDoc_bankAccount" },
    { questionKey: "eligQ_landRecords", requiredDoc: "eligDoc_landRecords" },
  ],
  // Min Wage
  2: [
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
    { questionKey: "eligQ_employmentProof", requiredDoc: "eligDoc_employmentProof" },
  ],
  // Crop Insurance
  3: [
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
    { questionKey: "eligQ_bankAccount", requiredDoc: "eligDoc_bankAccount" },
    { questionKey: "eligQ_landRecords", requiredDoc: "eligDoc_landRecords" },
  ],
  // Ration
  4: [
    { questionKey: "eligQ_rationCard", requiredDoc: "eligDoc_rationCard" },
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
  ],
  // MGNREGA
  5: [
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
    { questionKey: "eligQ_photo", requiredDoc: "eligDoc_photo" },
  ],
  // Soil Testing
  6: [
    { questionKey: "eligQ_landRecords", requiredDoc: "eligDoc_landRecords" },
  ],
  // Ayushman
  7: [
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
    { questionKey: "eligQ_rationCard", requiredDoc: "eligDoc_rationCard" },
  ],
  // eShram
  8: [
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
    { questionKey: "eligQ_bankAccount", requiredDoc: "eligDoc_bankAccount" },
    { questionKey: "eligQ_mobile", requiredDoc: "eligDoc_mobile" },
  ],
  // Kisan Credit Card
  9: [
    { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
    { questionKey: "eligQ_landRecords", requiredDoc: "eligDoc_landRecords" },
    { questionKey: "eligQ_bankAccount", requiredDoc: "eligDoc_bankAccount" },
    { questionKey: "eligQ_photo", requiredDoc: "eligDoc_photo" },
  ],
};

// Default fallback questions if scheme not mapped
const defaultQuestions = [
  { questionKey: "eligQ_aadhaar", requiredDoc: "eligDoc_aadhaar" },
  { questionKey: "eligQ_bankAccount", requiredDoc: "eligDoc_bankAccount" },
];

interface Props {
  item: NewsItem;
  onClose: () => void;
}

const EligibilityChecker = ({ item, onClose }: Props) => {
  const { t } = useLanguage();
  const questions = schemeQuestions[item.id] || defaultQuestions;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers];
    newAnswers[step] = answer;
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const missingDocs = questions
    .filter((_, i) => answers[i] === false)
    .map((q) => q.requiredDoc);

  const isEligible = missingDocs.length === 0;
  const progress = showResult ? 100 : ((step) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">{t("eligResultTitle" as TranslationKey)}</h3>
        </div>
        <Progress value={100} className="h-2" />

        {isEligible ? (
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-5 text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <p className="text-lg font-bold text-primary">{t("eligEligible" as TranslationKey)}</p>
            <p className="text-sm text-muted-foreground">{t("eligEligibleDesc" as TranslationKey)}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-destructive" />
              <p className="text-base font-bold text-destructive">{t("eligNotEligible" as TranslationKey)}</p>
            </div>
            <p className="text-sm text-muted-foreground">{t("eligNeedDocs" as TranslationKey)}</p>
            <ul className="space-y-1.5">
              {missingDocs.map((doc) => (
                <li key={doc} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {t(doc as TranslationKey)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-muted py-3 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          {t("eligClose" as TranslationKey)}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardCheck className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">{t("eligTitle" as TranslationKey)}</h3>
      </div>

      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {t("eligStep" as TranslationKey)} {step + 1}/{questions.length}
      </p>

      <div className="rounded-xl bg-muted/50 p-5">
        <p className="text-base font-semibold text-foreground text-center mb-6">
          {t(questions[step].questionKey as TranslationKey)}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            <CheckCircle2 className="h-5 w-5" />
            {t("eligYes" as TranslationKey)}
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 py-4 text-lg font-bold text-destructive hover:bg-destructive/20 transition-colors active:scale-[0.98]"
          >
            <XCircle className="h-5 w-5" />
            {t("eligNo" as TranslationKey)}
          </button>
        </div>
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("previousPage" as TranslationKey)}
        </button>
      )}
    </div>
  );
};

export default EligibilityChecker;
