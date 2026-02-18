import { useState, useEffect } from "react";
import { getNews, startAutoRefresh, stopAutoRefresh } from "@/services/newsService";
import type { NewsItem } from "@/data/api";
import BulletinCard from "./BulletinCard";
import { BulletinSkeletonGrid } from "./BulletinSkeleton";
import { Newspaper, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

type CategoryFilter = "All" | "Farmer" | "Worker" | "General";

const BulletinBoard = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const { t } = useLanguage();

  useEffect(() => {
    // Simulate network fetch delay for realistic UX
    const timer = setTimeout(() => {
      setNews(getNews());
      setLoading(false);
    }, 600);

    startAutoRefresh((freshData) => setNews(freshData));
    return () => {
      clearTimeout(timer);
      stopAutoRefresh();
    };
  }, []);

  const filters: { key: CategoryFilter; labelKey: string }[] = [
    { key: "All", labelKey: "filterAll" },
    { key: "Farmer", labelKey: "filterFarmer" },
    { key: "Worker", labelKey: "filterWorker" },
    { key: "General", labelKey: "filterGeneral" },
  ];

  const filtered = filter === "All" ? news : news.filter((n) => n.category === filter);

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-extrabold text-foreground">
            📋 {t("bulletinTitle")}
          </h2>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setNews(getNews());
              setLoading(false);
            }, 400);
          }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label={t("refresh" as TranslationKey)}
        >
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {filters.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
              filter === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t(labelKey as TranslationKey)}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && <BulletinSkeletonGrid />}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">{t("noUpdates" as TranslationKey)}</p>
        </div>
      )}

      {/* 1-column mobile, 3-column desktop */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <BulletinCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BulletinBoard;
