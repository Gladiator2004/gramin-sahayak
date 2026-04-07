/**
 * WhereToGo — Static info about nearest offices, CSC centers, and helplines
 */
import { MapPin, Phone, Building2, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const WhereToGo = () => {
  const { t } = useLanguage();

  const locations = [
    {
      icon: Building2,
      titleKey: "whereCSC",
      descKey: "whereCSCDesc",
      color: "text-primary",
    },
    {
      icon: MapPin,
      titleKey: "whereGovOffice",
      descKey: "whereGovOfficeDesc",
      color: "text-accent",
    },
    {
      icon: Phone,
      titleKey: "whereHelpline",
      descKey: "whereHelplineDesc",
      color: "text-secondary",
    },
    {
      icon: Globe,
      titleKey: "whereOnline",
      descKey: "whereOnlineDesc",
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        {t("whereTitle" as TranslationKey)}
      </h3>
      <div className="space-y-2">
        {locations.map(({ icon: Icon, titleKey, descKey, color }) => (
          <div key={titleKey} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
            <div>
              <p className="text-sm font-bold text-foreground">{t(titleKey as TranslationKey)}</p>
              <p className="text-xs text-muted-foreground">{t(descKey as TranslationKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhereToGo;
