import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Info } from "lucide-react";
import BulletinBoard from "@/components/BulletinBoard";

const actionButtons = [
  {
    to: "/chat",
    icon: MessageCircle,
    emoji: "💬",
    label: "Ask for Help",
    description: "Get answers to your questions",
    color: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  {
    to: "/verify",
    icon: ShieldCheck,
    emoji: "🛡",
    label: "Check News",
    description: "Verify if news is real or fake",
    color: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
  },
  {
    to: "/about",
    icon: Info,
    emoji: "ℹ️",
    label: "About App",
    description: "Learn about Gramin Sahayak",
    color: "bg-accent hover:bg-accent/90 text-accent-foreground",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen pb-24">
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Bulletin Board — shown first */}
        <BulletinBoard />

        {/* Action Buttons */}
        <section>
          <h2 className="text-xl font-extrabold text-foreground mb-4">
            🚀 Quick Actions
          </h2>
          <div className="grid gap-3">
            {actionButtons.map(({ to, emoji, label, description, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-4 rounded-lg p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${color}`}
              >
                <span className="text-3xl">{emoji}</span>
                <div>
                  <div className="text-lg font-bold">{label}</div>
                  <div className="text-sm opacity-90">{description}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-border bg-muted py-4 text-center text-sm text-muted-foreground mb-16">
        <p>🌾 Gramin Sahayak — Rural Empowerment Platform</p>
        <p className="mt-1">BTP Project • Week 1 Prototype</p>
      </footer>
    </div>
  );
};

export default Home;
