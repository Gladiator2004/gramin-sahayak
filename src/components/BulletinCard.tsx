import { type NewsItem, getCategoryFallbackImage } from "@/data/api";
import { Sprout, HardHat, Globe, ImageOff, Calendar, Building2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

interface BulletinCardProps {
  item: NewsItem;
  index: number;
}

const BulletinCard = ({ item, index }: BulletinCardProps) => {
  const config = categoryConfig[item.category];
  const Icon = config.icon;
  const [imgError, setImgError] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Format date for display
  const formattedDate = new Date(item.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const imageUrl = imgError ? getCategoryFallbackImage(item.category) : item.imageUrl;

  return (
    <article
      onClick={() => navigate(`/news/${item.id}`)}
      className="group rounded-xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-fade-in overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-primary"
      style={{ animationDelay: `${index * 60}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/news/${item.id}`)}
      aria-label={t(item.titleKey as TranslationKey)}
    >
      {/* Image — reduced height ~120px */}
      <div className="relative h-[120px] bg-muted overflow-hidden">
        {imgError && !getCategoryFallbackImage(item.category) ? (
          <div className="flex items-center justify-center h-full">
            <ImageOff className="h-8 w-8 text-muted-foreground/40" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={t(item.titleKey as TranslationKey)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {/* Category badge */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${config.colorClass} shadow-md`}
        >
          <Icon className="h-3 w-3" />
          {t((`filter${item.category}`) as TranslationKey)}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-bold text-card-foreground leading-tight line-clamp-2 min-h-[2.5rem]">
          {t(item.titleKey as TranslationKey)}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {t(item.descKey as TranslationKey)}
        </p>

        {/* Date + Source */}
        <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground/70">
          <span className="inline-flex items-center gap-0.5">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          <span className="inline-flex items-center gap-0.5 truncate">
            <Building2 className="h-3 w-3" />
            {t(item.sourceKey as TranslationKey)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default BulletinCard;
