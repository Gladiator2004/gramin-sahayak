import { Newspaper, Scale, ShieldAlert, Heart } from "lucide-react";

const features = [
  {
    icon: Newspaper,
    emoji: "📋",
    title: "Verified News",
    description: "Get verified government announcements and scheme updates directly.",
  },
  {
    icon: Scale,
    emoji: "⚖️",
    title: "Legal Help",
    description: "Know your rights about wages, land, and government schemes.",
  },
  {
    icon: ShieldAlert,
    emoji: "🛡",
    title: "Fake News Detection",
    description: "Check if a WhatsApp message or news is real or fake.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen pb-24">
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-2">
          <Heart className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">ℹ️ About Gramin Sahayak</h2>
            <p className="text-xs opacity-80">Empowering rural communities</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="rounded-lg bg-primary/10 p-6 text-center">
          <span className="text-5xl">🌾</span>
          <h2 className="mt-3 text-2xl font-extrabold text-foreground">
            Gramin Sahayak
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Rural Assistant — Your Digital Helper
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="text-lg font-bold text-card-foreground mb-2">
            🎯 Our Mission
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gramin Sahayak helps rural people — farmers, workers, and citizens — by
            providing easy access to verified government news, legal help, and tools
            to detect misinformation. Built for simplicity and accessibility.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">✨ What We Do</h3>
          {features.map(({ emoji, title, description }, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-sm animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl shrink-0">{emoji}</span>
              <div>
                <h4 className="font-bold text-card-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Future roadmap */}
        <div className="rounded-lg bg-muted p-5">
          <h3 className="text-base font-bold text-foreground mb-2">
            🔮 Coming Soon
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• 🗣 Voice input support (Bhashini API)</li>
            <li>• 🤖 AI-powered chatbot with real answers</li>
            <li>• 📊 ML-based fake news detection model</li>
            <li>• 🌍 Multi-language support</li>
          </ul>
        </div>

        {/* Credits */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-semibold">BTP Project — Week 1 Prototype</p>
          <p className="mt-1">Made with ❤️ for Rural India</p>
        </div>
      </main>
    </div>
  );
};

export default About;
