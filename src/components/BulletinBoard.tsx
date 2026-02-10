import { fetchNews } from "@/data/api";
import NewsCard from "./NewsCard";
import { Newspaper } from "lucide-react";

const BulletinBoard = () => {
  const news = fetchNews();

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-extrabold text-foreground">
          📋 Bulletin Board
        </h2>
      </div>
      <div className="grid gap-3">
        {news.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
};

export default BulletinBoard;
