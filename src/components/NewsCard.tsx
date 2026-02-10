import { type NewsItem } from "@/data/api";
import { Sprout, HardHat, Globe } from "lucide-react";

const categoryConfig = {
  Farmer: { icon: Sprout, colorClass: "bg-farmer text-primary-foreground" },
  Worker: { icon: HardHat, colorClass: "bg-worker text-secondary-foreground" },
  General: { icon: Globe, colorClass: "bg-general text-accent-foreground" },
};

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

const NewsCard = ({ item, index }: NewsCardProps) => {
  const config = categoryConfig[item.category];
  const Icon = config.icon;

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-2 ${config.colorClass} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-card-foreground leading-tight">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.colorClass}`}
          >
            {item.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
