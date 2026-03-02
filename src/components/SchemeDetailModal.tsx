/**
 * SchemeDetailModal — Full detail modal for a government scheme
 * Works with database bulletin items
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BulletinItem } from "./BulletinBoard";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import {
  ExternalLink,
  Calendar,
  Building2,
  Sprout,
  HardHat,
  Globe,
  ImageOff,
} from "lucide-react";
import { useState } from "react";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

const categoryFallbackImages = {
  Farmer: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
  Worker: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
  General: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
};

interface Props {
  item: BulletinItem | null;
  open: boolean;
  onClose: () => void;
}

const SchemeDetailModal = ({ item, open, onClose }: Props) => {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  if (!item) return null;

  const config = categoryConfig[item.category] || categoryConfig.General;
  const Icon = config.icon;
  const imageUrl = imgError || !item.image_url
    ? categoryFallbackImages[item.category]
    : item.image_url;

  const formattedDate = new Date(item.publish_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Hero image */}
        <div className="relative h-[200px] bg-muted overflow-hidden rounded-t-lg">
          {imgError && !item.image_url ? (
            <div className="flex items-center justify-center h-full">
              <ImageOff className="h-12 w-12 text-muted-foreground/40" />
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
          <span
            className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.colorClass} shadow-lg`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t((`filter${item.category}`) as TranslationKey)}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <DialogHeader className="space-y-1 p-0">
            <DialogTitle className="text-xl font-extrabold text-foreground leading-tight">
              {item.title}
            </DialogTitle>
          </DialogHeader>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {item.source}
            </span>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
            <p className="text-base font-medium text-foreground leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Official link */}
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-base shadow-md hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              {t("openGovPage" as TranslationKey)}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchemeDetailModal;
