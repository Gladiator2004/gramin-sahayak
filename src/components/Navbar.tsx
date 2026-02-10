import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, ShieldCheck, Info } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "Help", icon: MessageCircle },
  { path: "/verify", label: "Check", icon: ShieldCheck },
  { path: "/about", label: "About", icon: Info },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-primary px-4 py-3 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">
              Gramin Sahayak
            </h1>
          </Link>
          {/* Language dropdown — UI only for now */}
          {/* Bhashini API integration here later */}
          <select
            className="rounded-md bg-primary-foreground/20 px-2 py-1 text-sm font-semibold text-primary-foreground border-none outline-none"
            defaultValue="en"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </header>

      {/* Bottom tab bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around py-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
