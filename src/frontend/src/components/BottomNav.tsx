import { Gamepad2, Home, Trophy, User } from "lucide-react";
import { useGame } from "../context/GameContext";

const navItems = [
  { label: "Home", icon: Home, screen: "home" as const, ocid: "nav.home.link" },
  {
    label: "Play",
    icon: Gamepad2,
    screen: "categories" as const,
    ocid: "nav.play.link",
  },
  {
    label: "Leaderboard",
    icon: Trophy,
    screen: "leaderboard" as const,
    ocid: "nav.leaderboard.link",
  },
  {
    label: "Profile",
    icon: User,
    screen: "profile" as const,
    ocid: "nav.profile.link",
  },
];

export function BottomNav() {
  const { navigate, screen } = useGame();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.screen === screen ||
            (item.screen === "categories" &&
              (screen === "difficulty" ||
                screen === "gameplay" ||
                screen === "result"));
          return (
            <button
              type="button"
              key={item.label}
              data-ocid={item.ocid}
              onClick={() => navigate(item.screen)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
              />
              <span
                className={`text-[10px] font-semibold font-ui tracking-wide ${isActive ? "text-primary" : ""}`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
